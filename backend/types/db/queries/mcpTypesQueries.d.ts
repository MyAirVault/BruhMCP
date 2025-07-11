/**
 * Get all MCP types
 * @param {Object} options - Query options
 * @param {boolean} options.activeOnly - Filter by active status
 * @returns {Promise<Array>} Array of MCP types
 */
export function getAllMCPTypes({ activeOnly }?: { activeOnly: boolean }): Promise<any[]>;
/**
 * Get MCP type by name
 * @param {string} name - MCP type name
 * @returns {Promise<Object|null>} MCP type or null if not found
 */
export function getMCPTypeByName(name: string): Promise<object | null>;
/**
 * Get MCP type by ID
 * @param {string} id - MCP type ID
 * @returns {Promise<Object|null>} MCP type or null if not found
 */
export function getMCPTypeById(id: string): Promise<object | null>;
//# sourceMappingURL=mcpTypesQueries.d.ts.map
