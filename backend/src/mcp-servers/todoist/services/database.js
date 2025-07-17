/**
 * Database Service
 * Database operations for Todoist MCP service
 */

import { createLogger } from '../../../utils/mcpInstanceLogger.js';
import { createConnection } from '../../../utils/connection-pool.js';

const logger = createLogger('TodoistDatabaseService');

// Global database connection and config
let connection = null;
let isConnected = false;
const config = {
	tableName: 'todoist_instances'
};

/**
 * Initialize database connection
 * @returns {Promise<void>}
 */
export async function initialize() {
	try {
		connection = await createConnection();
		isConnected = true;
		
		// Ensure table exists
		await createTableIfNotExists();
		
		logger.info('Database service initialized');
	} catch (error) {
		logger.error('Failed to initialize database', { error: error.message });
		throw error;
	}
}

/**
 * Create table if it doesn't exist
 * @returns {Promise<void>}
 */
async function createTableIfNotExists() {
	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS ${config.tableName} (
			id SERIAL PRIMARY KEY,
			instance_id VARCHAR(255) UNIQUE NOT NULL,
			api_key_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			use_count INTEGER DEFAULT 0,
			metadata JSONB DEFAULT '{}',
			status VARCHAR(50) DEFAULT 'active'
		);
	`;

	const createIndexQuery = `
		CREATE INDEX IF NOT EXISTS idx_${config.tableName}_instance_id 
		ON ${config.tableName} (instance_id);
	`;

	await connection.query(createTableQuery);
	await connection.query(createIndexQuery);
	
	logger.debug('Database table ensured', { tableName: config.tableName });
}

/**
 * Get instance credentials (required by middleware)
 * @param {string} instanceId - Instance ID
 * @returns {Promise<Object|null>} Instance record or null
 */
export async function getInstanceCredentials(instanceId) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			SELECT * FROM ${config.tableName} 
			WHERE instance_id = $1 AND status = 'active';
		`;

		const result = await connection.query(query, [instanceId]);
		
		if (result.rows.length === 0) {
			return null;
		}

		const instance = formatInstanceRecord(result.rows[0]);
		
		logger.debug('Instance credentials retrieved', { instanceId });
		
		return instance;
	} catch (error) {
		logger.error('Failed to get instance credentials', { instanceId, error: error.message });
		throw error;
	}
}

/**
 * Validate instance access (required by middleware)
 * @param {Object} instance - Instance record
 * @returns {Object} Validation result
 */
export function validateInstanceAccess(instance) {
	if (!instance) {
		return {
			isValid: false,
			statusCode: 404,
			error: 'Instance not found'
		};
	}

	if (instance.status !== 'active') {
		return {
			isValid: false,
			statusCode: 403,
			error: 'Instance is not active'
		};
	}

	return {
		isValid: true,
		statusCode: 200
	};
}

/**
 * Update usage tracking (required by middleware)
 * @param {string} instanceId - Instance ID
 * @returns {Promise<void>}
 */
export async function updateUsageTracking(instanceId) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			UPDATE ${config.tableName} 
			SET 
				last_used = CURRENT_TIMESTAMP,
				use_count = use_count + 1
			WHERE instance_id = $1 AND status = 'active';
		`;

		await connection.query(query, [instanceId]);
		
		logger.debug('Usage tracking updated', { instanceId });
	} catch (error) {
		logger.error('Failed to update usage tracking', { instanceId, error: error.message });
		throw error;
	}
}

/**
 * Get API key for instance (required by middleware)
 * @param {Object} instance - Instance record
 * @returns {string} API key
 */
export function getApiKeyForInstance(instance) {
	if (!instance || !instance.apiKeyHash) {
		throw new Error('Invalid instance or missing API key');
	}
	
	// For now, return the hash as is. In production, you'd decrypt it
	return instance.apiKeyHash;
}

/**
 * Store instance credentials
 * @param {string} instanceId - Instance ID
 * @param {string} apiKeyHash - Hashed API key
 * @param {Object} metadata - Instance metadata
 * @returns {Promise<Object>} Created instance record
 */
export async function storeInstance(instanceId, apiKeyHash, metadata = {}) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			INSERT INTO ${config.tableName} 
			(instance_id, api_key_hash, metadata, created_at, updated_at, last_used)
			VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			ON CONFLICT (instance_id) 
			DO UPDATE SET
				api_key_hash = EXCLUDED.api_key_hash,
				metadata = EXCLUDED.metadata,
				updated_at = CURRENT_TIMESTAMP
			RETURNING *;
		`;

		const result = await connection.query(query, [
			instanceId,
			apiKeyHash,
			JSON.stringify(metadata)
		]);

		const instance = result.rows[0];
		
		logger.info('Instance stored successfully', {
			instanceId,
			isUpdate: !!instance.id
		});

		return formatInstanceRecord(instance);
	} catch (error) {
		logger.error('Failed to store instance', { instanceId, error: error.message });
		throw error;
	}
}

/**
 * Format instance record
 * @param {Object} row - Database row
 * @returns {Object} Formatted instance record
 */
function formatInstanceRecord(row) {
	return {
		id: row.id,
		instanceId: row.instance_id,
		apiKeyHash: row.api_key_hash,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		lastUsed: row.last_used,
		useCount: row.use_count,
		metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
		status: row.status,
		// Add fields expected by middleware
		user_id: row.user_id || 'default_user',
		expires_at: row.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
	};
}

/**
 * Get instance by ID
 * @param {string} instanceId - Instance ID
 * @returns {Promise<Object|null>} Instance record or null
 */
export async function getInstance(instanceId) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			SELECT * FROM ${config.tableName} 
			WHERE instance_id = $1 AND status = 'active';
		`;

		const result = await connection.query(query, [instanceId]);
		
		if (result.rows.length === 0) {
			return null;
		}

		const instance = formatInstanceRecord(result.rows[0]);
		
		logger.debug('Instance retrieved', { instanceId });
		
		return instance;
	} catch (error) {
		logger.error('Failed to get instance', { instanceId, error: error.message });
		throw error;
	}
}

/**
 * Update instance metadata
 * @param {string} instanceId - Instance ID
 * @param {Object} metadata - Metadata to update
 * @returns {Promise<Object>} Updated instance record
 */
export async function updateInstanceMetadata(instanceId, metadata) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			UPDATE ${config.tableName} 
			SET 
				metadata = $2,
				updated_at = CURRENT_TIMESTAMP
			WHERE instance_id = $1 AND status = 'active'
			RETURNING *;
		`;

		const result = await connection.query(query, [
			instanceId,
			JSON.stringify(metadata)
		]);

		if (result.rows.length === 0) {
			return null;
		}

		const instance = formatInstanceRecord(result.rows[0]);
		
		logger.debug('Instance metadata updated', { instanceId });
		
		return instance;
	} catch (error) {
		logger.error('Failed to update instance metadata', { instanceId, error: error.message });
		throw error;
	}
}

/**
 * Delete instance
 * @param {string} instanceId - Instance ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteInstance(instanceId) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			UPDATE ${config.tableName} 
			SET 
				status = 'deleted',
				updated_at = CURRENT_TIMESTAMP
			WHERE instance_id = $1 AND status = 'active';
		`;

		const result = await connection.query(query, [instanceId]);
		const deleted = result.rowCount > 0;
		
		if (deleted) {
			logger.info('Instance deleted', { instanceId });
		}
		
		return deleted;
	} catch (error) {
		logger.error('Failed to delete instance', { instanceId, error: error.message });
		throw error;
	}
}

/**
 * List all instances
 * @param {Object} options - List options
 * @returns {Promise<Array>} Array of instance records
 */
export async function listInstances(options = {}) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const {
			limit = 100,
			offset = 0,
			orderBy = 'created_at',
			orderDirection = 'DESC'
		} = options;

		const query = `
			SELECT * FROM ${config.tableName} 
			WHERE status = 'active'
			ORDER BY ${orderBy} ${orderDirection}
			LIMIT $1 OFFSET $2;
		`;

		const result = await connection.query(query, [limit, offset]);
		
		const instances = result.rows.map(row => formatInstanceRecord(row));
		
		logger.debug('Instances listed', { count: instances.length });
		
		return instances;
	} catch (error) {
		logger.error('Failed to list instances', { error: error.message });
		throw error;
	}
}

/**
 * Get instance statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getStatistics() {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			SELECT 
				COUNT(*) as total_instances,
				COUNT(CASE WHEN status = 'active' THEN 1 END) as active_instances,
				COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted_instances,
				SUM(use_count) as total_uses,
				AVG(use_count) as average_uses,
				MAX(last_used) as most_recent_use,
				MIN(created_at) as oldest_instance
			FROM ${config.tableName};
		`;

		const result = await connection.query(query);
		const stats = result.rows[0];
		
		logger.debug('Statistics retrieved');
		
		return {
			totalInstances: parseInt(stats.total_instances),
			activeInstances: parseInt(stats.active_instances),
			deletedInstances: parseInt(stats.deleted_instances),
			totalUses: parseInt(stats.total_uses || 0),
			averageUses: parseFloat(stats.average_uses || 0),
			mostRecentUse: stats.most_recent_use,
			oldestInstance: stats.oldest_instance
		};
	} catch (error) {
		logger.error('Failed to get statistics', { error: error.message });
		throw error;
	}
}

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
	if (!isConnected) {
		return {
			status: 'unhealthy',
			connected: false,
			error: 'Database not initialized'
		};
	}

	try {
		await connection.query('SELECT 1');
		
		return {
			status: 'healthy',
			connected: true,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		return {
			status: 'unhealthy',
			connected: false,
			error: error.message
		};
	}
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
export async function close() {
	if (connection) {
		await connection.end();
		connection = null;
		isConnected = false;
		
		logger.info('Database connection closed');
	}
}