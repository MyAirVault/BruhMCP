import fetch from 'node-fetch';

/**
 * Handle resource content retrieval for MCP protocol
 * @param {Object} params - Resource retrieval parameters
 * @param {string} params.resourcePath - Path to the resource
 * @param {string} params.mcpType - MCP type
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} Resource content
 */
export async function handleResourceContent({ resourcePath, mcpType, serviceConfig, apiKey }) {
    if (resourcePath === `${mcpType}/user/profile`) {
        const baseURL = serviceConfig.api?.baseURL || serviceConfig.baseURL;
        const headers = {};
        
        // Construct authentication header based on service config
        if (serviceConfig.auth?.header) {
            headers[serviceConfig.auth.header] = apiKey;
        } else {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        
        const userInfo = await fetch(`${baseURL}${serviceConfig.endpoints.me}`, {
            headers,
        });
        
        if (!userInfo.ok) {
            throw new Error(`Failed to fetch user profile: ${userInfo.status} ${userInfo.statusText}`);
        }
        
        const data = await userInfo.json();
        return {
            contents: [
                {
                    uri: `${mcpType}://user/profile`,
                    mimeType: 'application/json',
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }
    
    // Handle files list resource
    if (resourcePath === `${mcpType}/files/list`) {
        const baseURL = serviceConfig.api?.baseURL || serviceConfig.baseURL;
        const headers = {};
        
        // Construct authentication header
        if (serviceConfig.auth?.header) {
            headers[serviceConfig.auth.header] = apiKey;
        } else {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        
        // Check if service has custom handler for files
        if (serviceConfig.customHandlers?.files) {
            const result = await serviceConfig.customHandlers.files(serviceConfig, apiKey);
            return {
                contents: [
                    {
                        uri: `${mcpType}://files/list`,
                        mimeType: 'application/json',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        
        // Fallback to standard files endpoint
        const filesEndpoint = serviceConfig.endpoints.files || '/files';
        const filesInfo = await fetch(`${baseURL}${filesEndpoint}`, {
            headers,
        });
        
        if (!filesInfo.ok) {
            throw new Error(`Failed to fetch files: ${filesInfo.status} ${filesInfo.statusText}`);
        }
        
        const data = await filesInfo.json();
        return {
            contents: [
                {
                    uri: `${mcpType}://files/list`,
                    mimeType: 'application/json',
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }
    
    throw new Error(`Resource ${resourcePath} not found`);
}

/**
 * Generate resources list based on service configuration
 * @param {Object} serviceConfig - Service configuration
 * @param {string} mcpType - MCP type
 * @returns {Array} List of available resources
 */
export function generateResources(serviceConfig, mcpType) {
    const resources = [];
    
    // Generate resources based on service configuration
    Object.keys(serviceConfig.endpoints).forEach(endpoint => {
        switch (endpoint) {
            case 'me':
                resources.push({
                    uri: `${mcpType}://user/profile`,
                    name: `${serviceConfig.name} User Profile`,
                    description: `Current user's ${serviceConfig.name} profile information`,
                    mimeType: 'application/json',
                });
                break;
            case 'files':
                resources.push({
                    uri: `${mcpType}://files/list`,
                    name: `${serviceConfig.name} Files`,
                    description: `List of files in ${serviceConfig.name}`,
                    mimeType: 'application/json',
                });
                break;
            case 'repos':
                resources.push({
                    uri: `${mcpType}://repositories/list`,
                    name: `${serviceConfig.name} Repositories`,
                    description: `List of repositories in ${serviceConfig.name}`,
                    mimeType: 'application/json',
                });
                break;
        }
    });
    
    // Add resources from service configuration if available
    if (serviceConfig.resources) {
        serviceConfig.resources.forEach(resource => {
            resources.push({
                uri: `${mcpType}://${resource.uri}`,
                name: resource.name || `${serviceConfig.name} ${resource.uri}`,
                description: resource.description || `${resource.uri} resource from ${serviceConfig.name}`,
                mimeType: 'application/json',
            });
        });
    }
    
    return resources;
}