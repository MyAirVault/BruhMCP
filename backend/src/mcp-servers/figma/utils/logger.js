/**
 * Logger utility
 * Provides consistent logging for both HTTP and stdio modes
 */

const Logger = {
	isHTTP: false,
	/**
	 * Log info messages
	 * @param {...any} args - Arguments to log
	 */
	log: (/** @type {...any} */ ...args) => {
		if (Logger.isHTTP) {
			console.log("[INFO]", ...args);
		} else {
			console.error("[INFO]", ...args);
		}
	},
	/**
	 * Log error messages
	 * @param {...any} args - Arguments to log
	 */
	error: (/** @type {...any} */ ...args) => {
		console.error("[ERROR]", ...args);
	},
};
module.exports = {
	Logger
};