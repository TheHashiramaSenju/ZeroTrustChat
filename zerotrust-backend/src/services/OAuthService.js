import { User } from '../models/index.js';
import supabase from '../config/supabaseClient.js';
import DeviceTrustService from './DeviceTrustService.js';
import RiskEngineService from './RiskEngineService.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';


class OAuthService {
    /**
     * Handle OAuth login/signup
     * Creates or updates user from OAuth provider data
     * @param {object} supabaseUser - User object from Supabase auth
     * @param {object} deviceContext - { fingerprint, ip, userAgent }
     * @returns {Promise<User>}
     */
    static async handleOAuthUser(supabaseUser, deviceContext) {
        // Extract OAuth metadata
        const provider = supabaseUser.app_metadata?.provider || 'google';
        const providerId = supabaseUser.id; // Supabase uses consistent user IDs
        const email = supabaseUser.email;
        const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;

        // Check if user exists (by OAuth provider ID or email)
        let user = await User.findOne({
            where: {
                [Op.or]: [
                    { oauthProviderId: providerId },
                    { email: email },
                ],
            },
        });

        if (user) {
            // Update existing user
            user.oauthProvider = provider;
            user.oauthProviderId = providerId;
            user.emailVerified = true; // OAuth emails are always verified
            user.avatarUrl = avatarUrl;
            user.lastLoginAt = new Date();
            await user.save();

            logger.info(`OAuth user ${email} logged in via ${provider}`);
        } else {
            // Create new user from OAuth
            user = await User.create({
                email,
                oauthProvider: provider,
                oauthProviderId: providerId,
                emailVerified: true,
                avatarUrl,
                role: 'user',
                isActive: true,
                lastLoginAt: new Date(),
            });

            logger.info(`New OAuth user created: ${email} via ${provider}`);
        }

        // Register device and calculate risk
        await DeviceTrustService.registerDevice(user.id, {
            fingerprint: deviceContext.fingerprint,
            ip: deviceContext.ip,
            userAgent: deviceContext.userAgent,
            location: null, // Will add geolocation next
        });

        const riskScore = await RiskEngineService.calculateRiskScore(user.id, deviceContext);
        logger.info(`OAuth login risk score for ${email}: ${riskScore}`);

        return user;
    }

    /**
     * Link an OAuth provider to an existing password-based account
     * @param {string} userId 
     * @param {object} supabaseUser 
     */
    static async linkOAuthProvider(userId, supabaseUser) {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        const provider = supabaseUser.app_metadata?.provider || 'google';
        const providerId = supabaseUser.id;

        user.oauthProvider = provider;
        user.oauthProviderId = providerId;
        user.emailVerified = true;
        await user.save();

        logger.info(`OAuth provider ${provider} linked to user ${user.email}`);
    }
}

export default OAuthService;
