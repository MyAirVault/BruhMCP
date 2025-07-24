export type RevocationResult = import("../../../services/mcp-auth-registry/types/serviceTypes.js").RevocationResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevocationResult} RevocationResult
 */
/**
 * Revokes Google Drive MCP instance and cleans up resources
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID for authorization
 * @returns {Promise<RevocationResult>} Revocation result
 */
export function revokeInstance(instanceId: string, userId: string): Promise<RevocationResult>;
//# sourceMappingURL=revokeInstance.d.ts.map