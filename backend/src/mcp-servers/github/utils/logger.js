/**
 * Logger utility for GitHub MCP service
 * Provides structured logging with different levels and GitHub-specific formatting
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const LOG_LEVEL_NAMES = {
    0: 'ERROR',
    1: 'WARN',
    2: 'INFO',
    3: 'DEBUG'
};

/**
 * Get current log level from environment
 * @returns {number} Current log level
 */
function getCurrentLogLevel() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return LOG_LEVELS[envLevel] ?? LOG_LEVELS.INFO;
}

/**
 * Format log message with timestamp and service context
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const service = 'github-mcp';
    
    let formattedMessage = `[${timestamp}] [${service}] [${level}] ${message}`;
    
    if (Object.keys(meta).length > 0) {
        formattedMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return formattedMessage;
}

/**
 * Log message at specified level
 * @param {number} level - Log level number
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function logAtLevel(level, message, meta = {}) {
    const currentLevel = getCurrentLogLevel();
    
    if (level <= currentLevel) {
        const levelName = LOG_LEVEL_NAMES[level];
        const formattedMessage = formatLogMessage(levelName, message, meta);
        
        // Use appropriate console method based on level
        switch (level) {
            case LOG_LEVELS.ERROR:
                console.error(formattedMessage);
                break;
            case LOG_LEVELS.WARN:
                console.warn(formattedMessage);
                break;
            case LOG_LEVELS.DEBUG:
                console.debug(formattedMessage);
                break;
            default:
                console.log(formattedMessage);
        }
    }
}

/**
 * Create logger instance for GitHub MCP service
 * @param {string} context - Logger context (e.g., 'auth', 'api', 'cache')
 * @returns {Object} Logger instance
 */
export function createLogger(context = 'github-mcp') {
    return {
        /**
         * Log error message
         * @param {string} message - Error message
         * @param {Object} meta - Additional error metadata
         */
        error: (message, meta = {}) => {
            logAtLevel(LOG_LEVELS.ERROR, message, { context, ...meta });
        },
        
        /**
         * Log warning message
         * @param {string} message - Warning message
         * @param {Object} meta - Additional warning metadata
         */
        warn: (message, meta = {}) => {
            logAtLevel(LOG_LEVELS.WARN, message, { context, ...meta });
        },
        
        /**
         * Log info message
         * @param {string} message - Info message
         * @param {Object} meta - Additional info metadata
         */
        info: (message, meta = {}) => {
            logAtLevel(LOG_LEVELS.INFO, message, { context, ...meta });
        },
        
        /**
         * Log debug message
         * @param {string} message - Debug message
         * @param {Object} meta - Additional debug metadata
         */
        debug: (message, meta = {}) => {
            logAtLevel(LOG_LEVELS.DEBUG, message, { context, ...meta });
        },
        
        /**
         * Log GitHub API request
         * @param {string} method - HTTP method
         * @param {string} url - API endpoint URL
         * @param {Object} meta - Request metadata
         */
        apiRequest: (method, url, meta = {}) => {
            logAtLevel(LOG_LEVELS.INFO, `GitHub API Request: ${method} ${url}`, { 
                context, 
                type: 'api-request',
                method,
                url,
                ...meta 
            });
        },
        
        /**
         * Log GitHub API response
         * @param {number} status - HTTP status code
         * @param {string} url - API endpoint URL
         * @param {Object} meta - Response metadata
         */
        apiResponse: (status, url, meta = {}) => {
            const level = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
            logAtLevel(level, `GitHub API Response: ${status} ${url}`, { 
                context, 
                type: 'api-response',
                status,
                url,
                ...meta 
            });
        },
        
        /**
         * Log OAuth operation
         * @param {string} operation - OAuth operation (refresh, exchange, etc.)
         * @param {Object} meta - OAuth metadata
         */
        oauth: (operation, meta = {}) => {
            logAtLevel(LOG_LEVELS.INFO, `OAuth operation: ${operation}`, { 
                context, 
                type: 'oauth',
                operation,
                ...meta 
            });
        },
        
        /**
         * Log cache operation
         * @param {string} operation - Cache operation (hit, miss, set, etc.)
         * @param {Object} meta - Cache metadata
         */
        cache: (operation, meta = {}) => {
            logAtLevel(LOG_LEVELS.DEBUG, `Cache operation: ${operation}`, { 
                context, 
                type: 'cache',
                operation,
                ...meta 
            });
        },
        
        /**
         * Log session operation
         * @param {string} operation - Session operation (create, destroy, etc.)
         * @param {Object} meta - Session metadata
         */
        session: (operation, meta = {}) => {
            logAtLevel(LOG_LEVELS.INFO, `Session operation: ${operation}`, { 
                context, 
                type: 'session',
                operation,
                ...meta 
            });
        },
        
        /**
         * Log performance metrics
         * @param {string} operation - Operation being measured
         * @param {number} duration - Duration in milliseconds
         * @param {Object} meta - Performance metadata
         */
        performance: (operation, duration, meta = {}) => {
            logAtLevel(LOG_LEVELS.INFO, `Performance: ${operation} took ${duration}ms`, { 
                context, 
                type: 'performance',
                operation,
                duration,
                ...meta 
            });
        },
        
        /**
         * Create child logger with additional context
         * @param {string} childContext - Additional context for child logger
         * @returns {Object} Child logger instance
         */
        child: (childContext) => {
            return createLogger(`${context}:${childContext}`);
        }
    };
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Logger middleware for Express
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function loggerMiddleware(req, res, next) {
    const start = Date.now();
    const reqLogger = createLogger('github-mcp:http');
    
    reqLogger.info(`HTTP Request: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        query: req.query,
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });
    
    // Log response when request completes
    const originalSend = res.send;
    res.send = function(body) {
        const duration = Date.now() - start;
        reqLogger.info(`HTTP Response: ${res.statusCode} ${req.method} ${req.path}`, {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration,
            contentLength: body ? body.length : 0
        });
        
        return originalSend.call(this, body);
    };
    
    next();
}

/**
 * Export log levels for external use
 */
export { LOG_LEVELS };