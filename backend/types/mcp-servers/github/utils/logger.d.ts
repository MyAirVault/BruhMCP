/**
 * Create logger instance for GitHub MCP service
 * @param {string} context - Logger context (e.g., 'auth', 'api', 'cache')
 * @returns {Object} Logger instance
 */
export function createLogger(context?: string): Object;
/**
 * Logger middleware for Express
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function loggerMiddleware(req: Object, res: Object, next: Function): void;
/**
 * Default logger instance
 */
export const logger: Object;
export namespace LOG_LEVELS {
    let ERROR: number;
    let WARN: number;
    let INFO: number;
    let DEBUG: number;
}
//# sourceMappingURL=logger.d.ts.map