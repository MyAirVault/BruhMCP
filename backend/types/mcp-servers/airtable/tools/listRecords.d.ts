export = setupListRecordsTool;
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
 * @typedef {Object} ListRecordsParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {string} [view] - The name or ID of a view
 * @property {string[]} [fields] - Array of field names to retrieve
 * @property {number} [maxRecords] - Maximum number of records to return
 * @property {Array<{field: string, direction?: 'asc' | 'desc'}>} [sort] - Array of sort objects
 * @property {string} [filterByFormula] - Formula to filter records
 * @property {boolean} [getAllRecords] - Get all records with automatic pagination
 */
/**
 * Setup list_records tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
declare function setupListRecordsTool(server: MCPServer, airtableService: import('../services/airtableService.js').AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
declare namespace setupListRecordsTool {
    export { MCPServer, ServiceConfig, ListRecordsParams };
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
type ListRecordsParams = {
    /**
     * - The ID of the Airtable base
     */
    baseId: string;
    /**
     * - The ID or name of the table
     */
    tableId: string;
    /**
     * - The name or ID of a view
     */
    view?: string | undefined;
    /**
     * - Array of field names to retrieve
     */
    fields?: string[] | undefined;
    /**
     * - Maximum number of records to return
     */
    maxRecords?: number | undefined;
    /**
     * - Array of sort objects
     */
    sort?: {
        field: string;
        direction?: "asc" | "desc" | undefined;
    }[] | undefined;
    /**
     * - Formula to filter records
     */
    filterByFormula?: string | undefined;
    /**
     * - Get all records with automatic pagination
     */
    getAllRecords?: boolean | undefined;
};
//# sourceMappingURL=listRecords.d.ts.map