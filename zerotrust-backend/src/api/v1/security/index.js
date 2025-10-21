import { Router } from 'express';
import { Session, AuditLog, User } from '../../../models/index.js';
import authenticateToken from '../../../middleware/authenticateToken.js';
import authorizeRole from '../../../middleware/authorizeRole.js';
import MFAService from '../../../services/MFAService.js';
import jwt from 'jsonwebtoken';
import DeviceTrustService from '../../../services/DeviceTrustService.js';
import RiskEngineService from '../../../services/RiskEngineService.js';
import logger from '../../../utils/logger.js';
import { Op } from 'sequelize';
import speakeasy from 'speakeasy';

const router = Router();

// GET /api/v1/security/sessions
router.get('/sessions', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const sessions = await Session.findAll({
            where: { userId, isActive: true },
            order: [['lastActiveAt', 'DESC']],
        });

        const sessionData = sessions.map(s => ({
            id: s.id,
            deviceFingerprint: s.deviceFingerprint,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            trustScore: s.trustScore,
            lastActiveAt: s.lastActiveAt,
            createdAt: s.createdAt,
        }));

        res.json({ sessions: sessionData });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/v1/security/sessions/:sessionId
router.delete('/sessions/:sessionId', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { sessionId } = req.params;

        const session = await Session.findOne({
            where: { id: sessionId, userId },
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        await session.update({ isActive: false });

        await AuditLog.create({
            userId,
            action: 'SESSION_REVOKED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata: { sessionId },
            severity: 'info',
        });

        logger.info(`Session ${sessionId} revoked by user ${userId}`);
        res.json({ message: 'Session revoked successfully' });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/security/sessions/revoke-all
router.post('/sessions/revoke-all', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        await Session.update(
            { isActive: false },
            { where: { userId, isActive: true } }
        );

        await AuditLog.create({
            userId,
            action: 'ALL_SESSIONS_REVOKED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'warning',
        });

        logger.warn(`All sessions revoked for user ${userId}`);
        res.json({ message: 'All sessions revoked successfully' });
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/security/risk-score - FIXED VERSION
router.get('/risk-score', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        const riskData = await RiskEngineService.calculateTrustScore(userId, ipAddress, userAgent);
        
        // Return flat structure that React can render
        res.json({ 
            score: riskData.score || 0,
            factors: riskData.factors || [],
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        logger.error('Risk score error:', err);
        next(err);
    }
});

// GET /api/v1/security/audit-logs
router.get('/audit-logs', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;

        const whereClause = userRole === 'admin' ? {} : { userId };

        const logs = await AuditLog.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 100,
        });

        res.json({ logs });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/security/mfa/setup
router.post('/mfa/setup', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const email = req.user.email;

        const { secret, qrCodeUrl } = await MFAService.generateSecret(userId, email);

        res.status(200).json({
            message: 'Scan this QR code with Google Authenticator',
            secret,
            qrCodeUrl,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/security/mfa/enable
router.post('/mfa/enable', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token required' });
        }

        const user = await User.findByPk(userId);
        
        if (!user || !user.mfaSecret) {
            return res.status(400).json({ error: 'MFA setup not completed. Please scan QR code first.' });
        }

        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 2,
        });

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code. Make sure your phone time is synced.' });
        }

        const backupCodes = Array.from({ length: 8 }, () =>
            Math.random().toString(36).substr(2, 8).toUpperCase()
        );

        await User.update(
            {
                mfaEnabled: true,
                backupCodes: JSON.stringify(backupCodes),
            },
            { where: { id: userId } }
        );

        await AuditLog.create({
            userId,
            action: 'MFA_ENABLED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'info',
        });

        logger.info(`MFA enabled for user ${userId}`);

        res.json({ 
            message: 'MFA enabled successfully',
            backupCodes 
        });
    } catch (err) {
        logger.error('MFA enable error:', err);
        next(err);
    }
});

// POST /api/v1/security/mfa/verify
router.post('/mfa/verify', async (req, res, next) => {
    try {
        const { token, mfaToken } = req.body;

        if (!token || !mfaToken) {
            return res.status(400).json({ error: 'Token and MFA token required' });
        }

        const decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);

        if (!decoded.mfaRequired) {
            return res.status(400).json({ error: 'Invalid MFA token' });
        }

        const userId = decoded.userId;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 2,
        });

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await AuditLog.create({
            userId,
            action: 'MFA_VERIFIED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
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

// POST /api/v1/security/mfa/verify-backup
router.post("/mfa/verify-backup", async (req, res, next) => {
    try {
        const { backupCode, mfaToken } = req.body;

        if (!backupCode || !mfaToken) {
            return res.status(400).json({ error: "Backup code and MFA token required" });
        }

        const decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);

        if (!decoded.mfaRequired) {
            return res.status(400).json({ error: "Invalid MFA token" });
        }

        const userId = decoded.userId;
        const user = await User.findByPk(userId);

        if (!user || !user.backupCodes) {
            return res.status(400).json({ error: "Invalid backup code" });
        }

        const codes = JSON.parse(user.backupCodes);
        const codeIndex = codes.indexOf(backupCode.toUpperCase());

        if (codeIndex === -1) {
            return res.status(400).json({ error: "Invalid backup code" });
        }

        codes.splice(codeIndex, 1);
        await user.update({ backupCodes: JSON.stringify(codes) });

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        await AuditLog.create({
            userId,
            action: "MFA_BACKUP_CODE_USED",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            severity: "warning",
        });

        logger.warn(`Backup code used for user ${userId}. Remaining: ${codes.length}`);

        res.json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                mfaEnabled: user.mfaEnabled,
            },
            remainingBackupCodes: codes.length,
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/v1/security/mfa/disable
router.delete('/mfa/disable', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        await MFAService.disableMFA(userId);

        await AuditLog.create({
            userId,
            action: 'MFA_DISABLED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'warning',
        });

        logger.warn(`MFA disabled for user ${userId}`);
        res.json({ message: 'MFA disabled successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;
