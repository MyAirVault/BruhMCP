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
	static log(message, ...args) {
		console.log(`[Notion] ${message}`, ...args);
	}

	/**
	 * Log error message
	 * @param {string} message - Message to log
	 * @param {...any} args - Additional arguments
	 */
	static error(message, ...args) {
		console.error(`[Notion] ${message}`, ...args);
	}

	/**
	 * Log warning message
	 * @param {string} message - Message to log
	 * @param {...any} args - Additional arguments
	 */
	static warn(message, ...args) {
		console.warn(`[Notion] ${message}`, ...args);
	}

	/**
	 * Log debug message
	 * @param {string} message - Message to log
	 * @param {...any} args - Additional arguments
	 */
	static debug(message, ...args) {
		console.debug(`[Notion] ${message}`, ...args);
	}
}