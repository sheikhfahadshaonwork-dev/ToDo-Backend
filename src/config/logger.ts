import winston from 'winston';

const { combine, timestamp, json, colorize, simple, errors } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction
    ? combine(errors({ stack: true }), timestamp(), json())
    : combine(
        errors({ stack: true }),
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        simple(),
      ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

export default logger;
