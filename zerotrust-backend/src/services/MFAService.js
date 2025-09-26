import speakeasy from 'speakeasy';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

class MFAService {
    static async generateSecret(userId, email) {
        try {
            const secret = speakeasy.generateSecret({
                name: `ZeroTrust (${email})`,
                issuer: 'ZeroTrust Chat',
                length: 32,
            });

            await User.update(
                { mfaSecret: secret.base32 },
                { where: { id: userId } }
            );

            logger.info(`MFA secret generated for user ${userId}`);

 
            return {
                secret: secret.base32,
                qrCodeUrl: secret.otpauth_url,
            };
        } catch (error) {
            logger.error('Failed to generate MFA secret:', error);
            throw error;
        }
    }

    static async verifyToken(userId, token) {
        try {
            const user = await User.findByPk(userId);
            if (!user || !user.mfaSecret) {
                return false;
            }

            return speakeasy.totp.verify({
                secret: user.mfaSecret,
                encoding: 'base32',
                token: token,
                window: 2,
            });
        } catch (error) {
            logger.error('MFA verification failed:', error);
            return false;
        }
    }

    static async enableMFA(userId) {
        try {
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

            logger.info(`MFA enabled for user ${userId}`);
            return { backupCodes };
        } catch (error) {
            logger.error('Failed to enable MFA:', error);
            throw error;
        }
    }

    static async disableMFA(userId) {
        await User.update(
            {
                mfaEnabled: false,
                mfaSecret: null,
                backupCodes: null,
            },
            { where: { id: userId } }
        );

        logger.info(`MFA disabled for user ${userId}`);
    }
}

export default MFAService;
