import bcrypt from 'bcryptjs';
import { Router } from 'express';
import AuthService from '../../../services/AuthService.js';
import EmailService from '../../../services/EmailService.js';
import jwt from 'jsonwebtoken';
import { User, AuditLog, Session } from '../../../models/index.js';
import logger from '../../../utils/logger.js';
import authenticateToken from '../../../middleware/authenticateToken.js';

const router = Router();

// POST /api/v1/auth/register - Register (username check only on submit)
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if username is taken (only if provided)
        if (username) {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(409).json({ error: 'Username already taken' });
            }
        }

        const { error } = await AuthService.register(email, password);

        if (error) {
            if (error.message.includes('User already registered')) {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(400).json({ error: error.message });
        }

        // Update username if provided
        if (username) {
            await User.update({ username }, { where: { email } });
        }

        logger.info(`User registered: ${email}`);
        res.status(201).json({ message: 'Registration successful! Check your email for OTP.' });
    } catch (err) {
        logger.error('Registration error:', err);
        next(err);
    }
});

// POST /api/v1/auth/verify-email
router.post("/verify-email", async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP required" });
        }

        const result = await AuthService.verifyEmailOTP(email, otp);

        if (result.error) {
            return res.status(400).json({ error: result.error.message });
        }

        res.json({ message: "Email verified successfully. You can now login." });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/auth/resend-otp
router.post("/resend-otp", async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email required" });
        }

        const result = await AuthService.resendOTP(email);

        if (result.error) {
            return res.status(400).json({ error: result.error.message });
        }

        res.json({ message: "OTP resent successfully" });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        const session = await AuthService.login(email, password, ipAddress, userAgent);

        if (session.error) {
            return res.status(401).json({ error: session.error.message });
        }

        const user = await User.findOne({ where: { email } });

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await AuditLog.create({
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            ipAddress,
            userAgent,
            severity: 'info',
        });

        res.json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/auth/google - Initiate Google OAuth
router.get('/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&response_type=code&scope=profile email&access_type=offline&prompt=consent`;
    
    logger.info('Redirecting to Google OAuth');
    res.redirect(googleAuthUrl);
});

// GET /api/v1/auth/google/callback - Handle Google OAuth callback
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            logger.error('No authorization code received');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        logger.info('Exchanging code for tokens...');

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_CALLBACK_URL,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            logger.error('Token exchange error:', tokens);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
        }

        logger.info('Getting user info from Google...');

        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const googleUser = await userResponse.json();

        logger.info('Google user:', { email: googleUser.email });

        // Find or create user
        let user = await User.findOne({ where: { email: googleUser.email } });

        if (!user) {
            logger.info('Creating new user from Google OAuth');
            user = await User.create({
                email: googleUser.email,
                username: googleUser.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5),
                emailVerified: true,
                passwordHash: await bcrypt.hash('GOOGLE_OAUTH_' + Math.random(), 10),
            });
        }

        // Create JWT token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await AuditLog.create({
            userId: user.id,
            action: 'GOOGLE_LOGIN_SUCCESS',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'info',
        });

        logger.info('OAuth successful, redirecting to frontend');

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
    } catch (err) {
        logger.error('Google OAuth error:', err);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
});

// GET /api/v1/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'email', 'username', 'role', 'createdAt'],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/auth/logout
router.post("/logout", authenticateToken, async (req, res, next) => {
    try {
        await Session.update(
            { isActive: false },
            { where: { userId: req.user.userId, isActive: true } }
        );
        
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.json({ message: 'If email exists, reset link has been sent' });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.update({
            emailVerificationToken: resetToken,
            emailVerificationExpires: resetTokenExpires,
        });

        await EmailService.sendPasswordResetEmail(email, resetToken);

        logger.info(`Password reset requested for: ${email}`);

        res.json({ message: 'If email exists, reset link has been sent' });
    } catch (err) {
        logger.error('Forgot password error:', err);
        next(err);
    }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: 'Email, token, and new password required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user || user.emailVerificationToken !== token) {
            return res.status(400).json({ error: 'Invalid reset token' });
        }

        if (new Date() > user.emailVerificationExpires) {
            return res.status(400).json({ error: 'Reset token expired' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await user.update({
            passwordHash,
            emailVerificationToken: null,
            emailVerificationExpires: null,
            failedLoginAttempts: 0,
            accountLockedUntil: null,
        });

        await AuditLog.create({
            userId: user.id,
            action: 'PASSWORD_RESET',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'info',
        });

        logger.info(`Password reset successful for: ${email}`);

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        logger.error('Reset password error:', err);
        next(err);
    }
});

export default router;
