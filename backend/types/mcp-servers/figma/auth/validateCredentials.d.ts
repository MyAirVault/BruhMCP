export type ValidationResult = import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult;
export type CredentialsData = import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData;
export type BaseValidationResult = import('../../../services/validation/baseValidator.js').ValidationResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 * @typedef {import('../../../services/validation/baseValidator.js').ValidationResult} BaseValidationResult
 */
/**
 * Validates Figma API key credentials
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
export function validateCredentials(credentials: CredentialsData, userId: string): Promise<ValidationResult>;
//# sourceMappingURL=validateCredentials.d.ts.map