/**
 * Handle MCP request
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {SheetsMCPHandler} handler - MCP handler instance
 */
export default function handleMCPRequest(req: import("express").Request, res: import("express").Response, handler: SheetsMCPHandler): Promise<void>;
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
/**
 * Google Sheets MCP Handler Class
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
    transports: {};
    initialized: boolean;
    /**
     * Get or create transport for a session
     * @param {string} sessionId - Session identifier
     * @returns {StreamableHTTPServerTransport} Transport instance
     */
    getTransport(sessionId: string): StreamableHTTPServerTransport;
    /**
     * Clean up transport for a session
     * @param {string} sessionId - Session identifier
     */
    cleanupTransport(sessionId: string): void;
    /**
     * Handle MCP request
     * @param {Object} message - MCP message
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object>} Response
     */
    handleRequest(message: Object, sessionId: string): Promise<Object>;
    /**
     * Check if handler is initialized
     * @returns {boolean} Initialization status
     */
    isInitialized(): boolean;
    /**
     * Update bearer token
     * @param {string} newToken - New bearer token
     */
    updateBearerToken(newToken: string): void;
    /**
     * Cleanup all resources
     */
    cleanup(): void;
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