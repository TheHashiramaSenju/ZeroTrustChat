// Database configuration and connection logic (e.g., PostgreSQL with Sequelize/Knex or MongoDB with Mongoose).
//database connection pool
import { Sequelize } from 'sequelize';
import config from './environment.js';

// Initialize Sequelize with the DATABASE_URL from your .env file
const sequelize = new Sequelize(config.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Set to console.log for debugging queries in development
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Supabase - SSL Required 
        },
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

// Test the database connection @mukesh added 
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('[Database] Connection has been established successfully.');
    } catch (error) {
        console.error('[Database] Unable to connect:', error);
        process.exit(1);
    }
};

testConnection();

export default sequelize;
