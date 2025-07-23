/**
 * Audit logging operations for MCP instances
 * @fileoverview Contains functions for token audit logging and statistics
 */

import { pool } from '../../config.js';
import './types.js';

/**
 * Create audit log entry for token operations
 * @param {TokenAuditData} auditData - Audit data
 * @returns {Promise<AuditLogRecord|null>} Created audit log entry
 */
export async function createTokenAuditLog(auditData) {
	const { instanceId, operation, status, method, errorType, errorMessage, metadata, userId } = auditData;

	// Validate required fields
	if (!instanceId || !operation || !status) {
		throw new Error('Instance ID, operation, and status are required for audit log');
	}

	const query = `
		INSERT INTO token_audit_log (
			instance_id,
			user_id,
			operation,
			status,
			method,
			error_type,
			error_message,
			metadata,
			created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING *
	`;

	const params = [
		instanceId,
		userId || null,
		operation,
		status,
		method || null,
		errorType || null,
		errorMessage || null,
		metadata ? JSON.stringify(metadata) : null,
	];

	try {
		const result = await pool.query(query, params);
		return result.rows[0];
	} catch (error) {
		// If audit table doesn't exist, log error but don't fail the operation
		/** @type {{code?: string}} */
		const pgError = /** @type {any} */ (error);
		if (pgError.code === '42P01') {
			// relation does not exist
			console.warn('⚠️  Token audit table does not exist. Skipping audit log.');
			return null;
		}
		throw error;
	}
}

/**
 * Get audit logs for an instance
 * @param {string} instanceId - Instance ID
 * @param {AuditLogOptions} [options={}] - Query options
 * @returns {Promise<AuditLogRecord[]>} Array of audit log entries
 */
export async function getTokenAuditLogs(instanceId, options = {}) {
	const { limit = 50, offset = 0, operation, status, since } = options;

	let query = `
		SELECT 
			audit_id,
			instance_id,
			user_id,
			operation,
			status,
			method,
			error_type,
			error_message,
			metadata,
			created_at
		FROM token_audit_log
		WHERE instance_id = $1
	`;

	const params = [instanceId];
	let paramIndex = 2;

	// Add filters
	if (operation) {
		query += ` AND operation = $${paramIndex}`;
		params.push(operation);
		paramIndex++;
	}

	if (status) {
		query += ` AND status = $${paramIndex}`;
		params.push(status);
		paramIndex++;
	}

	if (since) {
		query += ` AND created_at >= $${paramIndex}`;
		params.push(since.toISOString());
		paramIndex++;
	}

	// Order and pagination
	query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
	params.push(limit.toString(), offset.toString());

	try {
		const result = await pool.query(query, params);

		// Parse metadata JSON
		return result.rows.map(row => ({
			...row,
			metadata: row.metadata ? JSON.parse(row.metadata) : null,
		}));
	} catch (error) {
		// If audit table doesn't exist, return empty array
		/** @type {{code?: string}} */
		const pgError = /** @type {any} */ (error);
		if (pgError.code === '42P01') {
			console.warn('⚠️  Token audit table does not exist. Returning empty audit log.');
			return [];
		}
		throw error;
	}
}

/**
 * Get audit log statistics
 * @param {string|undefined} [instanceId] - Instance ID (optional, for all instances if not provided)
 * @param {number} [days=30] - Number of days to include (default: 30)
 * @returns {Promise<AuditStats>} Audit statistics
 */
export async function getTokenAuditStats(instanceId, days = 30) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - days);

	let query = `
		SELECT 
			operation,
			status,
			method,
			error_type,
			COUNT(*) as count,
			DATE(created_at) as date
		FROM token_audit_log
		WHERE created_at >= $1
	`;

	const params = [cutoffDate.toISOString()];
	let paramIndex = 2;

	if (instanceId) {
		query += ` AND instance_id = $${paramIndex}`;
		params.push(instanceId);
		paramIndex++;
	}

	query += `
		GROUP BY operation, status, method, error_type, DATE(created_at)
		ORDER BY date DESC, operation, status
	`;

	try {
		const result = await pool.query(query, params);

		// Aggregate statistics
		/** @type {AuditStats} */
		const stats = {
			totalOperations: 0,
			operationsByType: /** @type {Object<string, number>} */ ({}),
			operationsByStatus: /** @type {Object<string, number>} */ ({}),
			operationsByMethod: /** @type {Object<string, number>} */ ({}),
			errorsByType: /** @type {Object<string, number>} */ ({}),
			dailyBreakdown: /** @type {Object<string, {total: number, success: number, failure: number}>} */ ({}),
		};

		result.rows.forEach(row => {
			const count = parseInt(row.count);
			stats.totalOperations += count;

			// By operation type
			const operationType = String(row.operation);
			stats.operationsByType[operationType] = (stats.operationsByType[operationType] || 0) + count;

			// By status
			const statusType = String(row.status);
			stats.operationsByStatus[statusType] = (stats.operationsByStatus[statusType] || 0) + count;

			// By method
			if (row.method) {
				const methodType = String(row.method);
				stats.operationsByMethod[methodType] = (stats.operationsByMethod[methodType] || 0) + count;
			}

			// By error type
			if (row.error_type) {
				const errorType = String(row.error_type);
				stats.errorsByType[errorType] = (stats.errorsByType[errorType] || 0) + count;
			}

			// Daily breakdown
			const dateStr = String(row.date);
			if (!stats.dailyBreakdown[dateStr]) {
				stats.dailyBreakdown[dateStr] = {
					total: 0,
					success: 0,
					failure: 0,
				};
			}
			stats.dailyBreakdown[dateStr].total += count;

			if (row.status === 'success') {
				stats.dailyBreakdown[dateStr].success += count;
			} else if (row.status === 'failure') {
				stats.dailyBreakdown[dateStr].failure += count;
			}
		});

		return stats;
	} catch (error) {
		// If audit table doesn't exist, return empty stats
		/** @type {{code?: string}} */
		const pgError = /** @type {any} */ (error);
		if (pgError.code === '42P01') {
			console.warn('⚠️  Token audit table does not exist. Returning empty stats.');
			return {
				totalOperations: 0,
				operationsByType: {},
				operationsByStatus: {},
				operationsByMethod: {},
				errorsByType: {},
				dailyBreakdown: {},
			};
		}
		throw error;
	}
}

/**
 * Clean up old audit logs
 * @param {number} [daysToKeep=90] - Number of days to keep (default: 90)
 * @returns {Promise<number>} Number of deleted records
 */
export async function cleanupTokenAuditLogs(daysToKeep = 90) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

	const query = `
		DELETE FROM token_audit_log
		WHERE created_at < $1
	`;

	try {
		const result = await pool.query(query, [cutoffDate]);
		const deletedCount = result.rowCount ?? 0;
		console.log(`🗑️  Cleaned up ${deletedCount} old audit log entries`);
		return deletedCount;
	} catch (error) {
		// If audit table doesn't exist, return 0
		/** @type {{code?: string}} */
		const pgError = /** @type {any} */ (error);
		if (pgError.code === '42P01') {
			console.warn('⚠️  Token audit table does not exist. Nothing to clean up.');
			return 0;
		}
		throw error;
	}
}