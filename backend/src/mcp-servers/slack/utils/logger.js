/**
 * Comprehensive Logging System for Slack MCP
 * Provides structured logging with different levels and context
 */

import { recordTokenRefreshMetrics } from './tokenMetrics.js';

/**
 * Log levels
 * @typedef {'DEBUG'|'INFO'|'WARN'|'ERROR'|'FATAL'} LogLevel
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Current log level (can be set via environment variable)
 */
const CURRENT_LOG_LEVEL = LOG_LEVELS[/** @type {LogLevel} */ (process.env.LOG_LEVEL?.toUpperCase())] || LOG_LEVELS.INFO;

/**
 * Log colors for console output
 */
const LOG_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  FATAL: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
};

/**
 * Format timestamp for logs
 */
function formatTimestamp() {
  return new Date().toISOString();
}

/**
 * Format log entry
 * @param {LogLevel} level - The log level
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 * @returns {string} The formatted log entry
 */
function formatLogEntry(level, message, context = {}) {
  const timestamp = formatTimestamp();
  const color = LOG_COLORS[/** @type {keyof typeof LOG_COLORS} */ (level)];
  const reset = LOG_COLORS.RESET;
  
  const contextStr = Object.keys(context).length > 0 
    ? ` ${JSON.stringify(context)}`
    : '';
  
  return `${color}[${timestamp}] ${level}${reset}: ${message}${contextStr}`;
}

/**
 * Base logging function
 * @param {LogLevel} level - The log level
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
function log(level, message, context = {}) {
  if (LOG_LEVELS[/** @type {keyof typeof LOG_LEVELS} */ (level)] < CURRENT_LOG_LEVEL) {
    return;
  }
  
  const formattedMessage = formatLogEntry(level, message, context);
  
  if (LOG_LEVELS[/** @type {keyof typeof LOG_LEVELS} */ (level)] >= LOG_LEVELS.ERROR) {
    console.error(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
}

/**
 * Debug logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function debug(message, context = {}) {
  log('DEBUG', message, context);
}

/**
 * Info logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function info(message, context = {}) {
  log('INFO', message, context);
}

/**
 * Warning logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function warn(message, context = {}) {
  log('WARN', message, context);
}

/**
 * Error logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function error(message, context = {}) {
  log('ERROR', message, context);
}

/**
 * Fatal error logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function fatal(message, context = {}) {
  log('FATAL', message, context);
}

/**
 * Log API request start
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {string} instanceId - Instance identifier
 * @param {Record<string, unknown>} [params={}] - Request parameters
 */
export function logApiRequest(method, endpoint, instanceId, params = {}) {
  info(`🔄 Slack API Request: ${method} ${endpoint}`, {
    instanceId,
    method,
    endpoint,
    params: Object.keys(params).length > 0 ? params : undefined
  });
}

/**
 * Log API response
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the request was successful
 * @param {number} duration - Request duration in milliseconds
 * @param {Record<string, unknown>} [response={}] - Response data
 */
export function logApiResponse(method, endpoint, instanceId, success, duration, response = {}) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} Slack API Response: ${method} ${endpoint} (${duration}ms)`, {
    instanceId,
    method,
    endpoint,
    duration,
    success,
    response: success ? undefined : response
  });
}

/**
 * Log OAuth token operations
 * @param {string} operation - The token operation
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the operation was successful
 * @param {Record<string, unknown>} [details={}] - Additional operation details
 */
export function logTokenOperation(operation, instanceId, success, details = {}) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} OAuth Token ${operation}`, {
    instanceId,
    operation,
    success,
    ...details
  });
}

/**
 * Log token refresh with metrics
 * @param {string} instanceId - Instance identifier
 * @param {string} method - Refresh method used
 * @param {boolean} success - Whether the refresh was successful
 * @param {string|null} errorType - Type of error if failed
 * @param {string|null} errorMessage - Error message if failed
 * @param {number} startTime - Operation start timestamp
 * @param {number} endTime - Operation end timestamp
 */
export function logTokenRefresh(instanceId, method, success, errorType, errorMessage, startTime, endTime) {
  const duration = endTime - startTime;
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  // Record metrics - convert null values to empty strings for the metrics function
  recordTokenRefreshMetrics(instanceId, method, success, errorType || '', errorMessage || '', startTime, endTime);
  
  // Log the operation
  log(level, `${status} Token Refresh: ${method} (${duration}ms)`, {
    instanceId,
    method,
    success,
    duration,
    errorType: success ? undefined : errorType,
    errorMessage: success ? undefined : errorMessage
  });
}

/**
 * Log MCP request processing
 * @param {string} method - MCP method name
 * @param {Record<string, unknown>|null} params - Request parameters
 * @param {string} instanceId - Instance identifier
 */
export function logMcpRequest(method, params, instanceId) {
  info(`🔄 MCP Request: ${method}`, {
    instanceId,
    method,
    params: params ? Object.keys(params) : undefined
  });
}

/**
 * Log MCP response
 * @param {string} method - MCP method name
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the request was successful
 * @param {number} duration - Request duration in milliseconds
 * @param {Error|null} [error=null] - Error object if failed
 */
export function logMcpResponse(method, instanceId, success, duration, error = null) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} MCP Response: ${method} (${duration}ms)`, {
    instanceId,
    method,
    success,
    duration,
    error: error?.message ?? undefined
  });
}

/**
 * Log database operations
 * @param {string} operation - Database operation type
 * @param {string} table - Database table name
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the operation was successful
 * @param {Record<string, unknown>} [details={}] - Additional operation details
 */
export function logDatabaseOperation(operation, table, instanceId, success, details = {}) {
  const status = success ? '✅' : '❌';
  const level = success ? 'DEBUG' : 'ERROR';
  
  log(level, `${status} Database ${operation}: ${table}`, {
    instanceId,
    operation,
    table,
    success,
    ...details
  });
}

/**
 * Log credential operations
 * @param {string} operation - Credential operation type
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the operation was successful
 * @param {Record<string, unknown>} [details={}] - Additional operation details
 */
export function logCredentialOperation(operation, instanceId, success, details = {}) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} Credential ${operation}`, {
    instanceId,
    operation,
    success,
    ...details
  });
}

/**
 * Log validation errors
 * @param {string} type - Validation error type
 * @param {string} field - Field that failed validation
 * @param {unknown} value - Value that failed validation
 * @param {string} instanceId - Instance identifier
 * @param {Record<string, unknown>} [details={}] - Additional error details
 */
export function logValidationError(type, field, value, instanceId, details = {}) {
  error(`❌ Validation Error: ${type}`, {
    instanceId,
    type,
    field,
    value: typeof value === 'string' ? value.substring(0, 100) : value,
    ...details
  });
}

/**
 * Log rate limiting
 * @param {string} endpoint - API endpoint that was rate limited
 * @param {string} instanceId - Instance identifier
 * @param {number} retryAfter - Retry after duration in seconds
 * @param {Record<string, unknown>} [details={}] - Additional rate limit details
 */
export function logRateLimit(endpoint, instanceId, retryAfter, details = {}) {
  warn(`⏱️ Rate Limited: ${endpoint}`, {
    instanceId,
    endpoint,
    retryAfter,
    ...details
  });
}

/**
 * Log cache operations
 * @param {string} operation - Cache operation type
 * @param {string} key - Cache key
 * @param {boolean} hit - Whether it was a cache hit
 * @param {string} instanceId - Instance identifier
 * @param {Record<string, unknown>} [details={}] - Additional cache details
 */
export function logCacheOperation(operation, key, hit, instanceId, details = {}) {
  const status = hit ? '🎯' : '❌';
  
  debug(`${status} Cache ${operation}: ${key}`, {
    instanceId,
    operation,
    key,
    hit,
    ...details
  });
}

/**
 * Log system health
 * @param {'healthy'|'degraded'|'unhealthy'} status - System health status
 * @param {Record<string, unknown>} metrics - System metrics
 * @param {string[]} [issues=[]] - List of system issues
 * @param {string[]} [warnings=[]] - List of system warnings
 */
export function logSystemHealth(status, metrics, issues = [], warnings = []) {
  const level = status === 'healthy' ? 'INFO' : status === 'degraded' ? 'WARN' : 'ERROR';
  const emoji = status === 'healthy' ? '💚' : status === 'degraded' ? '💛' : '❤️';
  
  log(level, `${emoji} System Health: ${status}`, {
    status,
    metrics,
    issues: issues.length > 0 ? issues : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  });
}

/**
 * Log startup information
 * @param {number} port - Server port number
 * @param {string} environment - Environment name
 * @param {string[]} [features=[]] - List of enabled features
 */
export function logStartup(port, environment, features = []) {
  info(`🚀 Slack MCP Server Starting`, {
    port,
    environment,
    features,
    logLevel: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[/** @type {keyof typeof LOG_LEVELS} */ (key)] === CURRENT_LOG_LEVEL)
  });
}

/**
 * Log shutdown information
 * @param {string} reason - Shutdown reason
 * @param {boolean} [graceful=true] - Whether shutdown was graceful
 */
export function logShutdown(reason, graceful = true) {
  const level = graceful ? 'INFO' : 'ERROR';
  const emoji = graceful ? '👋' : '💥';
  
  log(level, `${emoji} Slack MCP Server Shutting Down`, {
    reason,
    graceful,
    timestamp: formatTimestamp()
  });
}

/**
 * Create a request logger middleware
 * @param {string} [serviceName='slack'] - Service name for logging
 * @returns {Function} Express middleware function
 */
export function createRequestLogger(serviceName = 'slack') {
  return (/** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
    const startTime = Date.now();
    const instanceId = req.headers['x-instance-id'] || 'unknown';
    
    info(`📨 ${serviceName.toUpperCase()} Request: ${req.method} ${req.path}`, {
      instanceId,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    });
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      const status = success ? '✅' : '❌';
      const level = success ? 'INFO' : 'ERROR';
      
      log(level, `${status} ${serviceName.toUpperCase()} Response: ${req.method} ${req.path} (${duration}ms)`, {
        instanceId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        success
      });
    });
    
    next();
  };
}

/**
 * Performance timer utility
 * @param {string} operation - Operation name
 * @param {string} instanceId - Instance identifier
 * @returns {{end: Function}} Timer object with end method
 */
export function createTimer(operation, instanceId) {
  const startTime = Date.now();
  
  return {
    end: (/** @type {boolean} */ success = true, /** @type {Record<string, unknown>} */ details = {}) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const status = success ? '✅' : '❌';
      const level = success ? 'DEBUG' : 'ERROR';
      
      log(level, `${status} ${operation} completed (${duration}ms)`, {
        instanceId,
        operation,
        duration,
        success,
        ...details
      });
      
      return duration;
    }
  };
}

/**
 * Export current log level for testing
 */
export const currentLogLevel = CURRENT_LOG_LEVEL;

/**
 * Export log levels for reference
 */
export const logLevels = LOG_LEVELS;