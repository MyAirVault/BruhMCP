export type CallbackResult = import("../../../services/mcp-auth-registry/types/serviceTypes.js").CallbackResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CallbackResult} CallbackResult
 */
/**
 * Handles OAuth callback for Slack service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<CallbackResult>} Callback processing result
 */
export function oauthCallback(code: string, state: string): Promise<CallbackResult>;
//# sourceMappingURL=oauthCallback.d.ts.map