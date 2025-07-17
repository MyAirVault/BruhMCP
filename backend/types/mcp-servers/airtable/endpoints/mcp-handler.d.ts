/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
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
    measurePerformance: typeof measurePerformance | undefined;
    /**
     * Setup MCP tools using direct Zod schemas with enhanced functionality
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
    /**
     * Get handler statistics
     * @returns {Object} Handler statistics
     */
    getStatistics(): Object;
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
    name: string;
    displayName: string;
    version: string;
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { AirtableService } from '../services/airtable-service.js';
import { measurePerformance } from '../utils/logger.js';
//# sourceMappingURL=mcp-handler.d.ts.map