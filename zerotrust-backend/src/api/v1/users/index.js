import { Router } from 'express';
import { User } from '../../../models/index.js';
import authenticateToken from '../../../middleware/authenticateToken.js';
import authorizeRole from '../../../middleware/authorizeRole.js';

const router = Router();

// GET /api/v1/users/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'email', 'role', 'mfaEnabled', 'emailVerified', 'avatarUrl', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/users - Get all users (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'role', 'emailVerified', 'isActive', 'createdAt']
        });
        res.json({ users });
    } catch (err) {
        next(err);
    }
});

export default router;
