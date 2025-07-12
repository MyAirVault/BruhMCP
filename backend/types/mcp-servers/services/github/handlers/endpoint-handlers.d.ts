/**
 * Handle generic endpoint requests
 * @param {Object} params - Endpoint request parameters
 * @param {string} params.endpoint - Endpoint name
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} API response data
 */
export function handleGenericEndpoint({ endpoint, serviceConfig, apiKey }: {
    endpoint: string;
    serviceConfig: Object;
    apiKey: string;
}): Promise<Object>;
/**
 * Handle parameterized endpoint requests
 * @param {Object} params - Parameterized endpoint request parameters
 * @param {string} params.endpoint - Endpoint name
 * @param {Array} params.pathParams - Path parameters
 * @param {string} params.mcpType - MCP type
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} API response data
 */
export function handleParameterizedEndpoint({ endpoint, pathParams, mcpType, serviceConfig, apiKey }: {
    endpoint: string;
    pathParams: any[];
    mcpType: string;
    serviceConfig: Object;
    apiKey: string;
}): Promise<Object>;
/**
 * Handle user info endpoint requests
 * @param {Object} params - User info request parameters
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} User info data
 */
export function handleUserInfo({ serviceConfig, apiKey }: {
    serviceConfig: Object;
    apiKey: string;
}): Promise<Object>;
//# sourceMappingURL=endpoint-handlers.d.ts.map