export type ValidationResult = import("../../../services/mcp-auth-registry/types/service-types.js").ValidationResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').ValidationResult} ValidationResult
 */
/**
 * Handles OAuth callback for Gmail service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<ValidationResult>} Callback processing result
 */
export function oauthCallback(code: string, state: string): Promise<ValidationResult>;
//# sourceMappingURL=oauth-callback.d.ts.map