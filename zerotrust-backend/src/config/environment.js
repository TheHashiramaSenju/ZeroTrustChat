import 'dotenv/config';

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4001', 10),
  
  // Clean the CORS_ORIGIN - remove any quotes or brackets
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .trim()
    .replace(/^["'\[]/, '')  // Remove leading quotes or brackets
    .replace(/["'\]]$/, ''), // Remove trailing quotes or brackets
    
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .trim()
    .replace(/^["'\[]/, '')
    .replace(/["'\]]$/, ''),
    
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
};

export default config;
