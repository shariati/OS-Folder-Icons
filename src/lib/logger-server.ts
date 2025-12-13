import 'server-only';

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

// Server-side pino logger
const pinoLogger = pino({
  level: isDevelopment ? 'debug' : 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  ...(!isDevelopment && {
    formatters: {
      level: (label) => ({ level: label }),
    },
  }),
});

export const serverLogger = pinoLogger;
export const createServerLogger = (name: string) => pinoLogger.child({ module: name });
