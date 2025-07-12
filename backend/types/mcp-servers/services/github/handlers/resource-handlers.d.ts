/**
 * Handle resource content retrieval for MCP protocol
 * @param {Object} params - Resource retrieval parameters
 * @param {string} params.resourcePath - Path to the resource
 * @param {string} params.mcpType - MCP type
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} Resource content
 */
export function handleResourceContent({ resourcePath, mcpType, serviceConfig, apiKey }: {
    resourcePath: string;
    mcpType: string;
    serviceConfig: Object;
    apiKey: string;
}): Promise<Object>;
/**
 * Generate resources list based on service configuration
 * @param {Object} serviceConfig - Service configuration
 * @param {string} mcpType - MCP type
 * @returns {Array} List of available resources
 */
export function generateResources(serviceConfig: Object, mcpType: string): any[];
//# sourceMappingURL=resource-handlers.d.ts.map