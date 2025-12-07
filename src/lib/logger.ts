import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

// Server-side logger configuration
const serverLogger = pino({
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
    // In production, output JSON for log aggregation services
    ...(!isDevelopment && {
        formatters: {
            level: (label) => ({ level: label }),
        },
    }),
});

// Logger interface that matches pino's API
interface Logger {
    debug: (objOrMsg: object | string, msg?: string) => void;
    info: (objOrMsg: object | string, msg?: string) => void;
    warn: (objOrMsg: object | string, msg?: string) => void;
    error: (objOrMsg: object | string, msg?: string) => void;
    child: (bindings: object) => Logger;
}

// Client-side logger - uses console with structured output
const clientLogger: Logger = {
    debug: (objOrMsg, msg) => {
        if (isDevelopment) {
            if (typeof objOrMsg === 'string') {
                console.debug('[DEBUG]', objOrMsg);
            } else {
                console.debug('[DEBUG]', msg || '', objOrMsg);
            }
        }
    },
    info: (objOrMsg, msg) => {
        if (isDevelopment) {
            if (typeof objOrMsg === 'string') {
                console.info('[INFO]', objOrMsg);
            } else {
                console.info('[INFO]', msg || '', objOrMsg);
            }
        }
    },
    warn: (objOrMsg, msg) => {
        if (typeof objOrMsg === 'string') {
            console.warn('[WARN]', objOrMsg);
        } else {
            console.warn('[WARN]', msg || '', objOrMsg);
        }
    },
    error: (objOrMsg, msg) => {
        if (typeof objOrMsg === 'string') {
            console.error('[ERROR]', objOrMsg);
        } else {
            console.error('[ERROR]', msg || '', objOrMsg);
        }
    },
    child: () => clientLogger,
};

// Export the appropriate logger based on environment
export const logger = isServer ? serverLogger : clientLogger;

// Named exports for specific use cases
export const createLogger = (name: string): Logger => {
    if (isServer) {
        return serverLogger.child({ module: name }) as unknown as Logger;
    }
    return {
        debug: (objOrMsg, msg) => {
            if (isDevelopment) {
                if (typeof objOrMsg === 'string') {
                    console.debug(`[DEBUG][${name}]`, objOrMsg);
                } else {
                    console.debug(`[DEBUG][${name}]`, msg || '', objOrMsg);
                }
            }
        },
        info: (objOrMsg, msg) => {
            if (isDevelopment) {
                if (typeof objOrMsg === 'string') {
                    console.info(`[INFO][${name}]`, objOrMsg);
                } else {
                    console.info(`[INFO][${name}]`, msg || '', objOrMsg);
                }
            }
        },
        warn: (objOrMsg, msg) => {
            if (typeof objOrMsg === 'string') {
                console.warn(`[WARN][${name}]`, objOrMsg);
            } else {
                console.warn(`[WARN][${name}]`, msg || '', objOrMsg);
            }
        },
        error: (objOrMsg, msg) => {
            if (typeof objOrMsg === 'string') {
                console.error(`[ERROR][${name}]`, objOrMsg);
            } else {
                console.error(`[ERROR][${name}]`, msg || '', objOrMsg);
            }
        },
        child: () => createLogger(name),
    };
};

export default logger;

