/**
 * Comprehensive Logging System for Slack MCP
 * Provides structured logging with different levels and context
 */

import { recordTokenRefreshMetrics } from './token-metrics.js';

/**
 * Log levels
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
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

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
 */
function formatLogEntry(level, message, context = {}) {
  const timestamp = formatTimestamp();
  const color = LOG_COLORS[level];
  const reset = LOG_COLORS.RESET;
  
  const contextStr = Object.keys(context).length > 0 
    ? ` ${JSON.stringify(context)}`
    : '';
  
  return `${color}[${timestamp}] ${level}${reset}: ${message}${contextStr}`;
}

/**
 * Base logging function
 */
function log(level, message, context = {}) {
  if (LOG_LEVELS[level] < CURRENT_LOG_LEVEL) {
    return;
  }
  
  const formattedMessage = formatLogEntry(level, message, context);
  
  if (LOG_LEVELS[level] >= LOG_LEVELS.ERROR) {
    console.error(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
}

/**
 * Debug logging
 */
export function debug(message, context = {}) {
  log('DEBUG', message, context);
}

/**
 * Info logging
 */
export function info(message, context = {}) {
  log('INFO', message, context);
}

/**
 * Warning logging
 */
export function warn(message, context = {}) {
  log('WARN', message, context);
}

/**
 * Error logging
 */
export function error(message, context = {}) {
  log('ERROR', message, context);
}

/**
 * Fatal error logging
 */
export function fatal(message, context = {}) {
  log('FATAL', message, context);
}

/**
 * Log API request start
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
 */
export function logTokenRefresh(instanceId, method, success, errorType, errorMessage, startTime, endTime) {
  const duration = endTime - startTime;
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  // Record metrics
  recordTokenRefreshMetrics(instanceId, method, success, errorType, errorMessage, startTime, endTime);
  
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
 */
export function logMcpResponse(method, instanceId, success, duration, error = null) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} MCP Response: ${method} (${duration}ms)`, {
    instanceId,
    method,
    success,
    duration,
    error: error ? error.message : undefined
  });
}

/**
 * Log database operations
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
 */
export function logStartup(port, environment, features = []) {
  info(`🚀 Slack MCP Server Starting`, {
    port,
    environment,
    features,
    logLevel: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === CURRENT_LOG_LEVEL)
  });
}

/**
 * Log shutdown information
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
 */
export function createRequestLogger(serviceName = 'slack') {
  return (req, res, next) => {
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
 */
export function createTimer(operation, instanceId) {
  const startTime = Date.now();
  
  return {
    end: (success = true, details = {}) => {
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