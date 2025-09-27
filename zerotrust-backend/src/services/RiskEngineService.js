import { Session, AuditLog } from '../models/index.js';
import { Op } from 'sequelize';
import GeolocationService from './GeolocationService.js';
import logger from '../utils/logger.js'; // ← ADD THIS LINE

class RiskEngineService {
    /**
     * Calculates a risk score for a user's current request context.
     * Score: 0 (high risk) to 100 (trusted).
     * @param {string} userId 
     * @param {object} context - { ip, deviceFingerprint, location, time }
     * @returns {Promise<number>} - Risk score
     */
    static async calculateRiskScore(userId, context) {
        let score = 50; // Baseline

        // Factor 1: Device trust
        const knownDevice = await Session.findOne({
            where: {
                userId,
                deviceFingerprint: context.deviceFingerprint,
                isActive: true,
            },
        });
        
        if (knownDevice) {
            score += 20;
        } else {
            score -= 15;
        }

        // Factor 2: Recent failed logins
        const recentFailures = await AuditLog.count({
            where: {
                userId,
                action: 'LOGIN_FAILED',
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 15 * 60 * 1000),
                },
            },
        });
        
        score -= recentFailures * 10;

        // Factor 3: Time anomaly
        const hour = new Date().getHours();
        if (hour >= 2 && hour <= 5) {
            score -= 5;
        }

        // Factor 4: IP consistency
        const recentSessions = await Session.findAll({
            where: { userId, isActive: true },
            limit: 5,
            order: [['lastActiveAt', 'DESC']],
        });
        
        const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress));
        if (uniqueIPs.size > 3) {
            score -= 10;
        }

        // Factor 5: GEOLOCATION RISK (NEW!)
        const locationPenalty = await this.analyzeLocationRisk(userId, context.ip);
        score -= locationPenalty;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Determines if an action should be allowed based on risk score.
     * @param {number} riskScore 
     * @returns {object} - { allowed: boolean, reason: string }
     */
    static evaluateAccess(riskScore) {
        if (riskScore >= 70) {
            return { allowed: true, reason: 'Trusted' };
        } else if (riskScore >= 40) {
            return { allowed: true, reason: 'Moderate risk - monitoring' };
        } else {
            return { allowed: false, reason: 'High risk - additional verification required' };
        }
    }

    /**
     * Analyze location risk
     * @param {string} userId 
     * @param {string} currentIp 
     * @returns {Promise<number>} Risk penalty (0-20)
     */
    static async analyzeLocationRisk(userId, currentIp) {
        let penalty = 0;

        const currentLocation = GeolocationService.getLocation(currentIp);
        if (!currentLocation) return 0; // Can't analyze without location

        // Get the user's last 2 sessions
        const recentSessions = await Session.findAll({
            where: { userId, isActive: true },
            order: [['lastActiveAt', 'DESC']],
            limit: 2,
        });

        if (recentSessions.length > 1) {
            const lastSession = recentSessions[1];

            if (lastSession.location) {
                // Check for different country
                if (lastSession.location.country !== currentLocation.country) {
                    penalty += 10;
                    logger.warn(`Country change detected for user ${userId}: ${lastSession.location.country} → ${currentLocation.country}`);
                }

                // Check for impossible travel
                const isImpossible = GeolocationService.detectImpossibleTravel(
                    {
                        latitude: lastSession.location.latitude,
                        longitude: lastSession.location.longitude,
                        timestamp: lastSession.lastActiveAt,
                    },
                    {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        timestamp: new Date(),
                    }
                );

                if (isImpossible) {
                    penalty += 20; // Major red flag
                    logger.error(`IMPOSSIBLE TRAVEL detected for user ${userId}`);
                }
            }
        }

        return penalty;
    }
}

export default RiskEngineService;
