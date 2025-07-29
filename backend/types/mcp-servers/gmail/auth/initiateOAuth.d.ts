export type OAuthResult = import('../../../services/mcp-auth-registry/types/serviceTypes.js').OAuthResult;
export type CredentialsData = import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').OAuthResult} OAuthResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */
/**
 * Initiates OAuth flow for Gmail service
 * @param {CredentialsData} credentials - OAuth credentials (clientId, clientSecret)
 * @param {string} userId - User ID initiating OAuth
 * @param {string} instanceId - Existing MCP instance ID
 * @returns {Promise<OAuthResult>} OAuth initiation result
 */
export function initiateOAuth(credentials: CredentialsData, userId: string, instanceId: string): Promise<OAuthResult>;
//# sourceMappingURL=initiateOAuth.d.ts.map