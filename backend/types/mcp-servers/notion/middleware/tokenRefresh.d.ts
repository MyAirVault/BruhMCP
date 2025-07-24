/**
 * Attempt token refresh with OAuth service or direct method
 * @param {string} refreshToken - Refresh token to use
 * @param {string} clientId - OAuth client ID
 * @param {string} clientSecret - OAuth client secret
 * @returns {Promise<{tokens: import('./types.js').NewTokens, method: string}>} Refresh result
 */
export function attemptTokenRefresh(refreshToken: string, clientId: string, clientSecret: string): Promise<{
    tokens: import("./types.js").NewTokens;
    method: string;
}>;
/**
 * Record successful refresh metrics
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {number} startTime - Start time of refresh operation
 * @returns {void}
 */
export function recordSuccessfulRefreshMetrics(instanceId: string, method: string, startTime: number): void;
/**
 * Record failed refresh metrics
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {number} startTime - Start time of refresh operation
 * @returns {void}
 */
export function recordFailedRefreshMetrics(instanceId: string, method: string, startTime: number): void;
/**
 * Update database with new tokens
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @returns {Promise<void>} Promise that resolves when database is updated
 */
export function updateDatabaseWithNewTokens(instanceId: string, newTokens: import("./types.js").NewTokens): Promise<void>;
/**
 * Process successful refresh result
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @param {string} method - Method used for refresh
 * @param {string} userId - User ID
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {number} startTime - Start time of refresh operation
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Processing result
 */
export function processSuccessfulRefresh(instanceId: string, newTokens: import("./types.js").NewTokens, method: string, userId: string, req: import("./types.js").ExpressRequest, startTime: number): Promise<import("./types.js").TokenRefreshResult>;
/**
 * Process failed refresh result
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error that occurred during refresh
 * @param {string} method - Method used for refresh
 * @param {number} startTime - Start time of refresh operation
 * @returns {import('./types.js').TokenRefreshResult} Processing result
 */
export function processFailedRefresh(instanceId: string, error: Error, method: string, startTime: number): import("./types.js").TokenRefreshResult;
/**
 * Main token refresh orchestration function
 * @param {string} instanceId - The instance ID
 * @param {string} refreshToken - Refresh token to use
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Refresh result
 */
export function performTokenRefresh(instanceId: string, refreshToken: string, instance: import("./types.js").DatabaseInstance, req: import("./types.js").ExpressRequest): Promise<import("./types.js").TokenRefreshResult>;
declare namespace _default {
    export { attemptTokenRefresh };
    export { recordSuccessfulRefreshMetrics };
    export { recordFailedRefreshMetrics };
    export { updateDatabaseWithNewTokens };
    export { processSuccessfulRefresh };
    export { processFailedRefresh };
    export { performTokenRefresh };
}
export default _default;
//# sourceMappingURL=tokenRefresh.d.ts.map