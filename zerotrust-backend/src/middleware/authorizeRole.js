// Checks user roles (RBAC) and context (ABAC) for authorization.
/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 * It checks if the user's role (attached by authenticateToken) is in the list of allowed roles.
 * @param {Array<string>} allowedRoles - An array of role strings (e.g., ['admin', 'user']).
 */
const authorizeRole = (allowedRoles = []) => {
    return (req, res, next) => {
        // This middleware assumes `authenticateToken` has already run and attached `req.user`.
        if (!req.user) {
            // This case should ideally not be hit if authenticateToken is used correctly.
            return res.status(401).json({ error: 'Authentication required.' });
        }

        // Supabase JWTs include the role. 
        const userRole = req.user.role || 'guest';

        if (allowedRoles.includes(userRole)) {
            // proceed to the route handler.
            next();
        } else {
            // else
            return res.status(403).json({ error: 'Forbidden. You do not have sufficient permissions.' });
        }
    };
};

export default authorizeRole;
