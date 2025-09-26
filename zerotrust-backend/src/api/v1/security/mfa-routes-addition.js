

/**
 * POST /api/v1/security/mfa/verify-backup
 * Verify backup code during login
 */
router.post('/mfa/verify-backup', async (req, res, next) => {
    try {
        const { backupCode, mfaToken } = req.body;

        if (!backupCode || !mfaToken) {
            return res.status(400).json({ error: 'Backup code and MFA token required' });
        }

        // Decode mfaToken
        const decoded = jwt.default.verify(mfaToken, process.env.JWT_SECRET);

        if (!decoded.mfaRequired) {
            return res.status(400).json({ error: 'Invalid MFA token' });
        }

        const userId = decoded.userId;
        const user = await User.findByPk(userId);

        if (!user || !user.backupCodes) {
            return res.status(400).json({ error: 'Invalid backup code' });
        }

        // Parse backup codes
        const codes = JSON.parse(user.backupCodes);
        const codeIndex = codes.indexOf(backupCode.toUpperCase());

        if (codeIndex === -1) {
            return res.status(400).json({ error: 'Invalid backup code' });
        }

        // Remove used backup code
        codes.splice(codeIndex, 1);
        await user.update({ backupCodes: JSON.stringify(codes) });

        // Generate access token
        const jwt = await import('jsonwebtoken');
        const accessToken = jwt.default.sign(
            { userId: user.id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await AuditLog.create({
            userId,
            action: 'MFA_BACKUP_CODE_USED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'warning',
        });

        logger.warn(`Backup code used for user ${userId}. Remaining codes: ${codes.length}`);

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
