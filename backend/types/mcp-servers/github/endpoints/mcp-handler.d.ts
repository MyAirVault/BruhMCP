/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
export class GitHubMCPHandler {
    /**
     * @param {ServiceConfig} serviceConfig
     * @param {string} bearerToken
     */
    constructor(serviceConfig: ServiceConfig, bearerToken: string);
    serviceConfig: ServiceConfig;
    bearerToken: string;
    server: McpServer;
    githubService: GitHubService;
    globalVariableManager: GlobalVariableManager;
    /** @type {Record<string, StreamableHTTPServerTransport>} */
    transports: Record<string, StreamableHTTPServerTransport>;
    initialized: boolean;
    stats: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
        toolUsage: Map<any, any>;
    };
    /**
     * Setup MCP tools using Zod schemas with enhanced error handling
     */
    setupTools(): void;
    /**
     * Format response for MCP output
     * @param {*} data - Data to format
     * @param {string} type - Response type
     * @returns {string} Formatted response
     */
    formatResponse(data: any, type: string): string;
    /**
     * Handle tool errors with enhanced error information
     * @param {Error} error - Error object
     * @param {string} toolName - Tool name
     * @param {Object} params - Tool parameters
     * @returns {Object} MCP error response
     */
    handleToolError(error: Error, toolName: string, params?: Object): Object;
    /**
     * Update tool usage statistics
     * @param {string} toolName - Tool name
     */
    updateToolUsage(toolName: string): void;
    /**
     * Get handler statistics
     * @returns {Object} Handler statistics
     */
    getHandlerStatistics(): Object;
    /**
     * Handle MCP JSON-RPC request with enhanced session management
     * @param {Request} request - HTTP request object
     * @param {Response} response - HTTP response object
     * @param {Object} body - Parsed JSON body
     * @returns {Promise<void>}
     */
    handleMCPRequest(request: Request, response: Response, body: Object): Promise<void>;
    /**
     * Clean up handler resources with enhanced cleanup
     */
    cleanup(): void;
}
export default GitHubMCPHandler;
export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
    scopes: string[];
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GitHubService } from '../services/github-service.js';
import { GlobalVariableManager } from '../services/session/global-variable-manager.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
//# sourceMappingURL=mcp-handler.d.ts.map