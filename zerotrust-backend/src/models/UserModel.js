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
            type: DataTypes.STRING(30),
            allowNull: true,
            unique: true,
            validate: {
                len: [3, 30],
                is: /^[a-zA-Z0-9_]+$/i,
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
        emailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        emailVerificationToken: {
            type: DataTypes.STRING(10),
            allowNull: true,
            field: 'emailVerificationToken'
        },
        emailVerificationExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'emailVerificationExpires'
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
        underscored: false, // Use camelCase not snake_case
    }
);

export default User;
