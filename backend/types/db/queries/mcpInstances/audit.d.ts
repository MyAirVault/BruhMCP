export type TokenAuditData = import("./types.js").TokenAuditData;
export type AuditLogRecord = import("./types.js").AuditLogRecord;
export type AuditLogOptions = import("./types.js").AuditLogOptions;
export type AuditStats = import("./types.js").AuditStats;
/**
 * @typedef {import('./types.js').TokenAuditData} TokenAuditData
 * @typedef {import('./types.js').AuditLogRecord} AuditLogRecord
 * @typedef {import('./types.js').AuditLogOptions} AuditLogOptions
 * @typedef {import('./types.js').AuditStats} AuditStats
 */
/**
 * Create audit log entry for token operations
 * @param {TokenAuditData} auditData - Audit data including instance ID, operation type, and status
 * @returns {Promise<AuditLogRecord|null>} Created audit log entry or null if audit table doesn't exist
 * @throws {Error} When required fields are missing or database query fails
 */
export function createTokenAuditLog(auditData: TokenAuditData): Promise<AuditLogRecord | null>;
/**
 * Get audit logs for an instance
 * @param {string} instanceId - Instance ID to get audit logs for
 * @param {AuditLogOptions} [options={}] - Query options including limit, offset, filters, and date range
 * @returns {Promise<AuditLogRecord[]>} Array of audit log entries with parsed metadata
 * @throws {Error} When database query fails (returns empty array if audit table doesn't exist)
 */
export function getTokenAuditLogs(instanceId: string, options?: AuditLogOptions): Promise<AuditLogRecord[]>;
/**
 * Get audit log statistics
 * @param {string|undefined} [instanceId] - Instance ID (optional, for all instances if not provided)
 * @param {number} [days=30] - Number of days to include in statistics (default: 30)
 * @returns {Promise<AuditStats>} Comprehensive audit statistics including operations, errors, and daily breakdown
 * @throws {Error} When database query fails (returns empty stats if audit table doesn't exist)
 */
export function getTokenAuditStats(instanceId?: string | undefined, days?: number): Promise<AuditStats>;
/**
 * Clean up old audit logs
 * @param {number} [daysToKeep=90] - Number of days to keep audit logs (default: 90)
 * @returns {Promise<number>} Number of deleted audit log records
 * @throws {Error} When database query fails (returns 0 if audit table doesn't exist)
 */
export function cleanupTokenAuditLogs(daysToKeep?: number): Promise<number>;
//# sourceMappingURL=audit.d.ts.map