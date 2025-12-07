/**
 * Client-safe logger utility
 * For server-side pino logging, import from ./logger-server.ts instead
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Logger interface
interface Logger {
    debug: (objOrMsg: object | string, msg?: string) => void;
    info: (objOrMsg: object | string, msg?: string) => void;
    warn: (objOrMsg: object | string, msg?: string) => void;
    error: (objOrMsg: object | string, msg?: string) => void;
}

// Format log arguments
function formatArgs(prefix: string, objOrMsg: object | string, msg?: string): string[] {
    if (typeof objOrMsg === 'string') {
        return [prefix, objOrMsg].filter(Boolean);
    }
    return msg
        ? [prefix, msg, JSON.stringify(objOrMsg)].filter(Boolean)
        : [prefix, JSON.stringify(objOrMsg)].filter(Boolean);
}

// Console-based logger
function createConsoleLogger(name?: string): Logger {
    const prefix = name ? `[${name}]` : '';

    return {
        debug: (objOrMsg, msg) => {
            if (isDevelopment) console.debug('[DEBUG]', ...formatArgs(prefix, objOrMsg, msg));
        },
        info: (objOrMsg, msg) => {
            if (isDevelopment) console.info('[INFO]', ...formatArgs(prefix, objOrMsg, msg));
        },
        warn: (objOrMsg, msg) => {
            console.warn('[WARN]', ...formatArgs(prefix, objOrMsg, msg));
        },
        error: (objOrMsg, msg) => {
            console.error('[ERROR]', ...formatArgs(prefix, objOrMsg, msg));
        },
    };
}

// Export the console logger
export const logger: Logger = createConsoleLogger();

// Create module-specific loggers
export const createLogger = (name: string): Logger => createConsoleLogger(name);

export default logger;
