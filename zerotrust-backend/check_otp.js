import { User } from './src/models/index.js';
import sequelize from './src/config/database.js';

async function checkOTP() {
    try {
        await sequelize.authenticate();
        
        const users = await User.findAll({
            attributes: ['email', 'emailVerified', 'emailVerificationToken', 'emailVerificationExpires'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        console.log('\n=== RECENT USERS WITH OTP ===\n');
        users.forEach(user => {
            console.log(`Email: ${user.email}`);
            console.log(`Verified: ${user.emailVerified}`);
            console.log(`OTP: ${user.emailVerificationToken}`);
            console.log(`Expires: ${user.emailVerificationExpires}`);
            console.log('---');
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkOTP();
