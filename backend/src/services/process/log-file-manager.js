import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Log file management utility for MCP instances
 */
class LogFileManager {
	constructor() {
		this.logStreams = new Map(); // instanceId -> { app, access, error }
		// Navigate from backend/src/services/process/ to project root, then to logs/
		this.rootLogDir = path.join(__dirname, '../../../../logs');
	}

	/**
	 * Initialize log files for an instance
	 * @param {string} instanceId - Instance ID
	 * @param {string} userId - User ID
	 * @returns {Object} Log streams object
	 */
	initializeLogFiles(instanceId, userId) {
		try {
			// Create directory structure: ./logs/users/user_{userId}/mcp_{instanceId}/
			const userLogDir = path.join(this.rootLogDir, 'users', `user_${userId}`);
			const instanceLogDir = path.join(userLogDir, `mcp_${instanceId}`);

			// Ensure directories exist
			fs.mkdirSync(instanceLogDir, { recursive: true });

			// Create log file paths
			const logFiles = {
				app: path.join(instanceLogDir, 'app.log'),
				access: path.join(instanceLogDir, 'access.log'),
				error: path.join(instanceLogDir, 'error.log'),
			};

			// Create write streams
			const streams = {
				app: fs.createWriteStream(logFiles.app, { flags: 'a' }),
				access: fs.createWriteStream(logFiles.access, { flags: 'a' }),
				error: fs.createWriteStream(logFiles.error, { flags: 'a' }),
			};

			// Store streams for later use
			this.logStreams.set(instanceId, streams);

			console.log(`📁 Created log files for instance ${instanceId} in ${instanceLogDir}`);
			return streams;
		} catch (error) {
			console.error(`❌ Failed to initialize log files for instance ${instanceId}:`, error);
			throw error;
		}
	}

	/**
	 * Write a log entry to appropriate file
	 * @param {string} instanceId - Instance ID
	 * @param {string} level - Log level (info, error, warn)
	 * @param {string} message - Log message
	 * @param {string} type - Log type (stdout, stderr)
	 * @param {Object} metadata - Additional metadata
	 */
	writeLog(instanceId, level, message, type = 'stdout', metadata = {}) {
		const streams = this.logStreams.get(instanceId);
		if (!streams) {
			console.warn(`⚠️  No log streams found for instance ${instanceId}`);
			return;
		}

		// Create structured log entry
		const logEntry = {
			timestamp: new Date().toISOString(),
			level,
			message: message.trim(),
			metadata: {
				type,
				instanceId,
				...metadata,
			},
		};

		// Convert to JSON string with newline
		const logLine = JSON.stringify(logEntry) + '\n';

		try {
			// Route to appropriate log file based on level and type
			if (level === 'error' || type === 'stderr') {
				streams.error.write(logLine);
			} else if (message.includes('GET') || message.includes('POST') || message.includes('HTTP')) {
				// Route HTTP-like messages to access log
				streams.access.write(logLine);
			} else {
				// Default to app log
				streams.app.write(logLine);
			}
		} catch (error) {
			console.error(`❌ Failed to write log for instance ${instanceId}:`, error);
		}
	}

	/**
	 * Close log streams for an instance
	 * @param {string} instanceId - Instance ID
	 */
	closeLogStreams(instanceId) {
		const streams = this.logStreams.get(instanceId);
		if (streams) {
			try {
				Object.values(streams).forEach(stream => {
					if (stream && typeof stream.end === 'function') {
						stream.end();
					}
				});
				this.logStreams.delete(instanceId);
				console.log(`📁 Closed log streams for instance ${instanceId}`);
			} catch (error) {
				console.error(`❌ Error closing log streams for instance ${instanceId}:`, error);
			}
		}
	}

	/**
	 * Get log streams for an instance
	 * @param {string} instanceId - Instance ID
	 * @returns {Object|null} Log streams or null if not found
	 */
	getLogStreams(instanceId) {
		return this.logStreams.get(instanceId) || null;
	}

	/**
	 * Clean up all log streams
	 */
	cleanup() {
		for (const instanceId of this.logStreams.keys()) {
			this.closeLogStreams(instanceId);
		}
	}

	/**
	 * Get log directory path for an instance
	 * @param {string} instanceId - Instance ID
	 * @param {string} userId - User ID
	 * @returns {string} Log directory path
	 */
	getLogDirectory(instanceId, userId) {
		return path.join(this.rootLogDir, 'users', `user_${userId}`, `mcp_${instanceId}`);
	}
}

// Create singleton instance
const logFileManager = new LogFileManager();

export default logFileManager;
