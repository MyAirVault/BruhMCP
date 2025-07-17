/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
export class RedditMCPHandler {
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
     * Convert JSON schema to Zod schema
     * @param {Object} jsonSchema - JSON schema object
     * @returns {Object} Zod schema
     */
    convertJsonSchemaToZod(jsonSchema: Object): Object;
    /**
     * Handle incoming HTTP request
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} res
     */
    handleMCPRequest(req: import("http").IncomingMessage, res: import("http").ServerResponse): Promise<void>;
    /**
     * Update bearer token for all active sessions
     * @param {string} newBearerToken
     */
    updateBearerToken(newBearerToken: string): void;
    /**
     * Get handler statistics
     * @returns {Object} Handler statistics
     */
    getStatistics(): Object;
    /**
     * Cleanup handler and close all sessions
     */
    cleanup(): Promise<void>;
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