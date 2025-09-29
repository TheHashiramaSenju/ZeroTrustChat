import { Router } from 'express';
import { Message, User } from '../../../models/index.js';
import authenticateToken from '../../../middleware/authenticateToken.js';
import logger from '../../../utils/logger.js';

const router = Router();

// Send message (broadcast to everyone)
router.post('/send', authenticateToken, async (req, res, next) => {
    try {
        const { content } = req.body;
        const senderId = req.user.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content required' });
        }

        const message = await Message.create({
            senderId,
            content: content.trim(),
            encrypted: false,
        });

        logger.info(`Broadcast message sent by: ${senderId}`);

        res.status(201).json({
            message: 'Message sent successfully',
            messageId: message.id,
        });
    } catch (err) {
        next(err);
    }
});

// Get all messages (with sender username)
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const messages = await Message.findAll({
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'email', 'username'],
                },
            ],
            order: [['createdAt', 'ASC']],
            limit: 100,
        });

        res.json({ messages });
    } catch (err) {
        next(err);
    }
});

export default router;
