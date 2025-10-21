import { sequelize, User } from './src/models/index.js';

async function listUsers() {
  try {
    await sequelize.authenticate();
    
    const users = await User.findAll({
      attributes: ['email', 'username', 'createdAt']
    });
    
    console.log(`\nTotal users: ${users.length}\n`);
    users.forEach(user => {
      console.log(`- Username: ${user.username} | Email: ${user.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
