export type RevocationResult = {
    /**
     * - Whether revocation succeeded
     */
    success: boolean;
    /**
     * - Human readable message
     */
    message: string;
};
/**
 * @typedef {Object} RevocationResult
 * @property {boolean} success - Whether revocation succeeded
 * @property {string} message - Human readable message
 */
/**
 * Revokes Slack OAuth tokens and cleans up instance
 * @param {string} instanceId - MCP instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevocationResult>} Revocation result
 */
export function revokeInstance(instanceId: string, userId: string): Promise<RevocationResult>;
//# sourceMappingURL=revokeInstance.d.ts.map