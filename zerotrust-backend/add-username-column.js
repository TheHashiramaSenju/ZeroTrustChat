import sequelize from './src/config/database.js';

async function addUsernameColumn() {
    try {
        console.log('Adding username column to users table...');
        
        // Add username column
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS username VARCHAR(30) UNIQUE;
        `);
        
        console.log('✅ Username column added');
        
        // Generate usernames for existing users
        await sequelize.query(`
            UPDATE users 
            SET username = CONCAT('user_', substring(id::text, 1, 8))
            WHERE username IS NULL;
        `);
        
        console.log('✅ Generated usernames for existing users');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addUsernameColumn();
