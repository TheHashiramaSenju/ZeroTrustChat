import dotenv from 'dotenv';
dotenv.config();

export default {
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || 4001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
