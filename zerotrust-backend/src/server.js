import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/environment.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { initializeSocket } from './socket.js';
import logger from './utils/logger.js';
import { sequelize } from './models/index.js';

import authRouter from './api/v1/auth/index.js';
import usersRouter from './api/v1/users/index.js';
import messagesRouter from './api/v1/messages/index.js';
import securityRouter from './api/v1/security/index.js';

import globalErrorHandler from './middleware/globalErrorHandler.js';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);


const allowedOrigins = [
  'https://www.zerotrustchatapp.xyz',
  'https://zerotrustchatapp.xyz',
  'http://localhost:3000',
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn(`Blocked CORS request from: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/', generalLimiter);

const io = initializeSocket(httpServer);

app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/security', securityRouter);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use(globalErrorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('[Database] Connection established successfully');
    
    await sequelize.sync({ alter: true });
    logger.info('[Database] Models synchronized');
    
    httpServer.listen(config.PORT, () => {
      logger.info(`[ZeroTrust Backend] Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('[Database] Connection failed:', error);
    process.exit(1);
  }
};

startServer();
