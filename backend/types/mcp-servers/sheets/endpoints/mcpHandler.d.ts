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
export class SheetsMCPHandler {
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
     * Handle MCP request using session-based transport
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {Object} message - MCP message body
     */
    handleMCPRequest(req: import("express").Request, res: import("express").Response, message: Object): Promise<void>;
    /**
     * Clean up transport for a session
     * @param {string} sessionId - Session identifier
     */
    cleanupTransport(sessionId: string): void;
}
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
//# sourceMappingURL=mcpHandler.d.ts.map