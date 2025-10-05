// Manages E2EE logic, key generation, and secure key exchange/storage.
import crypto from 'crypto';

class EncryptionService {
    /**
     * Generates a new 256-bit encryption key.
     * @returns {string} - Hex-encoded key
     */
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Encrypts plaintext using AES-256-CBC.
     * @param {string} plaintext - The message content
     * @param {string} key - 64-character hex key
     * @returns {string} - Format: "iv:encryptedData" (both hex)
     */
    static encrypt(plaintext, key) {
        const iv = crypto.randomBytes(16); // Initialization vector
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Return IV and encrypted data, separated by colon
        return `${iv.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypts ciphertext.
     * @param {string} ciphertext - Format: "iv:encryptedData"
     * @param {string} key - 64-character hex key
     * @returns {string} - Original plaintext
     */
    static decrypt(ciphertext, key) {
        const [ivHex, encryptedHex] = ciphertext.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        
        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

export default EncryptionService;
