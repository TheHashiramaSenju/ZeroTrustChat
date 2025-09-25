import sequelize from './src/config/database.js';
import './src/models/index.js';

async function testEverything() {
    try {
        console.log('Testing ZeroTrust Chat Database\n');

        await sequelize.authenticate();
        console.log('Database connected\n');

        const [users] = await sequelize.query('SELECT * FROM users');
        console.log('Users in database: ' + users.length);
        
        if (users.length > 0) {
            console.log('\nRegistered Users:');
            users.forEach(user => {
                console.log('  - ' + user.email + ' (ID: ' + user.id + ')');
                console.log('    OAuth: ' + (user.oauthProvider || 'None'));
                console.log('    MFA: ' + (user.mfaEnabled ? 'Enabled' : 'Disabled'));
                console.log('    Role: ' + user.role);
            });
        } else {
            console.log('  No users yet');
        }

        const [sessions] = await sequelize.query('SELECT * FROM sessions');
        console.log('\nActive sessions: ' + sessions.length);

        const [messages] = await sequelize.query('SELECT * FROM messages');
        console.log('Messages sent: ' + messages.length);

        const [logs] = await sequelize.query('SELECT * FROM audit_logs');
        console.log('Audit log entries: ' + logs.length);

        console.log('\nAll checks complete!');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testEverything();
