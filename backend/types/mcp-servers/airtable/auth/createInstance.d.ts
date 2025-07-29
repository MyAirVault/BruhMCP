export type InstanceResult = import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceResult;
export type InstanceData = import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceData;
export type ValidationResult = import('../../../services/validation/baseValidator.js').ValidationResult;
export type MCPServiceType = import('../../../db/queries/mcpTypesQueries.js').MCPServiceType;
export type MCPInstanceRecord = import('../../../db/queries/mcpInstances/types.js').MCPInstanceRecord;
export type AirtableCredentials = {
    /**
     * - API key from frontend
     */
    apiKey?: string | undefined;
    /**
     * - Alternative API token field
     */
    apiToken?: string | undefined;
    /**
     * - API key field
     */
    api_key?: string | undefined;
};
export type NormalizedCredentials = {
    /**
     * - Normalized API key
     */
    api_key: string;
};
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceResult} InstanceResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceData} InstanceData
 * @typedef {import('../../../services/validation/baseValidator.js').ValidationResult} ValidationResult
 * @typedef {import('../../../db/queries/mcpTypesQueries.js').MCPServiceType} MCPServiceType
 * @typedef {import('../../../db/queries/mcpInstances/types.js').MCPInstanceRecord} MCPInstanceRecord
 */
/**
 * @typedef {Object} AirtableCredentials
 * @property {string} [apiKey] - API key from frontend
 * @property {string} [apiToken] - Alternative API token field
 * @property {string} [api_key] - API key field
 */
/**
 * @typedef {Object} NormalizedCredentials
 * @property {string} api_key - Normalized API key
 */
/**
 * Creates a new Airtable service instance
 * @param {InstanceData} instanceData - Instance creation data
 * @param {string} userId - User ID creating the instance
 * @returns {Promise<InstanceResult>} Instance creation result
 */
export function createInstance(instanceData: InstanceData, userId: string): Promise<InstanceResult>;
//# sourceMappingURL=createInstance.d.ts.map