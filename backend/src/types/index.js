// @ts-check

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {boolean} is_active
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date} [deleted_at]
 */

/**
 * @typedef {Object} MCPType
 * @property {string} mcp_service_id
 * @property {string} mcp_service_name
 * @property {string} display_name
 * @property {string} [description]
 * @property {string} [icon_url_path]
 * @property {number} port
 * @property {string} type
 * @property {boolean} is_active
 * @property {number} total_instances_created
 * @property {number} active_instances_count
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} MCPInstance
 * @property {string} id
 * @property {string} user_id
 * @property {string} mcp_type_id
 * @property {string} [api_key_id]
 * @property {string} [custom_name]
 * @property {number} instance_number
 * @property {string} access_token
 * @property {('active'|'inactive'|'expired')} status
 * @property {boolean} is_active
 * @property {('never'|'1h'|'6h'|'1day'|'30days')} expiration_option
 * @property {Date} [expires_at]
 * @property {Date} [last_renewed_at]
 * @property {Object} config
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} ApiKey
 * @property {string} id
 * @property {string} user_id
 * @property {string} mcp_type_id
 * @property {Object} encrypted_key
 * @property {string} [key_hint]
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date} [expires_at]
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [error]
 * @property {string} [message]
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page
 * @property {number} limit
 * @property {string} [sortBy]
 * @property {('asc'|'desc')} [sortOrder]
 */

/**
 * @typedef {Object} AuthTokenData
 * @property {string} email
 * @property {Date} expiry
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} SessionData
 * @property {string} userId
 * @property {Date} createdAt
 * @property {Date} expiresAt
 */

/**
 * @typedef {Object} AuthRequest
 * @property {string} email
 */

/**
 * @typedef {Object} AuthVerifyRequest
 * @property {string} token
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success
 * @property {string} [sessionToken]
 * @property {string} [message]
 * @property {string} [error]
 */


module.exports = {};
