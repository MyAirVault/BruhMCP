/**
 * Get all MCP service types
 * @param {boolean} activeOnly - Whether to return only active services
 * @returns {Promise<Array>} Array of MCP service type records
 */
export function getAllMCPTypes(activeOnly?: boolean): Promise<any[]>;
/**
 * Get MCP service type by name
 * @param {string} serviceName - Service name (e.g., 'figma', 'github')
 * @returns {Promise<Object|null>} MCP service type record or null
 */
export function getMCPTypeByName(serviceName: string): Promise<Object | null>;
/**
 * Get MCP service type by ID
 * @param {string} serviceId - Service ID (UUID)
 * @returns {Promise<Object|null>} MCP service type record or null
 */
export function getMCPTypeById(serviceId: string): Promise<Object | null>;
/**
 * Update MCP service type statistics
 * @param {string} serviceId - Service ID
 * @param {Object} stats - Statistics to update
 * @returns {Promise<Object|null>} Updated service record or null
 */
export function updateMCPTypeStats(serviceId: string, stats: Object): Promise<Object | null>;
/**
 * Enable or disable MCP service type
 * @param {string} serviceId - Service ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object|null>} Updated service record or null
 */
export function toggleMCPType(serviceId: string, isActive: boolean): Promise<Object | null>;
//# sourceMappingURL=mcpTypesQueries.d.ts.map