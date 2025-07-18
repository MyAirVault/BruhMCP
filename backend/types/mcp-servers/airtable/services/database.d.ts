/**
 * Get instance credentials and validate access
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export function getInstanceCredentials(instanceId: string): Promise<Object | null>;
/**
 * Validate if instance is accessible
 * @param {{ service_active?: boolean, status?: string, expires_at?: string, auth_type?: string, api_key?: string }|null} instance - Instance data from database
 * @returns {{ isValid: boolean, error?: string, statusCode?: number }} Validation result with isValid boolean and error message
 */
export function validateInstanceAccess(instance: {
    service_active?: boolean;
    status?: string;
    expires_at?: string;
    auth_type?: string;
    api_key?: string;
} | null): {
    isValid: boolean;
    error?: string;
    statusCode?: number;
};
/**
 * Update instance usage tracking
 * @param {string} instanceId - Instance ID
 */
export function updateUsageTracking(instanceId: string): Promise<void>;
/**
 * Get API key for Airtable service instance
 * @param {{ api_key?: string }} instance - Instance data from database
 */
export function getApiKeyForInstance(instance: {
    api_key?: string;
}): string | undefined;
/**
 * Initialize database connection
 * This is a no-op since we're using the main system's pool
 * @returns {Promise<void>}
 */
export function initialize(): Promise<void>;
//# sourceMappingURL=database.d.ts.map