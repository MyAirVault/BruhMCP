/**
 * Database service for Slack MCP instance management
 * Handles instance credential lookup and usage tracking
 */

/**
 * Instance credentials record from database
 * @typedef {Object} InstanceCredentials
 * @property {string} instance_id - UUID of the service instance
 * @property {string} user_id - UUID of the user
 * @property {string} oauth_status - OAuth completion status
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {Date|null} expires_at - Instance expiration date
 * @property {number} usage_count - Number of times instance has been used
 * @property {string|null} custom_name - User-defined name for instance
 * @property {Date|null} last_used_at - Last usage timestamp
 * @property {string} mcp_service_name - Name of the MCP service
 * @property {string} display_name - Display name of the service
 * @property {string} auth_type - Authentication type
 * @property {boolean} service_active - Whether service is active
 * @property {number|null} port - Service port number
 * @property {string|null} api_key - API key if applicable
 * @property {string|null} client_id - OAuth client ID
 * @property {string|null} client_secret - OAuth client secret
 * @property {string|null} access_token - OAuth access token
 * @property {string|null} refresh_token - OAuth refresh token
 * @property {Date|null} token_expires_at - Token expiration timestamp
 * @property {Date|null} oauth_completed_at - OAuth completion timestamp
 * @property {string|null} team_id - Slack team ID
 * @property {string|null} team_name - Slack team name
 */

/**
 * Instance statistics record from database
 * @typedef {Object} InstanceStatistics
 * @property {string} instance_id - UUID of the service instance
 * @property {string} user_id - UUID of the user
 * @property {string} status - Instance status
 * @property {number} usage_count - Number of times instance has been used
 * @property {Date|null} last_used_at - Last usage timestamp
 * @property {Date} created_at - Instance creation timestamp
 * @property {Date|null} expires_at - Instance expiration date
 * @property {string|null} custom_name - User-defined name for instance
 * @property {string} mcp_service_name - Name of the MCP service
 * @property {string} display_name - Display name of the service
 * @property {string|null} team_id - Slack team ID
 * @property {string|null} team_name - Slack team name
 */

/**
 * Active instance record from database
 * @typedef {Object} ActiveInstance
 * @property {string} instance_id - UUID of the service instance
 * @property {string} user_id - UUID of the user
 * @property {number} usage_count - Number of times instance has been used
 * @property {Date|null} last_used_at - Last usage timestamp
 * @property {Date} created_at - Instance creation timestamp
 * @property {string|null} custom_name - User-defined name for instance
 * @property {string|null} team_id - Slack team ID
 * @property {string|null} team_name - Slack team name
 */

/**
 * Slack workspace information from database
 * @typedef {Object} SlackWorkspaceInfo
 * @property {string} team_id - Slack team ID
 * @property {string} team_name - Slack team name
 * @property {string} access_token - OAuth access token
 * @property {Date|null} token_expires_at - Token expiration timestamp
 * @property {string|null} custom_name - User-defined name for instance
 * @property {string} user_id - UUID of the user
 */

/**
 * Team information for updating Slack team data
 * @typedef {Object} SlackTeamInfo
 * @property {string} team_id - Slack team ID
 * @property {string} team_name - Slack team name
 */

const { pool  } = require('../../../db/config');

/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (slack)
 * @returns {Promise<InstanceCredentials|null>} Instance credentials or null if not found
 */
async function lookupInstanceCredentials(instanceId, serviceName) {
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
        c.oauth_completed_at,
        c.team_id,
        c.team_name
      FROM mcp_service_table ms
      JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
      LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
      WHERE ms.instance_id = $1
        AND m.mcp_service_name = $2
        AND ms.oauth_status = 'completed'
    `;
    
    const result = await pool.query(query, [instanceId, serviceName]);
    
    if (result.rows.length === 0) {
      console.log(`ℹ️  No Slack instance found for ID: ${instanceId} (service: ${serviceName})`);
      return null;
    }
    
    const instance = result.rows[0];
    console.log(`✅ Found Slack instance credentials for: ${instanceId} (user: ${instance.user_id}, team: ${instance.team_id})`);
    
    return instance;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database lookup error:', error);
    throw new Error(`Failed to lookup Slack instance credentials: ${error.message}`);
  }
}

/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
async function updateInstanceUsage(instanceId) {
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
      console.warn(`⚠️  Could not update usage for Slack instance: ${instanceId} (not found)`);
      return false;
    }
    
    const { usage_count } = result.rows[0];
    console.log(`📊 Updated usage count for Slack instance ${instanceId}: ${usage_count}`);
    
    return true;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database usage update error:', error);
    // Don't throw error - usage tracking is not critical
    return false;
  }
}

/**
 * Get instance statistics
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<InstanceStatistics|null>} Instance statistics or null if not found
 */
async function getInstanceStatistics(instanceId) {
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
        m.display_name,
        c.team_id,
        c.team_name
      FROM mcp_service_table ms
      JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
      LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
      WHERE ms.instance_id = $1
    `;
    
    const result = await pool.query(query, [instanceId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database statistics query error:', error);
    throw new Error(`Failed to get Slack instance statistics: ${error.message}`);
  }
}

/**
 * Update instance status
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newStatus - New status (active, inactive, expired)
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
async function updateInstanceStatus(instanceId, newStatus) {
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
      console.warn(`⚠️  Could not update status for Slack instance: ${instanceId} (not found)`);
      return false;
    }
    
    console.log(`🔄 Updated status for Slack instance ${instanceId}: ${newStatus}`);
    return true;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database status update error:', error);
    throw new Error(`Failed to update Slack instance status: ${error.message}`);
  }
}

/**
 * Get all active instances for Slack service
 * @returns {Promise<ActiveInstance[]>} Array of active instance records
 */
async function getActiveSlackInstances() {
  try {
    
    const query = `
      SELECT 
        ms.instance_id,
        ms.user_id,
        ms.usage_count,
        ms.last_used_at,
        ms.created_at,
        ms.custom_name,
        c.team_id,
        c.team_name
      FROM mcp_service_table ms
      JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
      LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
      WHERE m.mcp_service_name = 'slack'
        AND ms.status = 'active'
        AND ms.oauth_status = 'completed'
        AND (ms.expires_at IS NULL OR ms.expires_at > NOW())
        AND m.is_active = true
      ORDER BY ms.last_used_at DESC NULLS LAST
    `;
    
    const result = await pool.query(query);
    
    console.log(`📊 Found ${result.rows.length} active Slack instances`);
    return result.rows;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database active instances query error:', error);
    throw new Error(`Failed to get active Slack instances: ${error.message}`);
  }
}

/**
 * Validate instance exists and is accessible
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - UUID of the user (for additional security)
 * @returns {Promise<boolean>} Promise that resolves to true if instance is valid and accessible
 */
async function validateInstanceAccess(instanceId, userId) {
  try {
    
    const query = `
      SELECT 1
      FROM mcp_service_table ms
      JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
      WHERE ms.instance_id = $1
        AND ms.user_id = $2
        AND m.mcp_service_name = 'slack'
        AND ms.status IN ('active', 'inactive')
        AND ms.oauth_status = 'completed'
        AND (ms.expires_at IS NULL OR ms.expires_at > NOW())
        AND m.is_active = true
    `;
    
    const result = await pool.query(query, [instanceId, userId]);
    
    const isValid = result.rows.length > 0;
    console.log(`🔐 Slack instance access validation for ${instanceId}: ${isValid ? 'GRANTED' : 'DENIED'}`);
    
    return isValid;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database instance validation error:', error);
    return false;
  }
}

/**
 * Clean up expired instances
 * @returns {Promise<number>} Number of instances marked as expired
 */
async function cleanupExpiredInstances() {
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
      console.log(`⏰ Marked ${expiredCount} Slack instances as expired`);
      result.rows.forEach(row => {
        console.log(`⏰ Expired Slack instance: ${row.instance_id}`);
      });
    }
    
    return expiredCount;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database cleanup error:', error);
    throw new Error(`Failed to cleanup expired Slack instances: ${error.message}`);
  }
}

/**
 * Get Slack workspace information for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<SlackWorkspaceInfo|null>} Workspace information or null if not found
 */
async function getSlackWorkspaceInfo(instanceId) {
  try {
    
    const query = `
      SELECT 
        c.team_id,
        c.team_name,
        c.access_token,
        c.token_expires_at,
        ms.custom_name,
        ms.user_id
      FROM mcp_service_table ms
      JOIN mcp_credentials c ON ms.instance_id = c.instance_id
      WHERE ms.instance_id = $1
        AND ms.oauth_status = 'completed'
    `;
    
    const result = await pool.query(query, [instanceId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const workspace = result.rows[0];
    console.log(`✅ Found Slack workspace info for instance: ${instanceId} (team: ${workspace.team_name})`);
    
    return workspace;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database workspace info query error:', error);
    throw new Error(`Failed to get Slack workspace info: ${error.message}`);
  }
}

/**
 * Update Slack team information
 * @param {string} instanceId - UUID of the service instance
 * @param {SlackTeamInfo} teamInfo - Team information object
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
async function updateSlackTeamInfo(instanceId, teamInfo) {
  try {
    
    const query = `
      UPDATE mcp_credentials 
      SET 
        team_id = $2,
        team_name = $3,
        updated_at = NOW()
      WHERE instance_id = $1
      RETURNING instance_id, team_id, team_name
    `;
    
    const result = await pool.query(query, [instanceId, teamInfo.team_id, teamInfo.team_name]);
    
    if (result.rows.length === 0) {
      console.warn(`⚠️  Could not update team info for Slack instance: ${instanceId} (not found)`);
      return false;
    }
    
    console.log(`🏢 Updated team info for Slack instance ${instanceId}: ${teamInfo.team_name} (${teamInfo.team_id})`);
    return true;
    
  } catch (err) {
    /** @type {Error} */
    const error = /** @type {Error} */ (err);
    console.error('Database team info update error:', error);
    throw new Error(`Failed to update Slack team info: ${error.message}`);
  }
}
module.exports = {
  lookupInstanceCredentials,
  updateInstanceUsage,
  getInstanceStatistics,
  updateInstanceStatus,
  getActiveSlackInstances,
  validateInstanceAccess,
  cleanupExpiredInstances,
  getSlackWorkspaceInfo,
  updateSlackTeamInfo
};