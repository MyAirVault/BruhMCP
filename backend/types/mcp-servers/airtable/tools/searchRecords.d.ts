export = setupSearchRecordsTool;
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
 * @typedef {Object} SearchRecordsParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} query - Search query to find in records
 * @property {string[]} [tables] - Array of table IDs to search
 * @property {string[]} [fields] - Array of field names to search in
 * @property {number} [maxRecords] - Maximum number of records to return
 */
/**
 * Setup search_records tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
declare function setupSearchRecordsTool(server: MCPServer, airtableService: import('../services/airtableService.js').AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
declare namespace setupSearchRecordsTool {
    export { MCPServer, ServiceConfig, SearchRecordsParams };
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
type SearchRecordsParams = {
    /**
     * - The ID of the Airtable base
     */
    baseId: string;
    /**
     * - Search query to find in records
     */
    query: string;
    /**
     * - Array of table IDs to search
     */
    tables?: string[] | undefined;
    /**
     * - Array of field names to search in
     */
    fields?: string[] | undefined;
    /**
     * - Maximum number of records to return
     */
    maxRecords?: number | undefined;
};
//# sourceMappingURL=searchRecords.d.ts.map