const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const sanitize = (message) => {
  if (typeof message !== 'object' || message === null) {
    return message;
  }
  const sensitiveFields = ['password', 'token', 'code', 'cardNumber'];
  const clone = JSON.parse(JSON.stringify(message));
  const sanitizeObject = (obj) => {
    Object.keys(obj).forEach((key) => {
      if (sensitiveFields.includes(key)) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    });
  };
  sanitizeObject(clone);
  return clone;
};

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const payload = typeof message === 'object' ? JSON.stringify(sanitize(message)) : message;
    return `${timestamp} [${level}] ${payload}${stack ? `\n${stack}` : ''}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), format),
    }),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
  ],
});

module.exports = logger;
