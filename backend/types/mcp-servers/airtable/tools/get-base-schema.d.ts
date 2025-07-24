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
 * @typedef {Object} GetBaseSchemaParams
 * @property {string} baseId - The ID of the Airtable base
 */
/**
 * Setup get_base_schema tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
export function setupGetBaseSchemaTool(server: MCPServer, airtableService: import("../services/airtableService.js").AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
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
export type GetBaseSchemaParams = {
    /**
     * - The ID of the Airtable base
     */
    baseId: string;
};
//# sourceMappingURL=get-base-schema.d.ts.map