export type ValidationResult = import("../../../services/mcp-auth-registry/types/service-types.js").ValidationResult;
export type CredentialsData = import("../../../services/mcp-auth-registry/types/service-types.js").CredentialsData;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').CredentialsData} CredentialsData
 */
/**
 * Validates Figma API key credentials
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
export function validateCredentials(credentials: CredentialsData, userId: string): Promise<ValidationResult>;
//# sourceMappingURL=validate-credentials.d.ts.map