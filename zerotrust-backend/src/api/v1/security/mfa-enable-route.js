// Add this to your security routes

router.post('/mfa/enable', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { token } = req.body;

        console.log('MFA Enable attempt:', { userId, token });

        // Get user with secret
        const user = await User.findByPk(userId);
        console.log('User secret exists:', !!user.mfaSecret);
        console.log('User secret:', user.mfaSecret);

        if (!user || !user.mfaSecret) {
            return res.status(400).json({ error: 'MFA setup not completed' });
        }

        // Verify token
        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 2, // Allow 2 time steps before/after
        });

        console.log('Token valid:', isValid);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Enable MFA
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

        res.json({ 
            message: 'MFA enabled successfully',
            backupCodes 
        });
    } catch (err) {
        console.error('MFA enable error:', err);
        next(err);
    }
});
