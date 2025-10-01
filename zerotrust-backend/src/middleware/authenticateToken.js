// Verifies JWT tokens from incoming requests to protect routes.
import jwt from 'jsonwebtoken';
import config from '../config/environment.js';

const authenticateToken = (req, res, next) => {
    // should be in the format "Bearer TOKEN"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token was provided
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Attach the decoded payload (which contains user info) to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // The token is invalid (expired, malformed, etc.)
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        return res.status(403).json({ error: 'Invalid token.' });
    }
};

export default authenticateToken;
