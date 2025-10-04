// Utility functions for hashing, encryption, and decryption.
import crypto from 'crypto';

/**
 * Hash a password using PBKDF2 with a randomly generated salt
 * @param {string} password - The plaintext password
 * @returns {Object} - { hash, salt }
 */
export const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
        .toString('hex');
    return { hash, salt };
};

/**
 * Verify a password against a stored hash and salt
 * @param {string} password - The plaintext password to verify
 * @param {string} storedSalt - The salt used to generate the stored hash
 * @param {string} storedHash - The stored password hash
 * @returns {boolean} - True if password matches, false otherwise
 */
export const verifyPassword = (password, storedSalt, storedHash) => {
    const hash = crypto
        .pbkdf2Sync(password, storedSalt, 100000, 64, 'sha512')
        .toString('hex');
    return hash === storedHash;
};

/**
 * Generate a cryptographically secure random token
 * @param {number} length - Number of bytes (default 32)
 * @returns {string} - Hex string token
 */
export const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a cryptographic hash of any data
 * @param {string} data - Data to hash
 * @returns {string} - SHA256 hash
 */
export const hashData = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};
