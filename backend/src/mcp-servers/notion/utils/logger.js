/**
 * Logger utility for Notion MCP service
 */

import { sanitizeForLog } from './common.js';

export class Logger {
	/**
	 * Log info message
	 * @param {string} message - Message to log
	 * @param {...any} args - Additional arguments
	 */
	static log(message, ...args) {
		const sanitizedMessage = sanitizeForLog(message);
		const sanitizedArgs = args.map(arg => (typeof arg === 'string' ? sanitizeForLog(arg) : arg));
		console.log(`[Notion] ${sanitizedMessage}`, ...sanitizedArgs);
	}

	/**
	 * Log error message
	 * @param {string} message - Message to log
	 * @param {...any} args - Additional arguments
	 */
	static error(message, ...args) {
		const sanitizedMessage = sanitizeForLog(message);
		const sanitizedArgs = args.map(arg => (typeof arg === 'string' ? sanitizeForLog(arg) : arg));
		console.error(`[Notion Error] ${sanitizedMessage}`, ...sanitizedArgs);
	}

	/**
	 * Log warning message
	 * @param {string} message - Message to log
	 * @param {...any} args - Additional arguments
	 */
	static warn(message, ...args) {
		const sanitizedMessage = sanitizeForLog(message);
		const sanitizedArgs = args.map(arg => (typeof arg === 'string' ? sanitizeForLog(arg) : arg));
		console.warn(`[Notion Warning] ${sanitizedMessage}`, ...sanitizedArgs);
	}

	/**
	 * Log debug message
	 * @param {string} message - Message to log
	 * @param {...any} args - Additional arguments
	 */
	static debug(message, ...args) {
		if (process.env.NODE_ENV === 'development') {
			const sanitizedMessage = sanitizeForLog(message);
			const sanitizedArgs = args.map(arg => (typeof arg === 'string' ? sanitizeForLog(arg) : arg));
			console.debug(`[Notion Debug] ${sanitizedMessage}`, ...sanitizedArgs);
		}
	}
}
