import sequelize from './src/config/database.js';

async function addEmailVerificationColumns() {
    try {
        console.log('Adding email verification columns...');
        
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "passwordResetToken" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP;
        `);
        
        console.log('✅ Email verification columns added');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addEmailVerificationColumns();
