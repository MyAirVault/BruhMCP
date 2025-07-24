/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the instance is valid
 * @property {string} [error] - Error message if invalid
 * @property {number} [statusCode] - HTTP status code if invalid
 */
/**
 * Validate if instance is accessible
 * @param {{ service_active?: boolean, status?: string, oauth_status?: string, expires_at?: string, auth_type?: string, api_key?: string, client_id?: string, client_secret?: string, access_token?: string, refresh_token?: string, token_expires_at?: string }|null} instance - Instance data from database
 * @returns {ValidationResult} Validation result with isValid boolean and error message
 */
export function validateInstanceAccess(instance: {
    service_active?: boolean;
    status?: string;
    oauth_status?: string;
    expires_at?: string;
    auth_type?: string;
    api_key?: string;
    client_id?: string;
    client_secret?: string;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
} | null): ValidationResult;
/**
 * Get API key for Airtable service instance
 * @param {{ auth_type?: string, api_key?: string }} instance - Instance data from database
 * @returns {string|undefined} API key or undefined if not available
 */
export function getApiKeyForInstance(instance: {
    auth_type?: string;
    api_key?: string;
}): string | undefined;
/**
 * Get Airtable instance credentials without user authorization (SECURITY CONCERN)
 * TODO: This should be replaced with proper user authorization
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export function getAirtableInstanceCredentials(instanceId: string): Promise<Object | null>;
/**
 * Update Airtable instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - User ID for authorization
 * @returns {Promise<void>}
 */
export function updateAirtableUsageTracking(instanceId: string, userId: string): Promise<void>;
export type ValidationResult = {
    /**
     * - Whether the instance is valid
     */
    isValid: boolean;
    /**
     * - Error message if invalid
     */
    error?: string | undefined;
    /**
     * - HTTP status code if invalid
     */
    statusCode?: number | undefined;
};
//# sourceMappingURL=instanceUtils.d.ts.map