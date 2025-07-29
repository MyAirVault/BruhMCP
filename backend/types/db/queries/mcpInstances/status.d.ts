export type MCPInstanceRecord = import('./types.js').MCPInstanceRecord;
/**
 * @typedef {import('./types.js').MCPInstanceRecord} MCPInstanceRecord
 */
/**
 * Toggle MCP instance status
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {boolean} isActive - New active status
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function toggleMCPInstance(instanceId: string, userId: string, isActive: boolean): Promise<MCPInstanceRecord | null>;
/**
 * Renew MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Date} newExpirationDate - New expiration date
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function renewMCPInstance(instanceId: string, userId: string, newExpirationDate: Date): Promise<MCPInstanceRecord | null>;
/**
 * Update instance status only
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} status - New status (active, inactive, expired)
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function updateInstanceStatus(instanceId: string, userId: string, status: string): Promise<MCPInstanceRecord | null>;
/**
 * Update instance expiration and activate
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} newExpirationDate - New expiration date
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function renewInstanceExpiration(instanceId: string, userId: string, newExpirationDate: string): Promise<MCPInstanceRecord | null>;
//# sourceMappingURL=status.d.ts.map