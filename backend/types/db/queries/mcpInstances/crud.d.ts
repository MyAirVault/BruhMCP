/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID
 * @param {MCPInstanceFilters} [filters={}] - Optional filters
 * @returns {Promise<MCPInstanceRecord[]>} Array of MCP instance records
 */
export function getAllMCPInstances(userId: string, filters?: MCPInstanceFilters): Promise<MCPInstanceRecord[]>;
/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<MCPInstanceRecord|null>} MCP instance record or null
 */
export function getMCPInstanceById(instanceId: string, userId: string): Promise<MCPInstanceRecord | null>;
/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {MCPInstanceUpdateData} updateData - Data to update
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
export function updateMCPInstance(instanceId: string, userId: string, updateData: MCPInstanceUpdateData): Promise<MCPInstanceRecord | null>;
/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export function deleteMCPInstance(instanceId: string, userId: string): Promise<boolean>;
//# sourceMappingURL=crud.d.ts.map