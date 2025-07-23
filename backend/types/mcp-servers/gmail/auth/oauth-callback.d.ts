export type ValidationResult = import("../../../services/mcp-auth-registry/types/service-types.js").ValidationResult;
export type OAuthCallbackResult = import("../../../services/mcp-auth-registry/types/auth-types.js").OAuthCallbackResult;
export type OAuthStatusUpdate = import("../../../services/mcp-auth-registry/types/auth-types.js").OAuthStatusUpdate;
export type StateData = {
    /**
     * - MCP instance ID
     */
    instanceId: string;
    /**
     * - Timestamp when state was created
     */
    timestamp: number;
    /**
     * - Service name
     */
    service: string;
};
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/auth-types.js').OAuthCallbackResult} OAuthCallbackResult
 * @typedef {import('../../../services/mcp-auth-registry/types/auth-types.js').OAuthStatusUpdate} OAuthStatusUpdate
 */
/**
 * @typedef {Object} StateData
 * @property {string} instanceId - MCP instance ID
 * @property {number} timestamp - Timestamp when state was created
 * @property {string} service - Service name
 */
/**
 * Handles OAuth callback for Gmail service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<ValidationResult>} Callback processing result
 */
export function oauthCallback(code: string, state: string): Promise<ValidationResult>;
//# sourceMappingURL=oauth-callback.d.ts.map