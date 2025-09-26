// Session schema. Tracks active user sessions, devices, IP addresses, and last activity.
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Session extends Model {}

Session.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        deviceFingerprint: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        location: {
            type: DataTypes.JSONB,
            allowNull: true, // Store { country, city, coordinates }
        },
        trustScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50, // Scale of 0-100
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        lastActiveAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Session',
        tableName: 'sessions',
        timestamps: true,
    }
);

export default Session;
