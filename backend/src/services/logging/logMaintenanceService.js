const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const loggingService = require('./loggingService.js');

const execAsync = promisify(exec);

/**
 * @typedef {Object} CleanupStats
 * @property {string|null} lastRun - Last maintenance run timestamp
 * @property {number} filesRemoved - Number of files removed
 * @property {number} spaceFreed - Space freed in bytes
 * @property {string[]} errors - Array of error messages
 */

/**
 * @typedef {Object} ValidationResult
 * @property {number} validated - Number of validated files
 * @property {number} corrupted - Number of corrupted files
 */

/**
 * @typedef {Object} DirectoryStats
 * @property {number} size - Total size in bytes
 * @property {number} fileCount - Number of files
 */

/**
 * @typedef {Object} UserLogsStats
 * @property {number} size - Total size in bytes
 * @property {number} fileCount - Number of files
 * @property {number} userCount - Number of users
 * @property {number} instanceCount - Number of instances
 */

/**
 * @typedef {Object} CleanupResult
 * @property {number} removed - Number of files removed
 * @property {number} spaceSaved - Space saved in bytes
 */

/**
 * Log maintenance service for cleanup, rotation, and monitoring
 * Handles both system logs and user instance logs
 */

class LogMaintenanceService {
	constructor() {
		// Calculate project root path from the service location (backend/src/services/logging -> project root)
		const projectRoot = path.resolve(__dirname, '../../../../');
		this.systemLogsDir = path.join(projectRoot, 'logs', 'system');
		this.userLogsDir = path.join(projectRoot, 'logs', 'users');
		this.maintenanceInterval = null;
		/** @type {CleanupStats} */
		this.cleanupStats = {
			lastRun: null,
			filesRemoved: 0,
			spaceFreed: 0,
			errors: []
		};
	}

	/**
	 * Start automated log maintenance
	 * @param {number} intervalHours - Hours between maintenance runs
	 */
	startAutomatedMaintenance(intervalHours = 24) {
		// Clear existing interval if any
		if (this.maintenanceInterval) {
			clearInterval(this.maintenanceInterval);
		}

		// Set up periodic maintenance
		this.maintenanceInterval = setInterval(() => {
			this.performCompleteMaintenance();
		}, intervalHours * 60 * 60 * 1000);

		loggingService.info('Log maintenance scheduled', {
			event: 'maintenance_scheduled',
			intervalHours,
			nextRun: new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString()
		});

		// Run initial maintenance
		setTimeout(() => this.performCompleteMaintenance(), 30000); // 30 seconds after startup
	}

	/**
	 * Stop automated maintenance
	 */
	stopAutomatedMaintenance() {
		if (this.maintenanceInterval) {
			clearInterval(this.maintenanceInterval);
			this.maintenanceInterval = null;
		}

		loggingService.info('Log maintenance stopped');
	}

	/**
	 * Perform complete maintenance cycle
	 */
	async performCompleteMaintenance() {
		const startTime = Date.now();
		const maintenanceId = `maintenance_${Date.now()}`;

		try {
			loggingService.info('Starting log maintenance cycle', { maintenanceId });

			// Reset stats
			/** @type {CleanupStats} */
			this.cleanupStats = {
				lastRun: new Date().toISOString(),
				filesRemoved: 0,
				spaceFreed: 0,
				errors: []
			};

			// Perform all maintenance tasks
			await this.cleanupSystemLogs();
			await this.cleanupUserLogs();
			await this.compressOldLogs();
			await this.validateLogIntegrity();
			await this.updateLogStatistics();

			// Trigger service-level maintenance
			loggingService.performMaintenance();

			const duration = Date.now() - startTime;
			loggingService.info('Log maintenance completed', {
				maintenanceId,
				duration,
				stats: this.cleanupStats
			});

		} catch (/** @type {unknown} */ error) {
			const duration = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(errorMessage);
			
			loggingService.info('Log maintenance failed', {
				error: errorMessage,
				operation: 'log_maintenance',
				maintenanceId,
				duration,
				critical: true
			});
		}
	}

	/**
	 * Clean up old system logs
	 */
	async cleanupSystemLogs() {
		try {
			if (!fs.existsSync(this.systemLogsDir)) {
				return;
			}

			const retentionDays = 90; // System logs kept for 90 days
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

			const files = fs.readdirSync(this.systemLogsDir);
			let removedCount = 0;
			let spaceSaved = 0;

			for (const file of files) {
				const filePath = path.join(this.systemLogsDir, file);
				const stats = fs.statSync(filePath);

				// Skip if file is newer than cutoff
				if (stats.mtime > cutoffDate) {
					continue;
				}

				// Skip active log files (without date suffix)
				if (!file.includes('.log.') && !file.endsWith('.gz')) {
					continue;
				}

				try {
					spaceSaved += stats.size;
					fs.unlinkSync(filePath);
					removedCount++;
				} catch (/** @type {unknown} */ error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					this.cleanupStats.errors.push(`Failed to remove ${file}: ${errorMessage}`);
				}
			}

			this.cleanupStats.filesRemoved += removedCount;
			this.cleanupStats.spaceFreed += spaceSaved;

			loggingService.info('System log cleanup completed', {
				removedFiles: removedCount,
				spaceSaved,
				retentionDays
			});

		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`System log cleanup failed: ${errorMessage}`);
		}
	}

	/**
	 * Clean up old user instance logs
	 */
	async cleanupUserLogs() {
		try {
			if (!fs.existsSync(this.userLogsDir)) {
				return;
			}

			const retentionDays = 30; // User logs kept for 30 days
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

			let totalRemoved = 0;
			let totalSpaceSaved = 0;

			// Walk through user directories
			const userDirs = fs.readdirSync(this.userLogsDir);
			
			for (const userDir of userDirs) {
				const userPath = path.join(this.userLogsDir, userDir);
				if (!fs.statSync(userPath).isDirectory()) continue;

				const mcpDirs = fs.readdirSync(userPath);
				
				for (const mcpDir of mcpDirs) {
					const mcpPath = path.join(userPath, mcpDir);
					if (!fs.statSync(mcpPath).isDirectory()) continue;

					const { removed, spaceSaved } = await this.cleanupUserMCPLogs(mcpPath, cutoffDate);
					totalRemoved += removed;
					totalSpaceSaved += spaceSaved;

					// Remove empty MCP directories
					if (this.isDirectoryEmpty(mcpPath)) {
						fs.rmdirSync(mcpPath);
						totalRemoved++;
					}
				}

				// Remove empty user directories
				if (this.isDirectoryEmpty(userPath)) {
					fs.rmdirSync(userPath);
					totalRemoved++;
				}
			}

			this.cleanupStats.filesRemoved += totalRemoved;
			this.cleanupStats.spaceFreed += totalSpaceSaved;

			loggingService.info('User log cleanup completed', {
				removedFiles: totalRemoved,
				spaceSaved: totalSpaceSaved,
				retentionDays
			});

		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`User log cleanup failed: ${errorMessage}`);
		}
	}

	/**
	 * Clean up logs for a specific MCP instance
	 * @param {string} mcpPath - Path to MCP instance logs
	 * @param {Date} cutoffDate - Cutoff date for cleanup
	 * @returns {Promise<CleanupResult>} Cleanup statistics
	 */
	async cleanupUserMCPLogs(mcpPath, cutoffDate) {
		let removed = 0;
		let spaceSaved = 0;

		try {
			const logFiles = fs.readdirSync(mcpPath);
			
			for (const logFile of logFiles) {
				const logFilePath = path.join(mcpPath, logFile);
				const stats = fs.statSync(logFilePath);

				// Check if file is older than cutoff and not an active log
				if (stats.mtime < cutoffDate && (logFile.includes('.log.') || logFile.endsWith('.gz'))) {
					try {
						spaceSaved += stats.size;
						fs.unlinkSync(logFilePath);
						removed++;
					} catch (/** @type {unknown} */ error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						this.cleanupStats.errors.push(`Failed to remove ${logFilePath}: ${errorMessage}`);
					}
				}
			}
		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Failed to cleanup MCP logs at ${mcpPath}: ${errorMessage}`);
		}

		return { removed, spaceSaved };
	}

	/**
	 * Compress old log files
	 */
	async compressOldLogs() {
		try {
			const compressionAge = 7; // Compress logs older than 7 days
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - compressionAge);

			let compressedCount = 0;

			// Compress system logs
			compressedCount += await this.compressLogsInDirectory(this.systemLogsDir, cutoffDate);

			// Compress user logs
			if (fs.existsSync(this.userLogsDir)) {
				compressedCount += await this.compressUserLogs(cutoffDate);
			}

			loggingService.info('Log compression completed', {
				compressedFiles: compressedCount,
				compressionAge
			});

		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Log compression failed: ${errorMessage}`);
		}
	}

	/**
	 * Compress logs in a specific directory
	 * @param {string} directory - Directory to compress logs in
	 * @param {Date} cutoffDate - Date cutoff for compression
	 * @returns {Promise<number>} Number of files compressed
	 */
	async compressLogsInDirectory(directory, cutoffDate) {
		let compressedCount = 0;

		try {
			const files = fs.readdirSync(directory);
			
			for (const file of files) {
				// Skip already compressed files
				if (file.endsWith('.gz')) continue;

				// Only compress dated log files
				if (!file.includes('.log.')) continue;

				const filePath = path.join(directory, file);
				const stats = fs.statSync(filePath);

				if (stats.mtime < cutoffDate) {
					try {
						await execAsync(`gzip "${filePath}"`);
						compressedCount++;
					} catch (/** @type {unknown} */ error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						this.cleanupStats.errors.push(`Failed to compress ${file}: ${errorMessage}`);
					}
				}
			}
		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Failed to compress logs in ${directory}: ${errorMessage}`);
		}

		return compressedCount;
	}

	/**
	 * Compress user logs recursively
	 * @param {Date} cutoffDate - Date cutoff for compression
	 * @returns {Promise<number>} Number of files compressed
	 */
	async compressUserLogs(cutoffDate) {
		let totalCompressed = 0;

		try {
			const userDirs = fs.readdirSync(this.userLogsDir);
			
			for (const userDir of userDirs) {
				const userPath = path.join(this.userLogsDir, userDir);
				if (!fs.statSync(userPath).isDirectory()) continue;

				const mcpDirs = fs.readdirSync(userPath);
				
				for (const mcpDir of mcpDirs) {
					const mcpPath = path.join(userPath, mcpDir);
					if (!fs.statSync(mcpPath).isDirectory()) continue;

					totalCompressed += await this.compressLogsInDirectory(mcpPath, cutoffDate);
				}
			}
		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Failed to compress user logs: ${errorMessage}`);
		}

		return totalCompressed;
	}

	/**
	 * Validate log file integrity
	 */
	async validateLogIntegrity() {
		try {
			let validatedFiles = 0;
			let corruptedFiles = 0;

			// Validate system logs
			const systemResult = await this.validateLogsInDirectory(this.systemLogsDir);
			validatedFiles += systemResult.validated;
			corruptedFiles += systemResult.corrupted;

			// Validate user logs
			if (fs.existsSync(this.userLogsDir)) {
				const userResult = await this.validateUserLogs();
				validatedFiles += userResult.validated;
				corruptedFiles += userResult.corrupted;
			}

			loggingService.info('Log integrity validation completed', {
				validatedFiles,
				corruptedFiles,
				healthStatus: corruptedFiles === 0 ? 'healthy' : 'degraded'
			});

		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Log integrity validation failed: ${errorMessage}`);
		}
	}

	/**
	 * Validate logs in a directory
	 * @param {string} directory - Directory to validate
	 * @returns {Promise<ValidationResult>} Validation results
	 */
	async validateLogsInDirectory(directory) {
		let validated = 0;
		let corrupted = 0;

		try {
			if (!fs.existsSync(directory)) {
				return { validated, corrupted };
			}

			const files = fs.readdirSync(directory);
			
			for (const file of files) {
				if (!file.endsWith('.log') && !file.endsWith('.log.gz')) continue;

				const filePath = path.join(directory, file);
				
				try {
					// Basic validation - check if file is readable
					const content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
					
					// For JSON logs, try to parse a sample
					if (file.endsWith('.log')) {
						const lines = content.split('\n').filter(line => line.trim());
						if (lines.length > 0) {
							JSON.parse(lines[0]); // Validate first line is valid JSON
						}
					}
					
					validated++;
				} catch (/** @type {unknown} */ error) {
					corrupted++;
					const errorMessage = error instanceof Error ? error.message : String(error);
					this.cleanupStats.errors.push(`Corrupted log file ${file}: ${errorMessage}`);
					
					// Quarantine corrupted file
					const quarantinePath = path.join(directory, `corrupted_${file}_${Date.now()}`);
					fs.renameSync(filePath, quarantinePath);
				}
			}
		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Failed to validate logs in ${directory}: ${errorMessage}`);
		}

		return { validated, corrupted };
	}

	/**
	 * Validate user logs recursively
	 * @returns {Promise<ValidationResult>} Validation results
	 */
	async validateUserLogs() {
		let totalValidated = 0;
		let totalCorrupted = 0;

		try {
			const userDirs = fs.readdirSync(this.userLogsDir);
			
			for (const userDir of userDirs) {
				const userPath = path.join(this.userLogsDir, userDir);
				if (!fs.statSync(userPath).isDirectory()) continue;

				const mcpDirs = fs.readdirSync(userPath);
				
				for (const mcpDir of mcpDirs) {
					const mcpPath = path.join(userPath, mcpDir);
					if (!fs.statSync(mcpPath).isDirectory()) continue;

					const result = await this.validateLogsInDirectory(mcpPath);
					totalValidated += result.validated;
					totalCorrupted += result.corrupted;
				}
			}
		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Failed to validate user logs: ${errorMessage}`);
		}

		return { validated: totalValidated, corrupted: totalCorrupted };
	}

	/**
	 * Update log statistics and monitoring data
	 */
	async updateLogStatistics() {
		try {
			const stats = {
				systemLogs: await this.getDirectoryStats(this.systemLogsDir),
				userLogs: await this.getUserLogsStats(),
				totalDiskUsage: 0,
				fileCount: 0,
				oldestLog: null,
				newestLog: null
			};

			stats.totalDiskUsage = stats.systemLogs.size + stats.userLogs.size;
			stats.fileCount = stats.systemLogs.fileCount + stats.userLogs.fileCount;

			loggingService.info('Log storage statistics updated', {
				component: 'log_storage',
				diskUsage: {
					totalBytes: stats.totalDiskUsage,
					totalMB: Math.round(stats.totalDiskUsage / 1024 / 1024 * 100) / 100,
					systemLogsMB: Math.round(stats.systemLogs.size / 1024 / 1024 * 100) / 100,
					userLogsMB: Math.round(stats.userLogs.size / 1024 / 1024 * 100) / 100
				},
				fileCount: stats.fileCount,
				health: this.cleanupStats.errors.length === 0 ? 'healthy' : 'degraded'
			});

		} catch (/** @type {unknown} */ error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.cleanupStats.errors.push(`Failed to update log statistics: ${errorMessage}`);
		}
	}

	/**
	 * Get directory statistics
	 * @param {string} directory - Directory to analyze
	 * @returns {Promise<DirectoryStats>} Directory statistics
	 */
	async getDirectoryStats(directory) {
		const stats = { size: 0, fileCount: 0 };

		try {
			if (!fs.existsSync(directory)) {
				return stats;
			}

			const files = fs.readdirSync(directory);
			
			for (const file of files) {
				const filePath = path.join(directory, file);
				const fileStats = fs.statSync(filePath);
				
				if (fileStats.isFile()) {
					stats.size += fileStats.size;
					stats.fileCount++;
				}
			}
		} catch (error) {
			// Silent error - stats will remain 0
		}

		return stats;
	}

	/**
	 * Get user logs statistics
	 * @returns {Promise<UserLogsStats>} User logs statistics
	 */
	async getUserLogsStats() {
		const stats = { size: 0, fileCount: 0, userCount: 0, instanceCount: 0 };

		try {
			if (!fs.existsSync(this.userLogsDir)) {
				return stats;
			}

			const userDirs = fs.readdirSync(this.userLogsDir);
			stats.userCount = userDirs.length;
			
			for (const userDir of userDirs) {
				const userPath = path.join(this.userLogsDir, userDir);
				if (!fs.statSync(userPath).isDirectory()) continue;

				const mcpDirs = fs.readdirSync(userPath);
				stats.instanceCount += mcpDirs.length;
				
				for (const mcpDir of mcpDirs) {
					const mcpPath = path.join(userPath, mcpDir);
					if (!fs.statSync(mcpPath).isDirectory()) continue;

					const dirStats = await this.getDirectoryStats(mcpPath);
					stats.size += dirStats.size;
					stats.fileCount += dirStats.fileCount;
				}
			}
		} catch (error) {
			// Silent error - stats will remain 0
		}

		return stats;
	}

	/**
	 * Check if directory is empty
	 * @param {string} directory - Directory to check
	 * @returns {boolean} True if directory is empty
	 */
	isDirectoryEmpty(directory) {
		try {
			const files = fs.readdirSync(directory);
			return files.length === 0;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Get maintenance status and statistics
	 * @returns {Object} Maintenance status
	 */
	getMaintenanceStatus() {
		return {
			isRunning: this.maintenanceInterval !== null,
			lastRun: this.cleanupStats.lastRun,
			stats: { ...this.cleanupStats },
			nextRun: this.maintenanceInterval ? 
				new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
		};
	}

	/**
	 * Force immediate maintenance run
	 */
	async forceMaintenanceRun() {
		if (this.maintenanceInterval) {
			return this.performCompleteMaintenance();
		} else {
			throw new Error('Automated maintenance is not running');
		}
	}
}

// Create and export singleton instance
const logMaintenanceService = new LogMaintenanceService();

module.exports = logMaintenanceService;