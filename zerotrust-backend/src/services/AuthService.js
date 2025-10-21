import bcrypt from 'bcrypt';
import { User, Session } from '../models/index.js';
import logger from '../utils/logger.js';
import AccountLockoutService from './AccountLockoutService.js';
import EmailService from './EmailService.js';
import RiskEngineService from './RiskEngineService.js';

class AuthService {
    static async register(email, password) {
        try {
            const existingUser = await User.findOne({ where: { email } });

            if (existingUser) {
                if (!existingUser.emailVerified) {
                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

                    await existingUser.update({
                        emailVerificationToken: otp,
                        emailVerificationExpires: otpExpires,
                    });

                    await EmailService.sendOTPEmail(email, otp);

                    logger.info(`Existing unverified user - OTP resent: ${email} - OTP: ${otp}`);
                    return { success: true, userId: existingUser.id, message: 'Check your email for verification code' };
                }

                return { error: { message: 'User already registered and verified' } };
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            const user = await User.create({
                email,
                passwordHash,
                emailVerified: false,
                emailVerificationToken: otp,
                emailVerificationExpires: otpExpires,
                role: 'user',
            });

            await EmailService.sendOTPEmail(email, otp);

            logger.info(`User registered: ${email} - OTP sent: ${otp}`);
            return { success: true, userId: user.id };
        } catch (error) {
            logger.error('Registration error:', error);
            return { error };
        }
    }

    static async verifyEmailOTP(email, otp) {
        try {
            const user = await User.findOne({ where: { email } });

            logger.info(`OTP Verification attempt for: ${email}`);
            logger.info(`Received OTP: "${otp}" (type: ${typeof otp})`);
            logger.info(`Stored OTP: "${user?.emailVerificationToken}" (type: ${typeof user?.emailVerificationToken})`);

            if (!user) {
                logger.warn('User not found');
                return { error: { message: 'User not found' } };
            }

            if (user.emailVerified) {
                logger.warn('Email already verified');
                return { error: { message: 'Email already verified' } };
            }

            if (!user.emailVerificationToken || !user.emailVerificationExpires) {
                logger.warn('No verification code found');
                return { error: { message: 'No verification code found. Please register again.' } };
            }

            if (new Date() > user.emailVerificationExpires) {
                logger.warn('Verification code expired');
                return { error: { message: 'Verification code expired. Please request a new code.' } };
            }

            const receivedOTP = String(otp).trim();
            const storedOTP = String(user.emailVerificationToken).trim();

            if (receivedOTP !== storedOTP) {
                logger.warn(`OTP mismatch! Received: "${receivedOTP}" vs Stored: "${storedOTP}"`);
                return { error: { message: 'Invalid verification code' } };
            }

            await user.update({
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            });

            logger.info(`Email verified successfully for user: ${email}`);
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

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            await user.update({
                emailVerificationToken: otp,
                emailVerificationExpires: otpExpires,
            });

            await EmailService.sendOTPEmail(email, otp);

            logger.info(`OTP resent to: ${email} - New OTP: ${otp}`);
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
                logger.warn(`Login attempt for non-existent user: ${email}`);
                return { error: { message: 'Invalid email or password' } };
            }

            if (user.passwordHash) {
                logger.info(`Attempting login for: ${email}`);
                logger.info(`Comparing input password="${password}" against stored hash="${user.passwordHash}"`);

                const isValid = await bcrypt.compare(password, user.passwordHash);
                logger.info(`bcrypt.compare result: ${isValid}`);

                if (!isValid) {
                    await AccountLockoutService.recordFailedAttempt(user.id);
                    logger.warn(`Invalid password for: ${email} (input "${password}", hash "${user.passwordHash}")`);
                    return { error: { message: 'Invalid email or password' } };
                }
            } 


            const lockoutCheck = await AccountLockoutService.checkLockout(user.id);
            if (lockoutCheck.locked) {
                return { error: { message: lockoutCheck.message } };
            }

            if (user.passwordHash) {
                const isValid = await bcrypt.compare(password, user.passwordHash);

                if (!isValid) {
                    await AccountLockoutService.recordFailedAttempt(user.id);
                    logger.warn(`Invalid password attempt for: ${email}`);
                    return { error: { message: 'Invalid email or password' } };
                }
            } else {
                return { error: { message: 'This account uses Google Sign-In' } };
            }

            await AccountLockoutService.resetFailedAttempts(user.id);

            const deviceFingerprint = `${ipAddress}_${userAgent}`.substring(0, 100);
            
            const session = await Session.create({
                userId: user.id,
                deviceFingerprint,
                ipAddress,
                userAgent,
                isActive: true,
                trustScore: 50,
            });

            // Calculate real trust score
            const { score } = await RiskEngineService.updateSessionTrustScore(
                session.id,
                user.id,
                ipAddress,
                userAgent
            );

            logger.info(`User logged in successfully: ${email} - Trust score: ${score}/100`);
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
                attributes: ['id', 'email', 'username', 'role', 'mfaEnabled', 'emailVerified', 'createdAt'],
            });

            return { user };
        } catch (error) {
            logger.error('Get current user error:', error);
            throw error;
        }
    }
}

export default AuthService;
