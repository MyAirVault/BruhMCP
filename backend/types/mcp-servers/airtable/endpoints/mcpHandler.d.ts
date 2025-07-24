/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {string} version - Service version
 */
/**
 * @typedef {import('http').IncomingMessage & {headers: Record<string, string | undefined>}} RequestWithHeaders
 */
/**
 * @typedef {import('http').ServerResponse & {status: function(number): ResponseObject, json: function(Object): void}} ResponseObject
 */
/**
 * @typedef {Object} MCPMessage
 * @property {string} [id] - Message ID
 * @property {string} [method] - Method name
 */
/**
 * @typedef {Object} HandlerStatistics
 * @property {Object} handler - Handler statistics
 * @property {boolean} handler.initialized - Initialization status
 * @property {number} handler.activeSessions - Active session count
 * @property {ServiceConfig} handler.serviceConfig - Service configuration
 * @property {Object} service - Service statistics
 */
export class AirtableMCPHandler {
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
    airtableService: AirtableService;
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring(): void;
    /** @type {(operation: string, fn: Function) => Function} */
    measurePerformance: ((operation: string, fn: Function) => Function) | undefined;
    /**
     * Setup MCP tools using consolidated tool setup
     */
    setupTools(): void;
    /**
     * Handle incoming MCP request using session-based transport
     * @param {RequestWithHeaders} req - Express request object
     * @param {ResponseObject} res - Express response object
     * @param {MCPMessage} message - MCP message
     * @returns {Promise<void>}
     */
    handleMCPRequest(req: RequestWithHeaders, res: ResponseObject, message: MCPMessage): Promise<void>;
    /**
     * Get handler statistics
     * @returns {HandlerStatistics} Handler statistics
     */
    getStatistics(): HandlerStatistics;
    /**
     * Health check
     * @returns {Promise<Object>} Health status
     */
    healthCheck(): Promise<Object>;
    /**
     * Shutdown handler
     */
    shutdown(): Promise<void>;
}
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Service version
     */
    version: string;
};
export type RequestWithHeaders = import("http").IncomingMessage & {
    headers: Record<string, string | undefined>;
};
export type ResponseObject = import("http").ServerResponse & {
    status: (arg0: number) => ResponseObject;
    json: (arg0: Object) => void;
};
export type MCPMessage = {
    /**
     * - Message ID
     */
    id?: string | undefined;
    /**
     * - Method name
     */
    method?: string | undefined;
};
export type HandlerStatistics = {
    /**
     * - Handler statistics
     */
    handler: {
        initialized: boolean;
        activeSessions: number;
        serviceConfig: ServiceConfig;
    };
    /**
     * - Service statistics
     */
    service: Object;
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { AirtableService } from '../services/airtableService.js';
//# sourceMappingURL=mcpHandler.d.ts.map