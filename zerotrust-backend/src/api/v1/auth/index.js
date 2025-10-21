import bcrypt from 'bcryptjs';
import { Router } from 'express';
import AuthService from '../../../services/AuthService.js';
import jwt from 'jsonwebtoken';
import { User, AuditLog, Session } from '../../../models/index.js';
import logger from '../../../utils/logger.js';
import authenticateToken from '../../../middleware/authenticateToken.js';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const { error } = await AuthService.register(email, password);

        if (error) {
            if (error.message.includes('already registered')) {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(400).json({ error: error.message });
        }

        if (username) {
            await User.update({ username }, { where: { email } });
        }

        logger.info(`✅ User registered: ${email}`);
        res.status(201).json({ message: 'Registration successful! Check your email for OTP.' });
    } catch (err) {
        logger.error('Registration error:', err);
        next(err);
    }
});

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

router.get('/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&response_type=code&scope=profile email&access_type=offline&prompt=consent`;
    logger.info('🔄 Redirecting to Google OAuth');
    res.redirect(googleAuthUrl);
});

// FIXED: Google OAuth callback - Creates user WITHOUT password requirement
router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            logger.error('❌ No OAuth code received');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        logger.info('🔄 Exchanging OAuth code for tokens...');

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
            logger.error('❌ Token exchange failed:', tokens);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
        }

        logger.info('✅ Getting user info from Google...');

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const googleUser = await userResponse.json();
        logger.info('✅ Google user:', { email: googleUser.email, name: googleUser.name });

        // Find or create user (NO PASSWORD NEEDED FOR OAUTH USERS)
        let user = await User.findOne({ where: { email: googleUser.email } });

        if (!user) {
            logger.info('🆕 Creating new OAuth user...');
            user = await User.create({
                email: googleUser.email,
                username: googleUser.name?.replace(/\s+/g, '_').toLowerCase() || googleUser.email.split('@')[0],
                emailVerified: true,
                passwordHash: await bcrypt.hash('GOOGLE_OAUTH_NO_PASSWORD_' + Date.now(), 10),
            });
            logger.info('✅ OAuth user created:', { id: user.id, email: user.email });
        } else {
            logger.info('✅ Existing user found:', { id: user.id, email: user.email });
        }

        // Create JWT
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

        logger.info('✅ OAuth complete, redirecting to chat...');

        // REDIRECT DIRECTLY TO CHAT WITH TOKEN
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
    } catch (err) {
        logger.error('❌ OAuth error:', err);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
});

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

export default router;
