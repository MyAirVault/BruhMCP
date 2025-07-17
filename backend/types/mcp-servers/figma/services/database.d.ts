/**
 * Get instance credentials and validate access
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export function getInstanceCredentials(instanceId: string): Promise<Object | null>;
/**
 * Validate if instance is accessible
 * @param {{ service_active?: boolean, status?: string, oauth_status?: string, expires_at?: string, auth_type?: string, api_key?: string, client_id?: string, client_secret?: string, access_token?: string, refresh_token?: string, token_expires_at?: string }|null} instance - Instance data from database
 * @returns {{ isValid: boolean, error?: string, statusCode?: number }} Validation result with isValid boolean and error message
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
} | null): {
    isValid: boolean;
    error?: string;
    statusCode?: number;
};
/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<void>}
 */
export function updateUsageTracking(instanceId: string): Promise<void>;
/**
 * Get API key for Figma service instance
 * @param {{ auth_type?: string, api_key?: string }} instance - Instance data from database
 */
export function getApiKeyForInstance(instance: {
    auth_type?: string;
    api_key?: string;
}): string | undefined;
//# sourceMappingURL=database.d.ts.map