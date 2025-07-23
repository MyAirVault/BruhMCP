/**
 * Create audit log entry for token operations
 * @param {TokenAuditData} auditData - Audit data
 * @returns {Promise<AuditLogRecord|null>} Created audit log entry
 */
export function createTokenAuditLog(auditData: TokenAuditData): Promise<AuditLogRecord | null>;
/**
 * Get audit logs for an instance
 * @param {string} instanceId - Instance ID
 * @param {AuditLogOptions} [options={}] - Query options
 * @returns {Promise<AuditLogRecord[]>} Array of audit log entries
 */
export function getTokenAuditLogs(instanceId: string, options?: AuditLogOptions): Promise<AuditLogRecord[]>;
/**
 * Get audit log statistics
 * @param {string|undefined} [instanceId] - Instance ID (optional, for all instances if not provided)
 * @param {number} [days=30] - Number of days to include (default: 30)
 * @returns {Promise<AuditStats>} Audit statistics
 */
export function getTokenAuditStats(instanceId?: string | undefined, days?: number): Promise<AuditStats>;
/**
 * Clean up old audit logs
 * @param {number} [daysToKeep=90] - Number of days to keep (default: 90)
 * @returns {Promise<number>} Number of deleted records
 */
export function cleanupTokenAuditLogs(daysToKeep?: number): Promise<number>;
//# sourceMappingURL=audit.d.ts.map