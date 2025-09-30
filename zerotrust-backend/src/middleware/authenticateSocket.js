import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import supabase from '../config/supabaseClient.js';

/**
 * Socket.IO middleware to authenticate a connection using a JWT.
 * The token is expected to be passed in the `auth.token` property of the socket handshake.
 */


const authenticateSocket = async (socket, next) => {
    // 1. Get the token from the handshake query
    const token = socket.handshake.auth.token;

    if (!token) {
        // No token provided, refuse connection
        return next(new Error('Authentication error: No token provided.'));
    }

    try {
        // 2. Verify the JWT
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // 3. (Optional but recommended) Check if the user still exists and is valid
        const { data: user, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return next(new Error('Authentication error: User not found or invalid.'));
        }

        // 4. Attach user information to the socket object for use in event handlers
        socket.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        
        // 5. Authentication successful, allow the connection
        next();
    } catch (err) {
        // Token is invalid (expired, malformed, etc.)
        console.error('Socket authentication failed:', err.message);
        return next(new Error('Authentication error: Invalid token.'));
    }
};

export default authenticateSocket;
