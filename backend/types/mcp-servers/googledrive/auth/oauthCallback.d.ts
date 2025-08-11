export type ValidationResult = import("../../../services/mcp-auth-registry/types/serviceTypes.js").ValidationResult;
export type OAuthCallbackResult = import("../../../services/mcp-auth-registry/types/authTypes.js").OAuthCallbackResult;
export type OAuthStatusUpdate = import("../../../services/mcp-auth-registry/types/authTypes.js").OAuthStatusUpdate;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthStatusUpdate} OAuthStatusUpdate
 */
/**
 * Processes OAuth callback for Google Drive service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<ValidationResult>} OAuth callback result
 */
export function oauthCallback(code: string, state: string): Promise<ValidationResult>;
//# sourceMappingURL=oauthCallback.d.ts.map