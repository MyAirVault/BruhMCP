export type OAuthCallbackData = import("../../../services/mcp-auth-registry/types/serviceTypes.js").OAuthCallbackData;
export type OAuthCallbackResult = import("../../../services/mcp-auth-registry/types/serviceTypes.js").OAuthCallbackResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').OAuthCallbackData} OAuthCallbackData
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').OAuthCallbackResult} OAuthCallbackResult
 */
/**
 * Processes OAuth callback for Google Drive service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<OAuthCallbackResult>} OAuth callback result
 */
export function oauthCallback(code: string, state: string): Promise<OAuthCallbackResult>;
//# sourceMappingURL=oauthCallback.d.ts.map