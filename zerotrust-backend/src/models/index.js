import User from './UserModel.js';
import Message from './MessageModel.js';
import Session from './SessionModel.js';
import AuditLog from './AuditLogModel.js';
import sequelize from '../config/database.js';

// Define relationships between models
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync all models (only in development)
const syncDatabase = async () => {
    if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        console.log('[Database] All models synchronized.');
    }
};

syncDatabase();

export { User, Message, Session, AuditLog, sequelize };
