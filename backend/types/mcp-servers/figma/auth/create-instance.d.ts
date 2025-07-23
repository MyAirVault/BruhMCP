export type InstanceResult = import("../../../services/mcp-auth-registry/types/service-types.js").InstanceResult;
export type InstanceData = import("../../../services/mcp-auth-registry/types/service-types.js").InstanceData;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').InstanceResult} InstanceResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').InstanceData} InstanceData
 */
/**
 * Creates a new Figma service instance
 * @param {InstanceData} instanceData - Instance creation data
 * @param {string} userId - User ID creating the instance
 * @returns {Promise<InstanceResult>} Instance creation result
 */
export function createInstance(instanceData: InstanceData, userId: string): Promise<InstanceResult>;
//# sourceMappingURL=create-instance.d.ts.map