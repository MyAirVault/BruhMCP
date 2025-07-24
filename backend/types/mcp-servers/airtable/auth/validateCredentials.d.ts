export type ValidationResult = import("../../../services/mcp-auth-registry/types/serviceTypes.js").ValidationResult;
export type CredentialsData = import("../../../services/mcp-auth-registry/types/serviceTypes.js").CredentialsData;
export type BaseValidationResult = import("../../../services/validation/baseValidator.js").ValidationResult;
export type AirtableCredentialsInput = {
    /**
     * - Primary API key field
     */
    api_key?: string | undefined;
    /**
     * - Alternative API key field
     */
    apiKey?: string | undefined;
    /**
     * - Alternative API token field
     */
    apiToken?: string | undefined;
};
export type NormalizedAirtableCredentials = {
    /**
     * - Normalized API key
     */
    api_key: string;
};
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 * @typedef {import('../../../services/validation/baseValidator.js').ValidationResult} BaseValidationResult
 */
/**
 * @typedef {Object} AirtableCredentialsInput
 * @property {string} [api_key] - Primary API key field
 * @property {string} [apiKey] - Alternative API key field
 * @property {string} [apiToken] - Alternative API token field
 */
/**
 * @typedef {Object} NormalizedAirtableCredentials
 * @property {string} api_key - Normalized API key
 */
/**
 * Validates Airtable API key credentials
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
export function validateCredentials(credentials: CredentialsData, userId: string): Promise<ValidationResult>;
//# sourceMappingURL=validateCredentials.d.ts.map