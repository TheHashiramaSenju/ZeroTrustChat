import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                len: [3, 30],
                is: /^[a-zA-Z0-9_]+$/i, // Alphanumeric and underscore only
            },
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('guest', 'user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
        },
        mfaEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        mfaSecret: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        backupCodes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        failedLoginAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        accountLockedUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lastFailedLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        oauthProvider: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        oauthId: {
            type: DataTypes.STRING,
            allowNull: true,
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
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
    }
);

export default User;
