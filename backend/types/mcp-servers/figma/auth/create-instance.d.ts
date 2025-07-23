export type InstanceResult = import("../../../services/mcp-auth-registry/types/service-types.js").InstanceResult;
export type InstanceData = import("../../../services/mcp-auth-registry/types/service-types.js").InstanceData;
export type ValidationResult = import("../../../services/validation/base-validator.js").ValidationResult;
export type MCPServiceType = import("../../../db/queries/mcpTypesQueries.js").MCPServiceType;
export type MCPInstanceRecord = import("../../../db/queries/mcpInstances/types.js").MCPInstanceRecord;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').InstanceResult} InstanceResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').InstanceData} InstanceData
 * @typedef {import('../../../services/validation/base-validator.js').ValidationResult} ValidationResult
 * @typedef {import('../../../db/queries/mcpTypesQueries.js').MCPServiceType} MCPServiceType
 * @typedef {import('../../../db/queries/mcpInstances/types.js').MCPInstanceRecord} MCPInstanceRecord
 */
/**
 * Creates a new Figma service instance
 * @param {InstanceData} instanceData - Instance creation data
 * @param {string} userId - User ID creating the instance
 * @returns {Promise<InstanceResult>} Instance creation result
 */
export function createInstance(instanceData: InstanceData, userId: string): Promise<InstanceResult>;
//# sourceMappingURL=create-instance.d.ts.map