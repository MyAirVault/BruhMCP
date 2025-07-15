/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 */
export class FigmaMCPJsonRpcHandler {
    /**
     * @param {ServiceConfig} serviceConfig
     * @param {string} apiKey
     */
    constructor(serviceConfig: ServiceConfig, apiKey: string);
    serviceConfig: ServiceConfig;
    apiKey: string;
    server: McpServer;
    transport: StreamableHTTPServerTransport | null;
    /**
     * Setup MCP tools using the official SDK - copying Figma-Context-MCP pattern
     */
    setupTools(): void;
    /**
     * Convert JSON schema to Zod schema for MCP SDK
     * @param {any} inputSchema - JSON schema object
     * @returns {any} Zod schema object
     */
    convertInputSchema(inputSchema: any): any;
    /**
     * Process incoming JSON-RPC message using StreamableHTTP transport like Figma-Context-MCP
     * @param {any} req - Express request object
     * @param {any} res - Express response object
     * @param {any} message - JSON-RPC message
     * @returns {Promise<void>}
     */
    processMessage(req: any, res: any, message: any): Promise<void>;
}
export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
//# sourceMappingURL=jsonrpc-handler.d.ts.map