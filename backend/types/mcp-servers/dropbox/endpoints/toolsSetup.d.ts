/**
 * Setup file operations tools for the MCP server
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - MCP server instance
 * @param {import('../api/dropboxApi.js').DropboxAPI} api - Dropbox API instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {string} serviceName - Service name for logging
 */
export function setupFileOperationsTools(server: import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, api: import("../api/dropboxApi.js").DropboxAPI, bearerToken: string, serviceName: string): void;
/**
 * Setup file management tools for the MCP server
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - MCP server instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {string} serviceName - Service name for logging
 */
export function setupFileManagementTools(server: import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, bearerToken: string, serviceName: string): void;
/**
 * Setup search and sharing tools for the MCP server
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - MCP server instance
 * @param {import('../api/dropboxApi.js').DropboxAPI} api - Dropbox API instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {string} serviceName - Service name for logging
 */
export function setupSearchAndSharingTools(server: import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, api: import("../api/dropboxApi.js").DropboxAPI, bearerToken: string, serviceName: string): void;
//# sourceMappingURL=toolsSetup.d.ts.map