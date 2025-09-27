import sequelize from './src/config/database.js';

async function fixDatabase() {
    try {
        console.log('Fixing database schema...');
        
        // Drop messages table
        await sequelize.query('DROP TABLE IF EXISTS messages CASCADE;');
        console.log('✅ Dropped messages table');
        
        // Recreate with proper schema
        await sequelize.query(`
            CREATE TABLE messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "receiverId" UUID REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                encrypted BOOLEAN NOT NULL DEFAULT false,
                "isRead" BOOLEAN NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ Recreated messages table with NULL receiverId allowed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixDatabase();
