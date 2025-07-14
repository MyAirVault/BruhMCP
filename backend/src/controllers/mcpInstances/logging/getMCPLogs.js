// @ts-check
import { z } from 'zod';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Zod validation schema for log query parameters
const logQuerySchema = z.object({
	start_time: z.string().datetime().optional(),
	end_time: z.string().datetime().optional(),
	level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
	limit: z.coerce.number().int().min(1).max(1000).default(100),
	offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Get logs for an MCP instance
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getMCPLogs(req, res) {
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

		// Validate query parameters
		const validationResult = logQuerySchema.safeParse(req.query);
		if (!validationResult.success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid query parameters',
					details: validationResult.error.errors.map(err => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
			});
		}

		const { start_time, end_time, level, limit, offset } = validationResult.data;

		// Build log file path: {projectRoot}/logs/users/user_{userId}/mcp_{id}/
		const projectRoot = path.resolve(__dirname, '../../../../../');
		const logBasePath = path.join(projectRoot, 'logs', 'users', `user_${userId}`, `mcp_${id}`);

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
							id: `${logEntry.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
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

		// Apply pagination
		const paginatedLogs = allLogs.slice(offset, offset + limit);

		return res.status(200).json({
			data: paginatedLogs,
			meta: {
				total: allLogs.length,
				limit,
				offset,
			},
		});
	} catch (error) {
		console.error('Error in getMCPLogs:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Internal server error',
			},
		});
	}
}
