import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Message extends Model {}

Message.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        receiverId: {
            type: DataTypes.UUID,
            allowNull: true,  // ← CHANGED TO TRUE
            references: {
                model: 'users',
                key: 'id',
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        encrypted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Message',
        tableName: 'messages',
        timestamps: true,
        updatedAt: false,
    }
);

export default Message;
