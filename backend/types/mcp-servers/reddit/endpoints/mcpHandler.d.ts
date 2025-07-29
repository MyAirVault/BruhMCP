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
     * @returns {import('zod').ZodObject<Record<string, import('zod').ZodType>>} Zod schema
     */
    convertJsonSchemaToZod(jsonSchema: Object): import('zod').ZodObject<Record<string, import('zod').ZodType>>;
    /**
     * Handle incoming MCP request using session-based transport
     * @param {any} req - Express request object
     * @param {any} res - Express response object
     * @param {any} message - MCP message
     * @returns {Promise<void>}
     */
    handleMCPRequest(req: any, res: any, message: any): Promise<void>;
    /**
     * Update bearer token for all active sessions
     * @param {string} newBearerToken
     */
    updateBearerToken(newBearerToken: string): void;
    /**
     * Get handler statistics
     * @returns {{serviceName: string, displayName: string, version: string, activeSessions: number, initialized: boolean, availableTools: number, bearerTokenPresent: boolean}} Handler statistics
     */
    getStatistics(): {
        serviceName: string;
        displayName: string;
        version: string;
        activeSessions: number;
        initialized: boolean;
        availableTools: number;
        bearerTokenPresent: boolean;
    };
    /**
     * Cleanup handler and close all sessions
     */
    cleanup(): Promise<void>;
}
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
//# sourceMappingURL=mcpHandler.d.ts.map