export type OAuthUpdateData = import("./types.js").OAuthUpdateData;
export type MCPInstanceRecord = import("./types.js").MCPInstanceRecord;
/**
 * @typedef {import('./types.js').OAuthUpdateData} OAuthUpdateData
 * @typedef {import('./types.js').MCPInstanceRecord} MCPInstanceRecord
 */
/**
 * Update OAuth status and tokens for an instance
 * @param {string} instanceId - Instance ID
 * @param {OAuthUpdateData} oauthData - OAuth data
 * @returns {Promise<MCPInstanceRecord>} Updated instance record
 */
export function updateOAuthStatus(instanceId: string, oauthData: OAuthUpdateData): Promise<MCPInstanceRecord>;
/**
 * Update OAuth status and tokens with optimistic locking
 * @param {string} instanceId - Instance ID
 * @param {OAuthUpdateData} oauthData - OAuth data
 * @param {number} [maxRetries=3] - Maximum retry attempts (default: 3)
 * @returns {Promise<MCPInstanceRecord>} Updated instance record
 */
export function updateOAuthStatusWithLocking(instanceId: string, oauthData: OAuthUpdateData, maxRetries?: number): Promise<MCPInstanceRecord>;
//# sourceMappingURL=oauth.d.ts.map