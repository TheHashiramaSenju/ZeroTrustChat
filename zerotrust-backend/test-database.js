import sequelize from './src/config/database.js';
import './src/models/index.js';

async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const [results] = await sequelize.query('SELECT * FROM Users');
    console.log(`\n📊 Total users in database: ${results.length}`);
    
    results.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDatabase();
