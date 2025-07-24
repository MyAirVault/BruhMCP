export type RevocationResult = import("../../../services/mcp-auth-registry/types/serviceTypes.js").RevocationResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevocationResult} RevocationResult
 */
/**
 * Revokes Slack OAuth tokens and cleans up instance
 * @param {string} instanceId - MCP instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevocationResult>} Revocation result
 */
export function revokeInstance(instanceId: string, userId: string): Promise<RevocationResult>;
//# sourceMappingURL=revokeInstance.d.ts.map