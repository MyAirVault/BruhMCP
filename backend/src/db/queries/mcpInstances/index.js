/**
 * MCP Instances Query Module Index
 * @fileoverview Main export file for all MCP instances database operations
 * Provides a single import point for all functions previously in mcpInstancesQueries.js
 */

// Import and re-export all functions from each module
export {
	getAllMCPInstances,
	getMCPInstanceById,
	updateMCPInstance,
	deleteMCPInstance
} from './crud.js';

export {
	toggleMCPInstance,
	renewMCPInstance,
	updateInstanceStatus,
	renewInstanceExpiration
} from './status.js';

export {
	createMCPInstance,
	createMCPInstanceWithLimitCheck
} from './creation.js';

export {
	updateOAuthStatus,
	updateOAuthStatusWithLocking
} from './oauth.js';

export {
	getInstancesByStatus,
	getExpiredInstances,
	getFailedOAuthInstances,
	getPendingOAuthInstances,
	bulkMarkInstancesExpired
} from './maintenance.js';

export {
	getUserInstanceCount,
	updateMCPServiceStats
} from './statistics.js';

export {
	createTokenAuditLog,
	getTokenAuditLogs,
	getTokenAuditStats,
	cleanupTokenAuditLogs
} from './audit.js';

// Re-export all types for convenience
export * from './types.js';