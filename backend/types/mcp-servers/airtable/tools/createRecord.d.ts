export = setupCreateRecordTool;
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
 * @typedef {Object} CreateRecordParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {Record<string, any>} fields - Object containing field names and their values
 */
/**
 * Setup create_record tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
declare function setupCreateRecordTool(server: MCPServer, airtableService: import("../services/airtableService.js").AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
declare namespace setupCreateRecordTool {
    export { MCPServer, ServiceConfig, CreateRecordParams };
}
type MCPServer = {
    /**
     * - Tool registration function
     */
    tool: Function;
};
type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Display name
     */
    displayName: string;
};
type CreateRecordParams = {
    /**
     * - The ID of the Airtable base
     */
    baseId: string;
    /**
     * - The ID or name of the table
     */
    tableId: string;
    /**
     * - Object containing field names and their values
     */
    fields: Record<string, any>;
};
//# sourceMappingURL=createRecord.d.ts.map