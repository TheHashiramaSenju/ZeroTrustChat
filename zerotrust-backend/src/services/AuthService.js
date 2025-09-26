import bcrypt from 'bcryptjs';
import { User, Session } from '../models/index.js';
import logger from '../utils/logger.js';
import AccountLockoutService from './AccountLockoutService.js';
import EmailService from './EmailService.js';

class AuthService {
    static async register(email, password) {
        try {
            const existingUser = await User.findOne({ where: { email } });

            if (existingUser) {
                return { error: { message: 'User already registered' } };
            }

            const passwordHash = await bcrypt.hash(password, 10);

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            const user = await User.create({
                email,
                passwordHash,
                emailVerified: false,
                emailVerificationToken: otp,
                emailVerificationExpires: otpExpires,
                role: 'user',
            });

            // Send OTP email
            await EmailService.sendOTPEmail(email, otp);

            logger.info(`User registered: ${email} - OTP sent`);
            return { success: true, userId: user.id };
        } catch (error) {
            logger.error('Registration error:', error);
            return { error };
        }
    }

    static async verifyEmailOTP(email, otp) {
        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return { error: { message: 'User not found' } };
            }

            if (user.emailVerified) {
                return { error: { message: 'Email already verified' } };
            }

            if (!user.emailVerificationToken || !user.emailVerificationExpires) {
                return { error: { message: 'No verification code found' } };
            }

            if (new Date() > user.emailVerificationExpires) {
                return { error: { message: 'Verification code expired' } };
            }

            if (user.emailVerificationToken !== otp) {
                return { error: { message: 'Invalid verification code' } };
            }

            // Mark email as verified
            await user.update({
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            });

            logger.info(`Email verified for user: ${email}`);
            return { success: true };
        } catch (error) {
            logger.error('Email verification error:', error);
            return { error };
        }
    }

    static async resendOTP(email) {
        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return { error: { message: 'User not found' } };
            }

            if (user.emailVerified) {
                return { error: { message: 'Email already verified' } };
            }

            // Generate new OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            await user.update({
                emailVerificationToken: otp,
                emailVerificationExpires: otpExpires,
            });

            // Send new OTP
            await EmailService.sendOTPEmail(email, otp);

            logger.info(`OTP resent to: ${email}`);
            return { success: true };
        } catch (error) {
            logger.error('Resend OTP error:', error);
            return { error };
        }
    }

    static async login(email, password, ipAddress = 'unknown', userAgent = 'unknown') {
        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return { error: { message: 'Invalid credentials' } };
            }

            // Check if email is verified
            if (!user.emailVerified) {
                return { error: { message: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' } };
            }

            // Check account lockout
            const lockoutCheck = await AccountLockoutService.checkLockout(user.id);
            if (lockoutCheck.locked) {
                return { error: { message: lockoutCheck.message } };
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.passwordHash);

            if (!isValid) {
                await AccountLockoutService.recordFailedAttempt(user.id);
                return { error: { message: 'Invalid credentials' } };
            }

            // Reset failed attempts
            await AccountLockoutService.resetFailedAttempts(user.id);

            // Create session
            const deviceFingerprint = `${ipAddress}_${userAgent}`.substring(0, 100);
            
            await Session.create({
                userId: user.id,
                deviceFingerprint,
                ipAddress,
                userAgent,
                isActive: true,
                trustScore: 100,
            });

            logger.info(`User logged in: ${email}`);
            return { success: true, user };
        } catch (error) {
            logger.error('Login error:', error);
            return { error };
        }
    }

    static async logout(userId) {
        try {
            await Session.update(
                { isActive: false },
                { where: { userId, isActive: true } }
            );

            logger.info(`User logged out: ${userId}`);
        } catch (error) {
            logger.error('Logout error:', error);
            throw error;
        }
    }

    static async getCurrentUser(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['id', 'email', 'username', 'role', 'mfaEnabled', 'createdAt'],
            });

            return { user };
        } catch (error) {
            logger.error('Get current user error:', error);
            throw error;
        }
    }
}

export default AuthService;
