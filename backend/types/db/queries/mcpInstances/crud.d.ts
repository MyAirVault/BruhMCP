export type MCPInstanceFilters = import('./types.js').MCPInstanceFilters;
export type MCPInstanceRecord = import('./types.js').MCPInstanceRecord;
export type MCPInstanceUpdateData = import('./types.js').MCPInstanceUpdateData;
/**
 * @typedef {import('./types.js').MCPInstanceFilters} MCPInstanceFilters
 * @typedef {import('./types.js').MCPInstanceRecord} MCPInstanceRecord
 * @typedef {import('./types.js').MCPInstanceUpdateData} MCPInstanceUpdateData
 */
/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID to filter instances
 * @param {MCPInstanceFilters} [filters={}] - Optional filters for status, type, and pagination
 * @returns {Promise<MCPInstanceRecord[]>} Array of MCP instance records
 * @throws {Error} When database query fails
 */
export function getAllMCPInstances(userId: string, filters?: import("./types.js").MCPInstanceFilters | undefined): Promise<MCPInstanceRecord[]>;
/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID to retrieve
 * @param {string} userId - User ID for authorization check
 * @returns {Promise<MCPInstanceRecord|null>} MCP instance record or null if not found
 * @throws {Error} When database query fails
 */
export function getMCPInstanceById(instanceId: string, userId: string): Promise<MCPInstanceRecord | null>;
/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID to update
 * @param {string} userId - User ID for authorization check
 * @param {MCPInstanceUpdateData} updateData - Object containing fields to update
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null if not found
 * @throws {Error} When no update data provided or database query fails
 */
export function updateMCPInstance(instanceId: string, userId: string, updateData: MCPInstanceUpdateData): Promise<MCPInstanceRecord | null>;
/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID to delete
 * @param {string} userId - User ID for authorization check
 * @returns {Promise<boolean>} True if instance was deleted, false if not found
 * @throws {Error} When database query fails
 */
export function deleteMCPInstance(instanceId: string, userId: string): Promise<boolean>;
//# sourceMappingURL=crud.d.ts.map