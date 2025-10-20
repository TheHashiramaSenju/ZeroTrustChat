import { Session, AuditLog } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

class RiskEngineService {
    static async calculateTrustScore(sessionId, userId, ipAddress, userAgent) {
        try {
            let score = 100;
            const factors = [];

            const deviceScore = await this.checkDeviceConsistency(userId, ipAddress, userAgent);
            score -= (30 - deviceScore);
            factors.push({ factor: 'Device Consistency', score: deviceScore, max: 30 });

            const patternScore = await this.checkLoginPatterns(userId);
            score -= (25 - patternScore);
            factors.push({ factor: 'Login Patterns', score: patternScore, max: 25 });

            const geoScore = await this.checkGeographicAnomaly(userId, ipAddress);
            score -= (20 - geoScore);
            factors.push({ factor: 'Geographic Location', score: geoScore, max: 20 });

            const timeScore = await this.checkTimePatterns(userId);
            score -= (15 - timeScore);
            factors.push({ factor: 'Time Patterns', score: timeScore, max: 15 });

            const securityScore = await this.checkSecurityEvents(userId);
            score -= (10 - securityScore);
            factors.push({ factor: 'Security Events', score: securityScore, max: 10 });

            score = Math.max(0, Math.min(100, score));

            logger.info(`Trust score calculated for user ${userId}: ${score}/100`, { factors });

            return { score, factors };
        } catch (error) {
            logger.error('Trust score calculation error:', error);
            return { score: 75, factors: [] };
        }
    }

    static async checkDeviceConsistency(userId, ipAddress, userAgent) {
        try {
            const recentSessions = await Session.findAll({
                where: {
                    userId,
                    createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                },
                limit: 10,
                order: [['createdAt', 'DESC']]
            });

            if (recentSessions.length === 0) return 15;

            const matchingDevices = recentSessions.filter(s => 
                s.ipAddress === ipAddress || s.userAgent === userAgent
            );

            const consistency = (matchingDevices.length / recentSessions.length) * 30;
            return Math.round(consistency);
        } catch (error) {
            logger.error('Device consistency check error:', error);
            return 15;
        }
    }

    static async checkLoginPatterns(userId) {
        try {
            const loginLogs = await AuditLog.findAll({
                where: {
                    userId,
                    action: { [Op.in]: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] },
                    createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                },
                order: [['createdAt', 'DESC']]
            });

            if (loginLogs.length === 0) return 12;

            const failedLogins = loginLogs.filter(log => log.action === 'LOGIN_FAILED').length;
            const successLogins = loginLogs.filter(log => log.action === 'LOGIN_SUCCESS').length;

            if (failedLogins > successLogins) return 10;

            return Math.min(25, 15 + successLogins * 2);
        } catch (error) {
            logger.error('Login pattern check error:', error);
            return 12;
        }
    }

    static async checkGeographicAnomaly(userId, ipAddress) {
        try {
            const ipPrefix = ipAddress.split('.').slice(0, 2).join('.');

            const recentSessions = await Session.findAll({
                where: {
                    userId,
                    createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                },
                limit: 5
            });

            if (recentSessions.length === 0) return 10;

            const matchingRegions = recentSessions.filter(s => 
                s.ipAddress && s.ipAddress.startsWith(ipPrefix)
            );

            const consistency = (matchingRegions.length / recentSessions.length) * 20;
            return Math.round(consistency);
        } catch (error) {
            logger.error('Geographic check error:', error);
            return 10;
        }
    }

    static async checkTimePatterns(userId) {
        try {
            const currentHour = new Date().getHours();

            const recentLogins = await AuditLog.findAll({
                where: {
                    userId,
                    action: 'LOGIN_SUCCESS',
                    createdAt: { [Op.gte]: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
                },
                limit: 20
            });

            if (recentLogins.length < 3) return 7;

            const loginHours = recentLogins.map(log => new Date(log.createdAt).getHours());
            const avgHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length;

            const deviation = Math.abs(currentHour - avgHour);

            if (deviation < 3) return 15;
            if (deviation < 6) return 10;
            return 5;
        } catch (error) {
            logger.error('Time pattern check error:', error);
            return 7;
        }
    }

    static async checkSecurityEvents(userId) {
        try {
            // Just count failed logins as security events
            const securityEvents = await AuditLog.findAll({
                where: {
                    userId,
                    action: 'LOGIN_FAILED',
                    createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
            });

            if (securityEvents.length === 0) return 10;

            return Math.max(0, 10 - securityEvents.length * 2);
        } catch (error) {
            logger.error('Security event check error:', error);
            return 5;
        }
    }

    static async updateSessionTrustScore(sessionId, userId, ipAddress, userAgent) {
        try {
            const { score, factors } = await this.calculateTrustScore(sessionId, userId, ipAddress, userAgent);

            await Session.update(
                { trustScore: score },
                { where: { id: sessionId } }
            );

            logger.info(`Session ${sessionId} trust score updated to ${score}`);

            return { score, factors };
        } catch (error) {
            logger.error('Update session trust score error:', error);
            return { score: 75, factors: [] };
        }
    }
}

export default RiskEngineService;
