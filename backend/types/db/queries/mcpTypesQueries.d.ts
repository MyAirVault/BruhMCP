/**
 * @typedef {Object} MCPServiceType
 * @property {string} mcp_service_id - Unique identifier for the MCP service
 * @property {string} mcp_service_name - Service name (e.g., 'figma', 'github')
 * @property {string} display_name - Human-readable display name
 * @property {string} description - Service description
 * @property {string} icon_url_path - Path to service icon
 * @property {number} port - Service port number
 * @property {string} type - Service type
 * @property {boolean} is_active - Whether the service is active
 * @property {number} active_instances_count - Count of active instances
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
/**
 * @typedef {Object} MCPTypeStats
 * @property {number} [active_instances_count] - Number of active instances
 */
/**
 * Get all MCP service types
 * @param {boolean} [activeOnly=false] - Whether to return only active services
 * @returns {Promise<MCPServiceType[]>} Array of MCP service type records
 */
export function getAllMCPTypes(activeOnly?: boolean): Promise<MCPServiceType[]>;
/**
 * Get MCP service type by name
 * @param {string} serviceName - Service name (e.g., 'figma', 'github')
 * @returns {Promise<MCPServiceType|null>} MCP service type record or null
 */
export function getMCPTypeByName(serviceName: string): Promise<MCPServiceType | null>;
/**
 * Get MCP service type by ID
 * @param {string} serviceId - Service ID (UUID)
 * @returns {Promise<MCPServiceType|null>} MCP service type record or null
 */
export function getMCPTypeById(serviceId: string): Promise<MCPServiceType | null>;
/**
 * Update MCP service type statistics
 * @param {string} serviceId - Service ID
 * @param {MCPTypeStats} stats - Statistics to update
 * @returns {Promise<MCPServiceType|null>} Updated service record or null
 */
export function updateMCPTypeStats(serviceId: string, stats: MCPTypeStats): Promise<MCPServiceType | null>;
/**
 * Enable or disable MCP service type
 * @param {string} serviceId - Service ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<MCPServiceType|null>} Updated service record or null
 */
export function toggleMCPType(serviceId: string, isActive: boolean): Promise<MCPServiceType | null>;
export type MCPServiceType = {
    /**
     * - Unique identifier for the MCP service
     */
    mcp_service_id: string;
    /**
     * - Service name (e.g., 'figma', 'github')
     */
    mcp_service_name: string;
    /**
     * - Human-readable display name
     */
    display_name: string;
    /**
     * - Service description
     */
    description: string;
    /**
     * - Path to service icon
     */
    icon_url_path: string;
    /**
     * - Service port number
     */
    port: number;
    /**
     * - Service type
     */
    type: string;
    /**
     * - Whether the service is active
     */
    is_active: boolean;
    /**
     * - Count of active instances
     */
    active_instances_count: number;
    /**
     * - Creation timestamp
     */
    created_at: Date;
    /**
     * - Last update timestamp
     */
    updated_at: Date;
};
export type MCPTypeStats = {
    /**
     * - Number of active instances
     */
    active_instances_count?: number | undefined;
};
//# sourceMappingURL=mcpTypesQueries.d.ts.map