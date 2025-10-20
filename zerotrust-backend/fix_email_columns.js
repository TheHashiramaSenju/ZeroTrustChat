import sequelize from './src/config/database.js';

async function addEmailColumns() {
    try {
        console.log('Adding email verification columns...');
        
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(10),
            ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP;
        `);
        
        console.log('✅ Email verification columns added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addEmailColumns();
