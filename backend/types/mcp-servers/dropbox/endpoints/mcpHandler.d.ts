export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
    scopes: string[];
};
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
export class DropboxMCPHandler {
    /**
     * @param {ServiceConfig} serviceConfig
     * @param {string} bearerToken
     */
    constructor(serviceConfig: ServiceConfig, bearerToken: string);
    serviceConfig: ServiceConfig;
    bearerToken: string;
    api: DropboxAPI;
    server: McpServer;
    /** @type {Record<string, StreamableHTTPServerTransport>} */
    transports: Record<string, StreamableHTTPServerTransport>;
    initialized: boolean;
    /**
     * Setup MCP tools using modular approach following Gmail pattern
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
import { DropboxAPI } from "../api/dropboxApi.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
//# sourceMappingURL=mcpHandler.d.ts.map