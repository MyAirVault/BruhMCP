/**
 * Logger utility for Notion MCP service
 */
/**
 * Logger class for Notion MCP service
 */
export class Logger {
    /**
     * Log info message
     * @param {string} message - Message to log
     * @param {...any} args - Additional arguments
     */
    static log(message: string, ...args: any[]): void;
    /**
     * Log error message
     * @param {string} message - Message to log
     * @param {...any} args - Additional arguments
     */
    static error(message: string, ...args: any[]): void;
    /**
     * Log warning message
     * @param {string} message - Message to log
     * @param {...any} args - Additional arguments
     */
    static warn(message: string, ...args: any[]): void;
    /**
     * Log debug message
     * @param {string} message - Message to log
     * @param {...any} args - Additional arguments
     */
    static debug(message: string, ...args: any[]): void;
}
//# sourceMappingURL=logger.d.ts.map