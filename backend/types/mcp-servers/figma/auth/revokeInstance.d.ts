export type RevokeResult = import("../../../services/mcp-auth-registry/types/serviceTypes.js").RevokeResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevokeResult} RevokeResult
 */
/**
 * Revokes a Figma service instance
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevokeResult>} Revocation result
 */
export function revokeInstance(instanceId: string, userId: string): Promise<RevokeResult>;
//# sourceMappingURL=revokeInstance.d.ts.map