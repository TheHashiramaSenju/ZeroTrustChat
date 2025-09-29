// Production-ready logger configuration (e.g., Winston) with transports for console and file.
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels and colors
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Custom format for console output
const consoleFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
);

// Create the logger
const logger = createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'zerotrust-backend' },
    transports: [
        // Console transport
        new transports.Console({
            format: consoleFormat,
        }),
        // File transport for all logs
        new transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File transport for errors only
        new transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new transports.File({
            filename: path.join(__dirname, '../../logs/exceptions.log'),
        }),
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new transports.File({
            filename: path.join(__dirname, '../../logs/rejections.log'),
        }),
    ],
});

export default logger;
