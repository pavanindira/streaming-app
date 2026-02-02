const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
  })
);

// Create logger instance
const logger = createLogger({
  level: 'info', // Default log level
  format: logFormat,
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),

    // Daily rotate file transport for log rotation
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log', // Log file pattern
      datePattern: 'YYYY-MM-DD', // Rotate daily
      maxSize: '20m', // Max size of a log file
      maxFiles: '14d', // Keep logs for 14 days
      zippedArchive: true, // Compress old log files
    }),
  ],
});

module.exports = logger;