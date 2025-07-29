export type JSONRPCRequest = import('@modelcontextprotocol/sdk/types.js').JSONRPCRequest;
export type JSONRPCMessage = import('@modelcontextprotocol/sdk/types.js').JSONRPCMessage;
export type ExpressRequest = import('express').Request;
export type ExpressResponse = import('express').Response;
export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
    scopes: string[];
};
export type MCPToolResult = {
    isError?: boolean | undefined;
    content: Array<{
        type: string;
        text: string;
    }>;
};
export type MCPMessage = {
    method: string;
    id?: string | number | undefined;
    params?: Object | undefined;
};
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
/**
 * @typedef {Object} MCPToolResult
 * @property {boolean} [isError]
 * @property {Array<{type: string, text: string}>} content
 */
/**
 * @typedef {Object} MCPMessage
 * @property {string} method
 * @property {string|number} [id]
 * @property {Object} [params]
 */
export class GoogleDriveMCPHandler {
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
     * @param {ExpressRequest} req - Express request object
     * @param {ExpressResponse} res - Express response object
     * @param {JSONRPCRequest} message - MCP message
     * @returns {Promise<void>}
     */
    handleMCPRequest(req: ExpressRequest, res: ExpressResponse, message: JSONRPCRequest): Promise<void>;
}
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
//# sourceMappingURL=mcpHandler.d.ts.map