import { User, AuditLog } from '../models/index.js';
import logger from '../utils/logger.js';

class AccountLockoutService {
    static MAX_FAILED_ATTEMPTS = 5;
    static LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
    static RESET_WINDOW_MS = 30 * 60 * 1000; // Reset counter

    /**
     * Check if an account is currently locked
     * @param {string} email 
     * @returns {Promise<{ isLocked: boolean, lockedUntil: Date | null }>}
     */
    static async isAccountLocked(email) {
        const user = await User.findOne({ where: { email } });

        if (!user || !user.accountLockedUntil) {
            return { isLocked: false, lockedUntil: null };
        }

        const now = new Date();
        
        // Check if lockout period has expired
        if (user.accountLockedUntil > now) {
            return { isLocked: true, lockedUntil: user.accountLockedUntil };
        }

        // Lockout expired, unlock the account
        await this.unlockAccount(email);
        return { isLocked: false, lockedUntil: null };
    }

    /**
     * Record a failed login attempt
     * @param {string} email 
     * @param {string} ipAddress 
     * @param {string} userAgent 
     * @returns {Promise<{ locked: boolean, attemptsRemaining: number }>}
     */
    static async recordFailedAttempt(email, ipAddress, userAgent) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Don't reveal whether account exists (security best practice)
            logger.warn(`Failed login attempt for non-existent email: ${email} from ${ipAddress}`);
            return { locked: false, attemptsRemaining: this.MAX_FAILED_ATTEMPTS };
        }

        const now = new Date();

        // Reset counter if last failure was more than 30 minutes ago
        if (user.lastFailedLoginAt) {
            const timeSinceLastFailure = now - user.lastFailedLoginAt;
            if (timeSinceLastFailure > this.RESET_WINDOW_MS) {
                user.failedLoginAttempts = 0;
            }
        }

        // Increment 
        user.failedLoginAttempts += 1;
        user.lastFailedLoginAt = now;

        const attemptsRemaining = this.MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;

        // Check if account should be locked
        if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
            user.accountLockedUntil = new Date(now.getTime() + this.LOCKOUT_DURATION_MS);
            await user.save();

            // critical audit log
            await AuditLog.create({
                userId: user.id,
                action: 'ACCOUNT_LOCKED',
                ipAddress,
                userAgent,
                metadata: { 
                    failedAttempts: user.failedLoginAttempts,
                    lockedUntil: user.accountLockedUntil,
                },
                severity: 'critical',
            });

            logger.error(`Account locked for user ${user.email} due to ${user.failedLoginAttempts} failed attempts`);

            return { locked: true, attemptsRemaining: 0 };
        }

        await user.save();

        logger.warn(`Failed login attempt ${user.failedLoginAttempts}/${this.MAX_FAILED_ATTEMPTS} for ${email}`);

        return { locked: false, attemptsRemaining };
    }

    /**
     * Reset failed attempts on successful login
     * @param {string} email 
     */
    static async resetFailedAttempts(email) {
        const user = await User.findOne({ where: { email } });

        if (user) {
            user.failedLoginAttempts = 0;
            user.lastFailedLoginAt = null;
            user.accountLockedUntil = null;
            await user.save();

            logger.info(`Failed login attempts reset for ${email}`);
        }
    }

    /**
     * Manually unlock an account (admin action)
     * @param {string} email 
     */
    static async unlockAccount(email) {
        const user = await User.findOne({ where: { email } });

        if (user) {
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = null;
            user.lastFailedLoginAt = null;
            await user.save();

            await AuditLog.create({
                userId: user.id,
                action: 'ACCOUNT_UNLOCKED',
                severity: 'warning',
            });

            logger.info(`Account manually unlocked for ${email}`);
        }
    }

    /**
     * Get remaining time until unlock (in seconds)
     * @param {Date} lockedUntil 
     * @returns {number}
     */
    static getTimeUntilUnlock(lockedUntil) {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((lockedUntil - now) / 1000));
        return remaining;
    }
}

export default AccountLockoutService;
