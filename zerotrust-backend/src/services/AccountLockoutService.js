import { User } from '../models/index.js';
import logger from '../utils/logger.js';

class AccountLockoutService {
    static LOCKOUT_THRESHOLD = 5; // Max failed attempts
    static LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

    static async checkLockout(userId) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                return { locked: false };
            }

            // Check if account is currently locked
            if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
                const remainingTime = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
                logger.warn(`Account locked for user ${userId}. Remaining: ${remainingTime} minutes`);
                
                return {
                    locked: true,
                    message: `Account locked. Try again in ${remainingTime} minute(s).`
                };
            }

            // Unlock account if lockout period has passed
            if (user.accountLockedUntil && new Date() >= user.accountLockedUntil) {
                await user.update({
                    accountLockedUntil: null,
                    failedLoginAttempts: 0
                });
                logger.info(`Account unlocked for user ${userId}`);
            }

            return { locked: false };
        } catch (error) {
            logger.error('Check lockout error:', error);
            return { locked: false }; // Fail open for safety
        }
    }

    static async recordFailedAttempt(userId) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                return;
            }

            const failedAttempts = (user.failedLoginAttempts || 0) + 1;

            // Lock account if threshold exceeded
            if (failedAttempts >= this.LOCKOUT_THRESHOLD) {
                const lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
                
                await user.update({
                    failedLoginAttempts: failedAttempts,
                    accountLockedUntil: lockoutUntil,
                    lastFailedLoginAt: new Date()
                });

                logger.warn(`Account locked for user ${userId} after ${failedAttempts} failed attempts`);
            } else {
                await user.update({
                    failedLoginAttempts: failedAttempts,
                    lastFailedLoginAt: new Date()
                });

                logger.warn(`Failed login attempt ${failedAttempts}/${this.LOCKOUT_THRESHOLD} for user ${userId}`);
            }
        } catch (error) {
            logger.error('Record failed attempt error:', error);
        }
    }

    static async resetFailedAttempts(userId) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                return;
            }

            await user.update({
                failedLoginAttempts: 0,
                accountLockedUntil: null,
                lastFailedLoginAt: null
            });

            logger.info(`Failed login attempts reset for user ${userId}`);
        } catch (error) {
            logger.error('Reset failed attempts error:', error);
        }
    }
}

export default AccountLockoutService;
