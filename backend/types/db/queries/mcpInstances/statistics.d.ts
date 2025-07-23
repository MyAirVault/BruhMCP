/**
 * Get user instance count by status (only counts completed OAuth instances)
 * @param {string} userId - User ID
 * @param {string|null} [status=null] - Optional status filter (if not provided, counts active instances only)
 * @returns {Promise<number>} Number of instances with completed OAuth
 */
export function getUserInstanceCount(userId: string, status?: string | null): Promise<number>;
/**
 * Update MCP service statistics (increment counters)
 * @param {string} serviceId - Service ID
 * @param {MCPServiceStatsUpdate} updates - Statistics updates
 * @returns {Promise<MCPInstanceRecord|null>} Updated service record
 */
export function updateMCPServiceStats(serviceId: string, updates: MCPServiceStatsUpdate): Promise<MCPInstanceRecord | null>;
//# sourceMappingURL=statistics.d.ts.map