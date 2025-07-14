/**
 * Log Directory Management Utility
 * Handles creation and management of MCP instance log directories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Creates log directory structure for a new MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {Promise<{success: boolean, logDir?: string, error?: string}>}
 */
export async function createMCPLogDirectory(userId, instanceId) {
	try {
		// Calculate project root from utils directory (backend/src/utils -> project root)
		const projectRoot = path.resolve(__dirname, '../../../');
		const logDir = path.join(projectRoot, 'logs', 'users', `user_${userId}`, `mcp_${instanceId}`);
		
		// Create directory structure if it doesn't exist
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
			console.log(`📁 Created log directory: ${logDir}`);
			
			// Create empty log files to ensure they exist
			const logFiles = ['app.log', 'access.log', 'error.log'];
			logFiles.forEach(logFile => {
				const logFilePath = path.join(logDir, logFile);
				if (!fs.existsSync(logFilePath)) {
					fs.writeFileSync(logFilePath, '');
				}
			});
			
			console.log(`📄 Created log files: ${logFiles.join(', ')}`);
		}
		
		return {
			success: true,
			logDir
		};
		
	} catch (error) {
		console.error(`⚠️ Failed to create log directory for instance ${instanceId}:`, error.message);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Removes log directory structure for a deleted MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removeMCPLogDirectory(userId, instanceId) {
	try {
		// Calculate project root from utils directory (backend/src/utils -> project root)
		const projectRoot = path.resolve(__dirname, '../../../');
		const logDir = path.join(projectRoot, 'logs', 'users', `user_${userId}`, `mcp_${instanceId}`);
		
		// Remove directory if it exists
		if (fs.existsSync(logDir)) {
			fs.rmSync(logDir, { recursive: true, force: true });
			console.log(`🗑️ Removed log directory: ${logDir}`);
		}
		
		return {
			success: true
		};
		
	} catch (error) {
		console.error(`⚠️ Failed to remove log directory for instance ${instanceId}:`, error.message);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Gets the log directory path for an MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {string} Log directory path
 */
export function getMCPLogDirectoryPath(userId, instanceId) {
	// Calculate project root from utils directory (backend/src/utils -> project root)
	const projectRoot = path.resolve(__dirname, '../../../');
	return path.join(projectRoot, 'logs', 'users', `user_${userId}`, `mcp_${instanceId}`);
}

/**
 * Checks if log directory exists for an MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {boolean} True if directory exists
 */
export function mcpLogDirectoryExists(userId, instanceId) {
	const logDir = getMCPLogDirectoryPath(userId, instanceId);
	return fs.existsSync(logDir);
}

/**
 * Creates user log directory structure if it doesn't exist
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, userLogDir?: string, error?: string}>}
 */
export async function createUserLogDirectory(userId) {
	try {
		// Calculate project root from utils directory (backend/src/utils -> project root)
		const projectRoot = path.resolve(__dirname, '../../../');
		const userLogDir = path.join(projectRoot, 'logs', 'users', `user_${userId}`);
		
		// Create user directory if it doesn't exist
		if (!fs.existsSync(userLogDir)) {
			fs.mkdirSync(userLogDir, { recursive: true });
			console.log(`📁 Created user log directory: ${userLogDir}`);
		}
		
		return {
			success: true,
			userLogDir
		};
		
	} catch (error) {
		console.error(`⚠️ Failed to create user log directory for user ${userId}:`, error.message);
		return {
			success: false,
			error: error.message
		};
	}
}