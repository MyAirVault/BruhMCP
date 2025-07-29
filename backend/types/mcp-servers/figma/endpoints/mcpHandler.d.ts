export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
};
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 */
export class FigmaMCPHandler {
    /**
     * @param {ServiceConfig} serviceConfig
     * @param {string} apiKey
     */
    constructor(serviceConfig: ServiceConfig, apiKey: string);
    serviceConfig: ServiceConfig;
    apiKey: string;
    server: McpServer;
    /** @type {Record<string, StreamableHTTPServerTransport>} */
    transports: Record<string, StreamableHTTPServerTransport>;
    initialized: boolean;
    figmaService: FigmaService;
    /**
     * Setup MCP tools using direct Zod schemas
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
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { FigmaService } from "../services/figmaService.js";
//# sourceMappingURL=mcpHandler.d.ts.map