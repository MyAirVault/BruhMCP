/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
export class NotionMCPHandler {
    /**
     * @param {ServiceConfig} serviceConfig
     * @param {string} bearerToken
     */
    constructor(serviceConfig: ServiceConfig, bearerToken: string);
    serviceConfig: ServiceConfig;
    bearerToken: string;
    server: McpServer;
    /** @type {Record<string, StreamableHTTPServerTransport>} */
    transports: Record<string, StreamableHTTPServerTransport>;
    initialized: boolean;
    /**
     * Setup MCP tools using Zod schemas
     */
    setupTools(): void;
    /**
     * Handle incoming MCP request using session-based transport
     * @param {any} req - Express request object
     * @param {any} res - Express response object
     * @param {any} message - MCP message
     * @returns {Promise<void>}
     */
    handleMCPRequest(req: any, res: any, message: any): Promise<void>;
}
export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
    scopes: string[];
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
//# sourceMappingURL=mcp-handler.d.ts.map