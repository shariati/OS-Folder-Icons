/**
 * Logger utility - uses pino on server, console on client
 * Safe for both server and client environments
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

// Logger interface
interface Logger {
    debug: (objOrMsg: object | string, msg?: string) => void;
    info: (objOrMsg: object | string, msg?: string) => void;
    warn: (objOrMsg: object | string, msg?: string) => void;
    error: (objOrMsg: object | string, msg?: string) => void;
    child: (bindings: object) => Logger;
}

// Simple console-based logger for client side
function createConsoleLogger(name?: string): Logger {
    const prefix = name ? `[${name}]` : '';

    const formatArgs = (objOrMsg: object | string, msg?: string): string[] => {
        if (typeof objOrMsg === 'string') {
            return [prefix, objOrMsg].filter(Boolean);
        }
        return msg
            ? [prefix, msg, JSON.stringify(objOrMsg)].filter(Boolean)
            : [prefix, JSON.stringify(objOrMsg)].filter(Boolean);
    };

    return {
        debug: (objOrMsg, msg) => {
            if (isDevelopment) console.debug('[DEBUG]', ...formatArgs(objOrMsg, msg));
        },
        info: (objOrMsg, msg) => {
            if (isDevelopment) console.info('[INFO]', ...formatArgs(objOrMsg, msg));
        },
        warn: (objOrMsg, msg) => {
            console.warn('[WARN]', ...formatArgs(objOrMsg, msg));
        },
        error: (objOrMsg, msg) => {
            console.error('[ERROR]', ...formatArgs(objOrMsg, msg));
        },
        child: (bindings) => createConsoleLogger(name || Object.values(bindings)[0]?.toString()),
    };
}

// Server-side pino logger (lazy loaded)
let serverLoggerPromise: Promise<Logger> | null = null;

async function getServerLogger(): Promise<Logger> {
    if (!serverLoggerPromise) {
        serverLoggerPromise = (async () => {
            const pino = (await import('pino')).default;

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

            return pinoLogger as unknown as Logger;
        })();
    }
    return serverLoggerPromise;
}

// Synchronous server logger that queues messages until pino is ready
function createServerLoggerSync(name?: string): Logger {
    let pinoLoggerReady: Logger | null = null;
    const pendingLogs: Array<{ level: keyof Logger; args: [object | string, string?] }> = [];

    // Initialize pino logger
    getServerLogger().then(logger => {
        pinoLoggerReady = name ? logger.child({ module: name }) : logger;
        // Flush pending logs
        for (const log of pendingLogs) {
            if (log.level !== 'child') {
                (pinoLoggerReady[log.level] as Function)(...log.args);
            }
        }
        pendingLogs.length = 0;
    });

    const logOrQueue = (level: 'debug' | 'info' | 'warn' | 'error') =>
        (objOrMsg: object | string, msg?: string) => {
            if (pinoLoggerReady) {
                (pinoLoggerReady[level] as Function)(objOrMsg, msg);
            } else {
                pendingLogs.push({ level, args: [objOrMsg, msg] });
            }
        };

    return {
        debug: logOrQueue('debug'),
        info: logOrQueue('info'),
        warn: logOrQueue('warn'),
        error: logOrQueue('error'),
        child: (bindings) => createServerLoggerSync(name || Object.values(bindings)[0]?.toString()),
    };
}

// Export the appropriate logger based on environment
export const logger: Logger = isServer ? createServerLoggerSync() : createConsoleLogger();

// Named export for creating module-specific loggers
export const createLogger = (name: string): Logger => {
    return isServer ? createServerLoggerSync(name) : createConsoleLogger(name);
};

export default logger;


