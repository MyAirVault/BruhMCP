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
 * @typedef {Object} CreateMultipleRecordsParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {Array<{fields: Record<string, any>}>} records - Array of record objects
 */
/**
 * Setup create_multiple_records tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
export function setupCreateMultipleRecordsTool(server: MCPServer, airtableService: import("../services/airtableService.js").AirtableService, measurePerformance: (operation: string, fn: Function) => Function, serviceConfig: ServiceConfig): void;
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
export type CreateMultipleRecordsParams = {
    /**
     * - The ID of the Airtable base
     */
    baseId: string;
    /**
     * - The ID or name of the table
     */
    tableId: string;
    /**
     * - Array of record objects
     */
    records: Array<{
        fields: Record<string, any>;
    }>;
};
//# sourceMappingURL=createMultipleRecords.d.ts.map