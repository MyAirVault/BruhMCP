export type OAuthConfig = {
    bearerToken: string;
    instanceId: string;
    userId: string;
};
/**
 * @typedef {Object} OAuthConfig
 * @property {string} bearerToken
 * @property {string} instanceId
 * @property {string} userId
 */
export class SheetsMCPHandler {
    /**
     * @param {OAuthConfig} oauth
     */
    constructor(oauth: OAuthConfig);
    oauth: OAuthConfig;
    bearerToken: string;
    instanceId: string;
    userId: string;
    server: McpServer;
    transports: {};
    initialized: boolean;
    /**
     * Setup MCP tools using Zod schemas
     */
    setupTools(): void;
    /**
     * Handle MCP request
     * @param {Object} request - JSON-RPC request
     * @returns {Promise<Object>} JSON-RPC response
     */
    handleRequest(request: Object): Promise<Object>;
    /**
     * Update bearer token
     * @param {string} newToken - New bearer token
     */
    updateBearerToken(newToken: string): void;
    /**
     * Cleanup handler resources
     */
    cleanup(): Promise<void>;
}
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
//# sourceMappingURL=mcp-handler.d.ts.map