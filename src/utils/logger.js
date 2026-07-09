const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

const isProd = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack
      ? `${timestamp} ${level}: ${message}\n${stack}${metaStr}`
      : `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), format.json());

const logger = createLogger({
  level,
  format: isProd ? prodFormat : devFormat,
  transports: [new transports.Console()],
  exitOnError: false,
});

module.exports = logger;
