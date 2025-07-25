/**
 * Database service for Dropbox MCP instance management
 * Handles instance credential lookup and usage tracking
 */

import { pool } from '../../../db/config.js';

/**
 * Instance credentials with service information from database query
 * @typedef {Object} InstanceCredentials
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {string} oauth_status - OAuth status (pending, completed, failed, expired)
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {string|null} expires_at - Expiration timestamp
 * @property {number} usage_count - Usage count
 * @property {string|null} custom_name - Custom name for the instance
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} mcp_service_name - MCP service name
 * @property {string} display_name - Service display name
 * @property {string} auth_type - Service type ('api_key' or 'oauth')
 * @property {boolean} service_active - Whether the service is active
 * @property {number} port - Service port
 * @property {string|null} api_key - API key (only for api_key type services)
 * @property {string|null} client_id - OAuth client ID
 * @property {string|null} client_secret - OAuth client secret
 * @property {string|null} access_token - OAuth access token
 * @property {string|null} refresh_token - OAuth refresh token
 * @property {string|null} token_expires_at - Token expiration timestamp
 * @property {string|null} oauth_completed_at - OAuth completion timestamp
 */

/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (dropbox)
 * @returns {Promise<InstanceCredentials|null>} Instance credentials or null if not found
 */
export async function lookupInstanceCredentials(instanceId, serviceName) {
  try {
    
    const query = `
      SELECT 
        ms.instance_id,
        ms.user_id,
        ms.oauth_status,
        ms.status,
        ms.expires_at,
        ms.usage_count,
        ms.custom_name,
        ms.last_used_at,
        m.mcp_service_name,
        m.display_name,
        m.type as auth_type,
        m.is_active as service_active,
        m.port,
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
        AND m.mcp_service_name = $2
        AND ms.oauth_status = 'completed'
    `;
    
    const result = await pool.query(query, [instanceId, serviceName]);
    
    if (result.rows.length === 0) {
      console.log(`ℹ️  No instance found for ID: ${instanceId} (service: ${serviceName})`);
      return null;
    }
    
    const instance = result.rows[0];
    console.log(`✅ Found instance credentials for: ${instanceId} (user: ${instance.user_id})`);
    
    return instance;
    
  } catch (error) {
    console.error('Database lookup error:', error);
    throw new Error(`Failed to lookup instance credentials: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<boolean>} True if update was successful
 */
export async function updateInstanceUsage(instanceId) {
  try {
    
    const query = `
      UPDATE mcp_service_table 
      SET 
        usage_count = usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
      WHERE instance_id = $1
      RETURNING instance_id, usage_count
    `;
    
    const result = await pool.query(query, [instanceId]);
    
    if (result.rows.length === 0) {
      console.warn(`⚠️  Could not update usage for instance: ${instanceId} (not found)`);
      return false;
    }
    
    const { usage_count } = result.rows[0];
    console.log(`📊 Updated usage count for instance ${instanceId}: ${usage_count}`);
    
    return true;
    
  } catch (error) {
    console.error('Database usage update error:', error instanceof Error ? error.message : String(error));
    // Don't throw error - usage tracking is not critical
    return false;
  }
}

/**
 * Instance statistics from database query
 * @typedef {Object} InstanceStatistics
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {number} usage_count - Usage count
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string|null} expires_at - Expiration timestamp
 * @property {string|null} custom_name - Custom name for the instance
 * @property {string} mcp_service_name - MCP service name
 * @property {string} display_name - Service display name
 */

/**
 * Get instance statistics
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<InstanceStatistics|null>} Instance statistics or null if not found
 */
export async function getInstanceStatistics(instanceId) {
  try {
    
    const query = `
      SELECT 
        ms.instance_id,
        ms.user_id,
        ms.status,
        ms.usage_count,
        ms.last_used_at,
        ms.created_at,
        ms.expires_at,
        ms.custom_name,
        m.mcp_service_name,
        m.display_name
      FROM mcp_service_table ms
      JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
      WHERE ms.instance_id = $1
    `;
    
    const result = await pool.query(query, [instanceId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
    
  } catch (error) {
    console.error('Database statistics query error:', error);
    throw new Error(`Failed to get instance statistics: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update instance status
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newStatus - New status (active, inactive, expired)
 * @returns {Promise<boolean>} True if update was successful
 */
export async function updateInstanceStatus(instanceId, newStatus) {
  try {
    
    const query = `
      UPDATE mcp_service_table 
      SET 
        status = $2,
        updated_at = NOW()
      WHERE instance_id = $1
      RETURNING instance_id, status
    `;
    
    const result = await pool.query(query, [instanceId, newStatus]);
    
    if (result.rows.length === 0) {
      console.warn(`⚠️  Could not update status for instance: ${instanceId} (not found)`);
      return false;
    }
    
    console.log(`🔄 Updated status for instance ${instanceId}: ${newStatus}`);
    return true;
    
  } catch (error) {
    console.error('Database status update error:', error);
    throw new Error(`Failed to update instance status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Active Dropbox instance record from database query
 * @typedef {Object} ActiveDropboxInstance
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {number} usage_count - Usage count
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string|null} custom_name - Custom name for the instance
 */

/**
 * Get all active instances for Dropbox service
 * @returns {Promise<ActiveDropboxInstance[]>} Array of active instance records
 */
export async function getActiveDropboxInstances() {
  try {
    
    const query = `
      SELECT 
        ms.instance_id,
        ms.user_id,
        ms.usage_count,
        ms.last_used_at,
        ms.created_at,
        ms.custom_name
      FROM mcp_service_table ms
      JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
      WHERE m.mcp_service_name = 'dropbox'
        AND ms.status = 'active'
        AND ms.oauth_status = 'completed'
        AND (ms.expires_at IS NULL OR ms.expires_at > NOW())
        AND m.is_active = true
      ORDER BY ms.last_used_at DESC NULLS LAST
    `;
    
    const result = await pool.query(query);
    
    console.log(`📊 Found ${result.rows.length} active Dropbox instances`);
    return result.rows;
    
  } catch (error) {
    console.error('Database active instances query error:', error);
    throw new Error(`Failed to get active Dropbox instances: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate instance exists and is accessible
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - UUID of the user (for additional security)
 * @returns {Promise<boolean>} True if instance is valid and accessible
 */
export async function validateInstanceAccess(instanceId, userId) {
  try {
    
    const query = `
      SELECT 1
      FROM mcp_service_table ms
      JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
      WHERE ms.instance_id = $1
        AND ms.user_id = $2
        AND m.mcp_service_name = 'dropbox'
        AND ms.status IN ('active', 'inactive')
        AND ms.oauth_status = 'completed'
        AND (ms.expires_at IS NULL OR ms.expires_at > NOW())
        AND m.is_active = true
    `;
    
    const result = await pool.query(query, [instanceId, userId]);
    
    const isValid = result.rows.length > 0;
    console.log(`🔐 Instance access validation for ${instanceId}: ${isValid ? 'GRANTED' : 'DENIED'}`);
    
    return isValid;
    
  } catch (error) {
    console.error('Database instance validation error:', error);
    return false;
  }
}

/**
 * Clean up expired instances
 * @returns {Promise<number>} Number of instances marked as expired
 */
export async function cleanupExpiredInstances() {
  try {
    
    const query = `
      UPDATE mcp_service_table 
      SET 
        status = 'expired',
        updated_at = NOW()
      WHERE status = 'active'
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
      RETURNING instance_id
    `;
    
    const result = await pool.query(query);
    
    const expiredCount = result.rows.length;
    if (expiredCount > 0) {
      console.log(`⏰ Marked ${expiredCount} instances as expired`);
      result.rows.forEach(row => {
        console.log(`⏰ Expired instance: ${row.instance_id}`);
      });
    }
    
    return expiredCount;
    
  } catch (error) {
    console.error('Database cleanup error:', error);
    throw new Error(`Failed to cleanup expired instances: ${error instanceof Error ? error.message : String(error)}`);
  }
}