// Logic for device fingerprinting, health checks, and maintaining a trusted device registry.
import { Session } from '../models/index.js';
import crypto from 'crypto';
import GeolocationService from './GeolocationService.js';



class DeviceTrustService {
    /**
     * Generates a device fingerprint from request metadata.
     * @param {object} req - Express request object
     * @returns {string} - SHA256 hash of device characteristics
     */
    static generateFingerprint(req) {
        const components = [
            req.headers['user-agent'] || 'unknown',
            req.ip || 'unknown',
            req.headers['accept-language'] || 'unknown',
        ].join('|');
        
        return crypto.createHash('sha256').update(components).digest('hex');
    }

    /**
     * Checks if a device is recognized and trusted for a user.
     * @param {string} userId 
     * @param {string} fingerprint 
     * @returns {Promise<boolean>}
     */
    static async isDeviceTrusted(userId, fingerprint) {
        const session = await Session.findOne({
            where: {
                userId,
                deviceFingerprint: fingerprint,
                isActive: true,
            },
        });
        
        return !!session; // Returns true if an active session exists
    }

    /**
     * Registers a new device/session for a user.
     * @param {string} userId 
     * @param {object} deviceInfo - { fingerprint, ip, userAgent, location }
     * @returns {Promise<Session>}
     */
        static async registerDevice(userId, deviceInfo) {
        // Get location from IP
        const location = GeolocationService.getLocation(deviceInfo.ip);
        
        const session = await Session.create({
            userId,
            deviceFingerprint: deviceInfo.fingerprint,
            ipAddress: deviceInfo.ip,
            userAgent: deviceInfo.userAgent,
            location: location, // Store the geolocation data
            trustScore: 50,
            isActive: true,
            lastActiveAt: new Date(),
        });
        
        logger.info(`Device registered for user ${userId} from ${location?.city}, ${location?.country}`);
        
        return session;
    }


    /**
     * Revokes all sessions for a user (used for logout or security lockdown).
     */
    static async revokeAllDevices(userId) {
        await Session.update(
            { isActive: false },
            { where: { userId } }
        );
    }
}

export default DeviceTrustService;
