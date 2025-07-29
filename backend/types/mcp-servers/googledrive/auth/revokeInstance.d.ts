export type RevokeResult = import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevokeResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevokeResult} RevokeResult
 */
/**
 * Revokes Google Drive MCP instance and cleans up resources
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID for authorization
 * @returns {Promise<RevokeResult>} Revocation result
 */
export function revokeInstance(instanceId: string, userId: string): Promise<RevokeResult>;
//# sourceMappingURL=revokeInstance.d.ts.map