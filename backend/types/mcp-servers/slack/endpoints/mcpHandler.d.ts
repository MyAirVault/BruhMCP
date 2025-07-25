/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
export class SlackMCPHandler {
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
     * Setup MCP tools by registering all Slack tools
     */
    setupTools(): void;
    /**
     * Handle incoming MCP request using session-based transport
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('@modelcontextprotocol/sdk/types.js').JSONRPCRequest|import('@modelcontextprotocol/sdk/types.js').JSONRPCResponse|import('@modelcontextprotocol/sdk/types.js').JSONRPCNotification} message - MCP message
     * @returns {Promise<void>}
     */
    handleMCPRequest(req: import("express").Request, res: import("express").Response, message: import("@modelcontextprotocol/sdk/types.js").JSONRPCRequest | import("@modelcontextprotocol/sdk/types.js").JSONRPCResponse | import("@modelcontextprotocol/sdk/types.js").JSONRPCNotification): Promise<void>;
    /**
     * Create a new StreamableHTTPServerTransport with proper session handling
     * @returns {StreamableHTTPServerTransport} New transport instance
     */
    createNewTransport(): StreamableHTTPServerTransport;
    /**
     * Send bad request response
     * @param {import('express').Response} res - Express response
     * @param {import('@modelcontextprotocol/sdk/types.js').JSONRPCRequest|import('@modelcontextprotocol/sdk/types.js').JSONRPCResponse|import('@modelcontextprotocol/sdk/types.js').JSONRPCNotification} message - MCP message
     */
    sendBadRequestResponse(res: import("express").Response, message: import("@modelcontextprotocol/sdk/types.js").JSONRPCRequest | import("@modelcontextprotocol/sdk/types.js").JSONRPCResponse | import("@modelcontextprotocol/sdk/types.js").JSONRPCNotification): void;
    /**
     * Send internal error response
     * @param {import('express').Response} res - Express response
     * @param {import('@modelcontextprotocol/sdk/types.js').JSONRPCRequest|import('@modelcontextprotocol/sdk/types.js').JSONRPCResponse|import('@modelcontextprotocol/sdk/types.js').JSONRPCNotification} message - MCP message
     * @param {Error} error - Error object
     */
    sendInternalErrorResponse(res: import("express").Response, message: import("@modelcontextprotocol/sdk/types.js").JSONRPCRequest | import("@modelcontextprotocol/sdk/types.js").JSONRPCResponse | import("@modelcontextprotocol/sdk/types.js").JSONRPCNotification, error: Error): void;
}
export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
    scopes: string[];
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
//# sourceMappingURL=mcpHandler.d.ts.map