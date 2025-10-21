import 'dotenv/config';

const cleanEnvVar = (value, fallback = '') => {
  if (!value) return fallback;
  return String(value)
    .trim()
    .replace(/^["'\[\]]+/, '')
    .replace(/["'\[\]]+$/, '')
    .replace(/\\n/g, '');
};

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4001', 10),
  
  CORS_ORIGIN: cleanEnvVar(process.env.CORS_ORIGIN, 'https://zerotrustchatapp.xyz'),
  FRONTEND_URL: cleanEnvVar(process.env.FRONTEND_URL, 'https://zerotrustchatapp.xyz'),
    
  DATABASE_URL: cleanEnvVar(process.env.DATABASE_URL),
  JWT_SECRET: cleanEnvVar(process.env.JWT_SECRET),
  JWT_REFRESH_SECRET: cleanEnvVar(process.env.JWT_REFRESH_SECRET),
  
  RESEND_API_KEY: cleanEnvVar(process.env.RESEND_API_KEY),
  
  EMAIL_USER: cleanEnvVar(process.env.EMAIL_USER),
  EMAIL_PASSWORD: cleanEnvVar(process.env.EMAIL_PASSWORD),
  
  SUPABASE_URL: cleanEnvVar(process.env.SUPABASE_URL),
  SUPABASE_KEY: cleanEnvVar(process.env.SUPABASE_KEY),
  GOOGLE_CLIENT_ID: cleanEnvVar(process.env.GOOGLE_CLIENT_ID, 'temp'),
  GOOGLE_CLIENT_SECRET: cleanEnvVar(process.env.GOOGLE_CLIENT_SECRET, 'temp'),
  GOOGLE_CALLBACK_URL: cleanEnvVar(process.env.GOOGLE_CALLBACK_URL),
};

if (config.NODE_ENV === 'production') {
  console.log('CORS_ORIGIN configured as:', config.CORS_ORIGIN);
}

export default config;
