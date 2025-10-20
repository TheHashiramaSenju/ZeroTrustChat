import sequelize from './src/config/database.js';

async function verifyColumns() {
    try {
        await sequelize.authenticate();
        
        const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('emailVerificationToken', 'emailVerificationExpires')
            ORDER BY column_name;
        `);
        
        console.log('\nDatabase columns:');
        console.log(results);
        
        if (results.length === 0) {
            console.log('\n❌ COLUMNS MISSING! Adding them now...');
            
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(10),
                ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP;
            `);
            
            console.log('✅ Columns added!');
        } else {
            console.log('\n✅ Columns exist!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyColumns();
