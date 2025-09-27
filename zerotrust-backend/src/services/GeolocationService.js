import geoip from 'geoip-lite';
import logger from '../utils/logger.js';

class GeolocationService {
    static getLocation(ip) {
        if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return {
                country: 'XX',
                region: 'Unknown',
                city: 'Localhost',
                ll: [0, 0],
                timezone: 'UTC',
            };
        }

        try {
            const geo = geoip.lookup(ip);
            
            if (!geo) {
                logger.warn(`Geolocation failed for IP: ${ip}`);
                return null;
            }

            return {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                latitude: geo.ll[0],
                longitude: geo.ll[1],
                timezone: geo.timezone,
            };
        } catch (error) {
            logger.error(`Geolocation error for IP ${ip}:`, error);
            return null;
        }
    }

    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return Math.round(distance);
    }

    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static detectImpossibleTravel(location1, location2) {
        if (!location1 || !location2) return false;

        const distance = this.calculateDistance(
            location1.latitude,
            location1.longitude,
            location2.latitude,
            location2.longitude
        );

        const timeDiff = Math.abs(location2.timestamp - location1.timestamp) / (1000 * 60 * 60);
        const maxPossibleSpeed = 900;
        const requiredSpeed = distance / timeDiff;

        if (requiredSpeed > maxPossibleSpeed) {
            logger.warn(`Impossible travel detected: ${distance}km in ${timeDiff.toFixed(2)}h (${requiredSpeed.toFixed(0)}km/h)`);
            return true;
        }

        return false;
    }
}

export default GeolocationService;
