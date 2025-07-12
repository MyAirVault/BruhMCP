// @ts-check
import { z } from 'zod';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Zod validation schema for log export request
const logExportSchema = z.object({
	format: z.enum(['json', 'csv', 'txt']).default('json'),
	start_time: z.string().datetime().optional(),
	end_time: z.string().datetime().optional(),
	level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

/**
 * Export logs for an MCP instance
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function exportMCPLogs(req, res) {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// Validate UUID format
		if (!z.string().uuid().safeParse(id).success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid MCP instance ID format',
				},
			});
		}

		// Validate request body
		const validationResult = logExportSchema.safeParse(req.body);
		if (!validationResult.success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid request parameters',
					details: validationResult.error.errors.map(err => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
			});
		}

		const { format, start_time, end_time, level } = validationResult.data;

		// Build log file path: ./logs/users/user_{userId}/mcp_{id}/
		const logBasePath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'..',
			'..',
			'logs',
			'users',
			`user_${userId}`,
			`mcp_${id}`
		);

		try {
			// Check if log directory exists
			await stat(logBasePath);
		} catch {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance logs not found',
				},
			});
		}

		// Read log files
		const logFiles = ['app.log', 'access.log', 'error.log'];
		const allLogs = [];

		for (const logFile of logFiles) {
			try {
				const logPath = path.join(logBasePath, logFile);
				const content = await readFile(logPath, 'utf8');
				const lines = content.split('\n').filter(line => line.trim());

				for (const line of lines) {
					try {
						const logEntry = JSON.parse(line);

						// Filter by level if specified
						if (level && logEntry.level !== level) {
							continue;
						}

						// Filter by time range if specified
						if (start_time && new Date(logEntry.timestamp) < new Date(start_time)) {
							continue;
						}
						if (end_time && new Date(logEntry.timestamp) > new Date(end_time)) {
							continue;
						}

						allLogs.push({
							timestamp: logEntry.timestamp,
							level: logEntry.level,
							source: logFile.replace('.log', ''),
							message: logEntry.message,
							metadata: logEntry.metadata || {},
						});
					} catch {
						// Skip invalid JSON lines
						continue;
					}
				}
			} catch {
				// Skip missing log files
				continue;
			}
		}

		// Sort logs by timestamp (newest first)
		allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		// Generate export content based on format
		let exportContent = '';
		let contentType = 'application/json';
		let filename = `logs_${id}_${new Date().toISOString().split('T')[0]}.${format}`;

		switch (format) {
			case 'json': {
				exportContent = JSON.stringify(allLogs, null, 2);
				contentType = 'application/json';
				break;
			}
			case 'csv': {
				const csvHeaders = 'timestamp,level,source,message,metadata\n';
				const csvRows = allLogs
					.map(
						log =>
							`"${log.timestamp}","${log.level}","${log.source}","${log.message.replace(/"/g, '""')}","${JSON.stringify(log.metadata).replace(/"/g, '""')}"`
					)
					.join('\n');
				exportContent = csvHeaders + csvRows;
				contentType = 'text/csv';
				break;
			}
			case 'txt': {
				exportContent = allLogs
					.map(log => `[${log.timestamp}] ${log.level.toUpperCase()} [${log.source}] ${log.message}`)
					.join('\n');
				contentType = 'text/plain';
				break;
			}
		}

		// Set response headers for file download
		res.setHeader('Content-Type', contentType);
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Length', Buffer.byteLength(exportContent, 'utf8'));

		// Send the file content directly
		return res.status(200).send(exportContent);
	} catch (error) {
		console.error('Error in exportMCPLogs:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Internal server error',
			},
		});
	}
}
