export type MCPServer = {
    /**
     * - Tool registration function
     */
    tool: Function;
};
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Display name
     */
    displayName: string;
};
/**
 * @typedef {Object} MCPServer
 * @property {Function} tool - Tool registration function
 */
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 */
/**
 * Setup list_bases tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
export function setupListBasesTool(server: MCPServer, airtableService: import("../services/airtableService.js").AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
//# sourceMappingURL=list-bases.d.ts.map