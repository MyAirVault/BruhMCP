export type OAuthResult = import("../../../services/mcp-auth-registry/types/service-types.js").OAuthResult;
export type CredentialsData = import("../../../services/mcp-auth-registry/types/service-types.js").CredentialsData;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').OAuthResult} OAuthResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').CredentialsData} CredentialsData
 */
/**
 * Initiates OAuth flow for Gmail service
 * @param {CredentialsData} credentials - OAuth credentials (clientId, clientSecret)
 * @param {string} userId - User ID initiating OAuth
 * @returns {Promise<OAuthResult>} OAuth initiation result
 */
export function initiateOAuth(credentials: CredentialsData, userId: string): Promise<OAuthResult>;
//# sourceMappingURL=initiate-oauth.d.ts.map