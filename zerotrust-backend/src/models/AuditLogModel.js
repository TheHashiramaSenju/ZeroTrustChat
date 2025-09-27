// Audit Log schema. Records critical events like logins, logouts, access changes, and errors.
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class AuditLog extends Model {}

AuditLog.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true, // Null if action performed by system
            references: {
                model: 'users',
                key: 'id',
            },
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false, // e.g., 'LOGIN', 'MESSAGE_SENT', 'ADMIN_ACTION'
        },
        resource: {
            type: DataTypes.STRING,
            allowNull: true, // What was affected (e.g., 'user:123', 'message:456')
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true, 
        },
        severity: {
            type: DataTypes.ENUM('info', 'warning', 'critical'),
            allowNull: false,
            defaultValue: 'info',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: false, // Only need createdAt
    }
);

export default AuditLog;
