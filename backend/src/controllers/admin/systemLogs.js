import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import loggingService from '../../services/logging/loggingService.js';
import logMaintenanceService from '../../services/logging/logMaintenanceService.js';

const readFile = promisify(fs.readFile);

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * Admin system logs controller
 * Provides access to system-wide logs for administrators
 */

const SYSTEM_LOGS_DIR = path.resolve('./logs/system');
const LOG_CATEGORIES = ['application', 'security', 'performance', 'audit', 'database', 'cache'];

/**
 * Get system logs with filtering and pagination
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getSystemLogs(req, res) {
	try {
		const {
			category = 'application',
			level,
			start_time,
			end_time,
			search,
			limit = 100,
			offset = 0
		} = req.query;

		// Validate category
		if (!LOG_CATEGORIES.includes(category)) {
			return res.status(400).json({
				error: {
					code: 'INVALID_CATEGORY',
					message: `Category must be one of: ${LOG_CATEGORIES.join(', ')}`,
					available_categories: LOG_CATEGORIES
				}
			});
		}

		// Validate pagination
		const limitNum = Math.min(parseInt(limit) || 100, 1000);
		const offsetNum = parseInt(offset) || 0;

		// Get logs from file
		const logs = await readSystemLogFile(category, {
			level,
			start_time,
			end_time,
			search,
			limit: limitNum,
			offset: offsetNum
		});

		// Get summary statistics
		const summary = await getLogSummary(category);

		res.status(200).json({
			data: {
				logs: logs.entries,
				pagination: {
					total: logs.total,
					limit: limitNum,
					offset: offsetNum,
					has_more: logs.total > offsetNum + limitNum
				},
				filters_applied: {
					category,
					level,
					start_time,
					end_time,
					search
				},
				summary
			}
		});

	} catch (error) {
		loggingService.logError(error, {
			operation: 'get_system_logs',
			userId: req.user?.id,
			critical: false
		});

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to retrieve system logs',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			}
		});
	}
}

/**
 * Get system health dashboard data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getSystemLogsDashboard(req, res) {
	try {
		const { time_range = '24h' } = req.query;

		// Get performance metrics
		const performanceMetrics = loggingService.getPerformanceMetrics(time_range);
		
		// Get error summary
		const errorSummary = loggingService.getErrorSummary(time_range);

		// Get log system health
		const logHealth = loggingService.getLoggingHealth();

		// Get disk usage
		const diskUsage = await getLogDiskUsage();

		// Get recent critical events
		const criticalEvents = await getRecentCriticalEvents(time_range);

		res.status(200).json({
			data: {
				time_range,
				performance_metrics: performanceMetrics,
				error_summary: errorSummary,
				log_system_health: logHealth,
				disk_usage: diskUsage,
				critical_events: criticalEvents,
				last_updated: new Date().toISOString()
			}
		});

	} catch (error) {
		loggingService.logError(error, {
			operation: 'get_system_logs_dashboard',
			userId: req.user?.id,
			critical: false
		});

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to retrieve dashboard data'
			}
		});
	}
}

/**
 * Export system logs
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function exportSystemLogs(req, res) {
	try {
		const {
			categories = ['application'],
			format = 'json',
			start_time,
			end_time,
			level,
			compression = false
		} = req.body;

		// Validate categories
		const validCategories = categories.filter(cat => LOG_CATEGORIES.includes(cat));
		if (validCategories.length === 0) {
			return res.status(400).json({
				error: {
					code: 'INVALID_CATEGORIES',
					message: 'At least one valid category is required'
				}
			});
		}

		// Generate export
		const exportData = await generateLogExport(validCategories, {
			format,
			start_time,
			end_time,
			level,
			compression
		});

		// Set appropriate headers
		const timestamp = new Date().toISOString().split('T')[0];
		const filename = `system_logs_${timestamp}.${format}${compression ? '.gz' : ''}`;

		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', getContentType(format, compression));

		if (compression) {
			res.setHeader('Content-Encoding', 'gzip');
		}

		// Log export activity
		loggingService.audit('System logs exported', {
			userId: req.user?.id,
			categories: validCategories,
			format,
			start_time,
			end_time,
			compression
		});

		res.send(exportData);

	} catch (error) {
		loggingService.logError(error, {
			operation: 'export_system_logs',
			userId: req.user?.id,
			critical: false
		});

		res.status(500).json({
			error: {
				code: 'EXPORT_FAILED',
				message: 'Failed to export system logs'
			}
		});
	}
}

/**
 * Get log maintenance status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getLogMaintenanceStatus(req, res) {
	try {
		const maintenanceStatus = logMaintenanceService.getMaintenanceStatus();
		
		res.status(200).json({
			data: {
				maintenance_status: maintenanceStatus,
				log_health: loggingService.getLoggingHealth(),
				disk_usage: await getLogDiskUsage()
			}
		});

	} catch (error) {
		loggingService.logError(error, {
			operation: 'get_log_maintenance_status',
			userId: req.user?.id,
			critical: false
		});

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to retrieve maintenance status'
			}
		});
	}
}

/**
 * Trigger manual log maintenance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function triggerLogMaintenance(req, res) {
	try {
		// Start maintenance asynchronously
		const maintenancePromise = logMaintenanceService.forceMaintenanceRun();

		// Log the manual trigger
		loggingService.audit('Manual log maintenance triggered', {
			userId: req.user?.id,
			action: 'manual_maintenance'
		});

		res.status(202).json({
			data: {
				message: 'Log maintenance started',
				status: 'in_progress',
				triggered_by: req.user?.id,
				started_at: new Date().toISOString()
			}
		});

		// Wait for completion (don't block response)
		maintenancePromise.catch(error => {
			loggingService.logError(error, {
				operation: 'manual_log_maintenance',
				userId: req.user?.id,
				critical: true
			});
		});

	} catch (error) {
		loggingService.logError(error, {
			operation: 'trigger_log_maintenance',
			userId: req.user?.id,
			critical: false
		});

		res.status(500).json({
			error: {
				code: 'MAINTENANCE_FAILED',
				message: 'Failed to trigger log maintenance'
			}
		});
	}
}

/**
 * Read system log file with filtering
 * @param {string} category - Log category
 * @param {Object} filters - Filtering options
 * @returns {Object} Log entries and metadata
 */
async function readSystemLogFile(category, filters) {
	const logFilePath = path.join(SYSTEM_LOGS_DIR, `${category}.log`);
	
	if (!fs.existsSync(logFilePath)) {
		return { entries: [], total: 0 };
	}

	try {
		const content = await readFile(logFilePath, 'utf8');
		const lines = content.split('\n').filter(line => line.trim());
		
		// Parse and filter entries
		let entries = [];
		for (const line of lines) {
			try {
				const entry = JSON.parse(line);
				if (matchesFilters(entry, filters)) {
					entries.push(entry);
				}
			} catch (parseError) {
				// Skip invalid JSON lines
				continue;
			}
		}

		// Sort by timestamp (newest first)
		entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		// Apply pagination
		const total = entries.length;
		const start = filters.offset || 0;
		const end = start + (filters.limit || 100);
		entries = entries.slice(start, end);

		return { entries, total };

	} catch (error) {
		throw new Error(`Failed to read log file ${category}: ${error.message}`);
	}
}

/**
 * Check if log entry matches filters
 * @param {Object} entry - Log entry
 * @param {Object} filters - Filter criteria
 * @returns {boolean} True if entry matches filters
 */
function matchesFilters(entry, filters) {
	// Level filter
	if (filters.level && entry.level !== filters.level) {
		return false;
	}

	// Time range filter
	if (filters.start_time || filters.end_time) {
		const entryTime = new Date(entry.timestamp);
		
		if (filters.start_time && entryTime < new Date(filters.start_time)) {
			return false;
		}
		
		if (filters.end_time && entryTime > new Date(filters.end_time)) {
			return false;
		}
	}

	// Search filter
	if (filters.search) {
		const searchTerm = filters.search.toLowerCase();
		const searchableText = `${entry.message} ${JSON.stringify(entry.metadata || {})}`.toLowerCase();
		
		if (!searchableText.includes(searchTerm)) {
			return false;
		}
	}

	return true;
}

/**
 * Get log summary statistics
 * @param {string} category - Log category
 * @returns {Object} Summary statistics
 */
async function getLogSummary(category) {
	try {
		const logFilePath = path.join(SYSTEM_LOGS_DIR, `${category}.log`);
		
		if (!fs.existsSync(logFilePath)) {
			return {
				total_entries: 0,
				levels: {},
				latest_entry: null,
				file_size_mb: 0
			};
		}

		const stats = fs.statSync(logFilePath);
		const content = await readFile(logFilePath, 'utf8');
		const lines = content.split('\n').filter(line => line.trim());

		const levels = {};
		let latestEntry = null;

		for (const line of lines) {
			try {
				const entry = JSON.parse(line);
				levels[entry.level] = (levels[entry.level] || 0) + 1;
				
				if (!latestEntry || new Date(entry.timestamp) > new Date(latestEntry.timestamp)) {
					latestEntry = entry;
				}
			} catch (parseError) {
				// Skip invalid lines
			}
		}

		return {
			total_entries: lines.length,
			levels,
			latest_entry: latestEntry,
			file_size_mb: Math.round(stats.size / 1024 / 1024 * 100) / 100
		};

	} catch (error) {
		return {
			total_entries: 0,
			levels: {},
			latest_entry: null,
			file_size_mb: 0,
			error: error.message
		};
	}
}

/**
 * Get log disk usage information
 * @returns {Object} Disk usage statistics
 */
async function getLogDiskUsage() {
	try {
		const systemStats = await getDirectorySize(SYSTEM_LOGS_DIR);
		const userStats = await getDirectorySize(path.resolve('../logs/users'));

		return {
			total_size_mb: Math.round((systemStats.size + userStats.size) / 1024 / 1024 * 100) / 100,
			system_logs_mb: Math.round(systemStats.size / 1024 / 1024 * 100) / 100,
			user_logs_mb: Math.round(userStats.size / 1024 / 1024 * 100) / 100,
			system_file_count: systemStats.fileCount,
			user_file_count: userStats.fileCount,
			last_updated: new Date().toISOString()
		};
	} catch (error) {
		return {
			error: error.message,
			total_size_mb: 0,
			system_logs_mb: 0,
			user_logs_mb: 0
		};
	}
}

/**
 * Get directory size recursively
 * @param {string} directory - Directory path
 * @returns {Object} Size and file count
 */
async function getDirectorySize(directory) {
	let size = 0;
	let fileCount = 0;

	try {
		if (!fs.existsSync(directory)) {
			return { size, fileCount };
		}

		const files = fs.readdirSync(directory);
		
		for (const file of files) {
			const filePath = path.join(directory, file);
			const stats = fs.statSync(filePath);
			
			if (stats.isDirectory()) {
				const subStats = await getDirectorySize(filePath);
				size += subStats.size;
				fileCount += subStats.fileCount;
			} else {
				size += stats.size;
				fileCount++;
			}
		}
	} catch (error) {
		// Silent error
	}

	return { size, fileCount };
}

/**
 * Get recent critical events
 * @param {string} timeRange - Time range for events
 * @returns {Array} Critical events
 */
async function getRecentCriticalEvents(timeRange) {
	try {
		// This would typically read from multiple log files
		// For now, return error summary
		const errorSummary = loggingService.getErrorSummary(timeRange);
		
		return errorSummary.recentErrors.map(error => ({
			timestamp: error.timestamp,
			level: 'error',
			message: error.message,
			service: error.service || 'system',
			critical: error.critical || false
		}));
	} catch (error) {
		return [];
	}
}

/**
 * Generate log export data
 * @param {Array} categories - Categories to export
 * @param {Object} options - Export options
 * @returns {Buffer|string} Export data
 */
async function generateLogExport(categories, options) {
	const exportData = [];

	for (const category of categories) {
		const logs = await readSystemLogFile(category, {
			start_time: options.start_time,
			end_time: options.end_time,
			level: options.level,
			limit: 10000 // Large limit for export
		});

		exportData.push(...logs.entries.map(entry => ({
			...entry,
			category
		})));
	}

	// Sort by timestamp
	exportData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

	// Format based on requested format
	let formattedData;
	switch (options.format) {
		case 'csv':
			formattedData = formatAsCSV(exportData);
			break;
		case 'txt':
			formattedData = formatAsText(exportData);
			break;
		default:
			formattedData = JSON.stringify(exportData, null, 2);
	}

	// Compress if requested
	if (options.compression) {
		const zlib = await import('zlib');
		return zlib.gzipSync(formattedData);
	}

	return formattedData;
}

/**
 * Format log data as CSV
 * @param {Array} data - Log data
 * @returns {string} CSV formatted data
 */
function formatAsCSV(data) {
	if (data.length === 0) return '';

	const headers = ['timestamp', 'level', 'category', 'message', 'service'];
	const csvLines = [headers.join(',')];

	for (const entry of data) {
		const row = [
			entry.timestamp,
			entry.level,
			entry.category,
			`"${entry.message.replace(/"/g, '""')}"`,
			entry.service || ''
		];
		csvLines.push(row.join(','));
	}

	return csvLines.join('\n');
}

/**
 * Format log data as plain text
 * @param {Array} data - Log data
 * @returns {string} Text formatted data
 */
function formatAsText(data) {
	return data.map(entry => 
		`[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.category}] ${entry.message}`
	).join('\n');
}

/**
 * Get content type for export format
 * @param {string} format - Export format
 * @param {boolean} compressed - Whether compressed
 * @returns {string} Content type
 */
function getContentType(format, compressed) {
	if (compressed) {
		return 'application/gzip';
	}

	switch (format) {
		case 'csv':
			return 'text/csv';
		case 'txt':
			return 'text/plain';
		default:
			return 'application/json';
	}
}