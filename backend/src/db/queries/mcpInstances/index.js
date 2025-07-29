/**
 * MCP Instances Query Module Index
 * @fileoverview Main export file for all MCP instances database operations
 * Provides a single import point for all functions previously in mcpInstancesQueries.js
 */

// Import all functions from each module
const {
	getAllMCPInstances,
	getMCPInstanceById,
	updateMCPInstance,
	deleteMCPInstance
} = require('./crud.js');

const {
	toggleMCPInstance,
	renewMCPInstance,
	updateInstanceStatus,
	renewInstanceExpiration
} = require('./status.js');

const {
	createMCPInstance,
	createMCPInstanceWithLimitCheck
} = require('./creation.js');

const {
	updateOAuthStatus,
	updateOAuthStatusWithLocking
} = require('./oauth.js');

const {
	getInstancesByStatus,
	getExpiredInstances,
	getFailedOAuthInstances,
	getPendingOAuthInstances,
	bulkMarkInstancesExpired
} = require('./maintenance.js');

const {
	getUserInstanceCount,
	updateMCPServiceStats
} = require('./statistics.js');

const {
	createTokenAuditLog,
	getTokenAuditLogs,
	getTokenAuditStats,
	cleanupTokenAuditLogs
} = require('./audit.js');

// Re-export all functions
module.exports = {
	// From crud.js
	getAllMCPInstances,
	getMCPInstanceById,
	updateMCPInstance,
	deleteMCPInstance,
	
	// From status.js
	toggleMCPInstance,
	renewMCPInstance,
	updateInstanceStatus,
	renewInstanceExpiration,
	
	// From creation.js
	createMCPInstance,
	createMCPInstanceWithLimitCheck,
	
	// From oauth.js
	updateOAuthStatus,
	updateOAuthStatusWithLocking,
	
	// From maintenance.js
	getInstancesByStatus,
	getExpiredInstances,
	getFailedOAuthInstances,
	getPendingOAuthInstances,
	bulkMarkInstancesExpired,
	
	// From statistics.js
	getUserInstanceCount,
	updateMCPServiceStats,
	
	// From audit.js
	createTokenAuditLog,
	getTokenAuditLogs,
	getTokenAuditStats,
	cleanupTokenAuditLogs
};