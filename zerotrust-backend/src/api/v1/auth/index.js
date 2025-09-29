import { Router } from 'express';
import AuthService from '../../../services/AuthService.js';
import { validateRequest, Schemas } from '../../../middleware/validateRequest.js';
import jwt from 'jsonwebtoken';
import { User, AuditLog, Session } from '../../../models/index.js';
import logger from '../../../utils/logger.js';
import authenticateToken from '../../../middleware/authenticateToken.js';

const router = Router();

// Register with username
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, username } = req.body;

        // Check if username is taken
        if (username) {
            const existingUser = await User.findOne({ where: { username } });

// Verify email OTP
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

// Resend OTP
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

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        next(err);
    }
});

// Check username availability
router.post('/check-username', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username || username.length < 3) {
            return res.json({ available: false, message: 'Username must be at least 3 characters' });
        }

        const user = await User.findOne({ where: { username } });
        
        res.json({ 
            available: !user,
            message: user ? 'Username taken' : 'Username available'
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
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

        // Check if MFA is enabled
        if (user.mfaEnabled) {
            const mfaToken = jwt.sign(
                { userId: user.id, email: user.email, mfaRequired: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );

            return res.json({
                mfaRequired: true,
                mfaToken,
            });
        }

        // Regular login without MFA
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
                mfaEnabled: user.mfaEnabled,
            },
        });
    } catch (err) {
        next(err);
    }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'email', 'username', 'role', 'mfaEnabled', 'createdAt'],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// Logout
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
