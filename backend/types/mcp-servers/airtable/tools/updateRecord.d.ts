export = setupUpdateRecordTool;
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
 * @typedef {Object} UpdateRecordParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {string} recordId - The ID of the record to update
 * @property {Record<string, any>} fields - Object containing field names and their updated values
 */
/**
 * Setup update_record tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
declare function setupUpdateRecordTool(server: MCPServer, airtableService: import("../services/airtableService.js").AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
declare namespace setupUpdateRecordTool {
    export { MCPServer, ServiceConfig, UpdateRecordParams };
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
type UpdateRecordParams = {
    /**
     * - The ID of the Airtable base
     */
    baseId: string;
    /**
     * - The ID or name of the table
     */
    tableId: string;
    /**
     * - The ID of the record to update
     */
    recordId: string;
    /**
     * - Object containing field names and their updated values
     */
    fields: Record<string, any>;
};
//# sourceMappingURL=updateRecord.d.ts.map