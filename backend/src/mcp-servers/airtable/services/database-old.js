/**
 * Database Service
 * Database operations for Airtable MCP service
 */

import { createLogger } from '../utils/logger.js';
import { pool } from '../../../db/config.js';
import { AirtableErrorHandler } from '../utils/error-handler.js';

const logger = createLogger('DatabaseService');

// Global database configuration
let isConnected = false;
const config = {
	tableName: 'airtable_instances'
};

/**
 * Initialize database connection
 * @returns {Promise<void>}
 */
export async function initialize() {
	try {
		// Test the pool connection
		const client = await pool.connect();
		client.release();
		isConnected = true;
		
		// Ensure table exists
		await createTableIfNotExists();
		
		logger.info('Database service initialized');
	} catch (error) {
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'initializeDatabase'
		});
		throw dbError;
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

	await pool.query(createTableQuery);
	await pool.query(createIndexQuery);
	
	logger.debug('Database table ensured', { tableName: config.tableName });
}

/**
 * Get instance credentials (required by middleware)
 * @param {string} instanceId - Instance ID
 * @returns {Promise<Object|null>} Instance record or null
 */
export async function getInstanceCredentials(instanceId) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.oauth_status,
			ms.status,
			ms.expires_at,
			ms.last_used_at,
			ms.usage_count,
			ms.custom_name,
			m.mcp_service_name,
			m.display_name,
			m.type as auth_type,
			m.is_active as service_active,
			c.api_key,
			c.client_id,
			c.client_secret,
			c.access_token,
			c.refresh_token,
			c.token_expires_at,
			c.oauth_completed_at
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
		WHERE ms.instance_id = $1
			AND m.mcp_service_name = 'airtable'
			AND ms.oauth_status = 'completed'
	`;

	try {
		const result = await pool.query(query, [instanceId]);
		return result.rows[0] || null;
	} catch (error) {
		console.error('Database error getting instance credentials:', error);
		throw new Error('Failed to retrieve instance credentials');
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

	// Check if service is globally active
	if (instance.service_active === false) {
		return {
			isValid: false,
			statusCode: 503,
			error: 'Service is currently disabled'
		};
	}
	
	// Check instance status
	if (instance.status !== 'active') {
		return {
			isValid: false,
			statusCode: 403,
			error: 'Instance is not active'
		};
	}
	
	// Check expiration
	if (instance.expires_at && new Date(instance.expires_at) < new Date()) {
		return {
			isValid: false,
			statusCode: 403,
			error: 'Instance has expired'
		};
	}
	
	// Check if API key is available (Airtable is API key only)
	if (instance.auth_type === 'api_key' && !instance.api_key && !instance.apiKeyHash) {
		return {
			isValid: false,
			statusCode: 500,
			error: 'No API key configured for this instance'
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
	const query = `
		UPDATE mcp_service_table 
		SET 
			last_used_at = CURRENT_TIMESTAMP,
			usage_count = COALESCE(usage_count, 0) + 1
		WHERE instance_id = $1
	`;
	try {
		await pool.query(query, [instanceId]);
	} catch (error) {
		console.error('Database error updating usage tracking:', error);
		// Don't throw error - usage tracking shouldn't break the request
	}
}

/**
 * Get API key for instance (required by middleware)
 * @param {Object} instance - Instance record
 * @returns {string} API key
 */
export function getApiKeyForInstance(instance) {
	// Check if instance has API key (following the main system's structure)
	if (instance.auth_type === 'api_key' && instance.api_key) {
		return instance.api_key;
	}
	
	// Fallback to check for apiKeyHash (legacy)
	if (instance.apiKeyHash) {
		return instance.apiKeyHash;
	}
	
	// Check for OAuth (not used by Airtable but for consistency)
	if (instance.auth_type === 'oauth') {
		throw new Error('OAuth authentication not supported for Airtable');
	}
	
	throw new Error('Invalid instance or missing API key');
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

		const result = await pool.query(query, [
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
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'storeInstance',
			instanceId
		});
		throw dbError;
	}
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

		const result = await pool.query(query, [instanceId]);
		
		if (result.rows.length === 0) {
			return null;
		}

		const instance = formatInstanceRecord(result.rows[0]);
		
		logger.debug('Instance retrieved', { instanceId });
		
		return instance;
	} catch (error) {
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'getInstance',
			instanceId
		});
		throw dbError;
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

		const result = await pool.query(query, [
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
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'updateInstanceMetadata',
			instanceId
		});
		throw dbError;
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

		const result = await pool.query(query, [instanceId]);
		const deleted = result.rowCount > 0;
		
		if (deleted) {
			logger.info('Instance deleted', { instanceId });
		}
		
		return deleted;
	} catch (error) {
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'deleteInstance',
			instanceId
		});
		throw dbError;
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

		const result = await pool.query(query, [limit, offset]);
		
		const instances = result.rows.map(row => formatInstanceRecord(row));
		
		logger.debug('Instances listed', { count: instances.length });
		
		return instances;
	} catch (error) {
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'listInstances',
			options
		});
		throw dbError;
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

		const result = await pool.query(query);
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
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'getStatistics'
		});
		throw dbError;
	}
}

/**
 * Clean up old instances
 * @param {number} olderThanDays - Delete instances older than this many days
 * @returns {Promise<number>} Number of instances cleaned up
 */
export async function cleanupOldInstances(olderThanDays = 30) {
	if (!isConnected) {
		throw new Error('Database not initialized');
	}

	try {
		const query = `
			UPDATE ${config.tableName} 
			SET 
				status = 'deleted',
				updated_at = CURRENT_TIMESTAMP
			WHERE 
				status = 'active' 
				AND last_used < CURRENT_TIMESTAMP - INTERVAL '${olderThanDays} days';
		`;

		const result = await pool.query(query);
		const cleanedCount = result.rowCount;
		
		logger.info('Old instances cleaned up', { cleanedCount, olderThanDays });
		
		return cleanedCount;
	} catch (error) {
		const dbError = AirtableErrorHandler.handle(error, {
			operation: 'cleanupOldInstances',
			olderThanDays
		});
		throw dbError;
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
		await pool.query('SELECT 1');
		
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
	if (isConnected) {
		// Pool will be closed automatically on process exit
		isConnected = false;
		
		logger.info('Database connection closed');
	}
}

