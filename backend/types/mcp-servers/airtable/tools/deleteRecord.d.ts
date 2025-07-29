export = setupDeleteRecordTool;
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
 * @typedef {Object} DeleteRecordParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {string} recordId - The ID of the record to delete
 */
/**
 * Setup delete_record tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
declare function setupDeleteRecordTool(server: MCPServer, airtableService: import('../services/airtableService.js').AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
declare namespace setupDeleteRecordTool {
    export { MCPServer, ServiceConfig, DeleteRecordParams };
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
type DeleteRecordParams = {
    /**
     * - The ID of the Airtable base
     */
    baseId: string;
    /**
     * - The ID or name of the table
     */
    tableId: string;
    /**
     * - The ID of the record to delete
     */
    recordId: string;
};
//# sourceMappingURL=deleteRecord.d.ts.map