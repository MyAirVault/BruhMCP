/**
 * Attempt to refresh token using OAuth service with fallback to direct Slack OAuth
 * @param {import('./types.js').TokenRefreshOptions} options - Token refresh options
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Token refresh result
 */
export function attemptTokenRefresh(options: import("./types.js").TokenRefreshOptions): Promise<import("./types.js").TokenRefreshResult>;
/**
 * Update database with new OAuth tokens using optimistic locking
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - The new access token
 * @param {string} refreshToken - The refresh token
 * @param {Date} expiresAt - Token expiration date
 * @param {string} [scope] - Token scope
 * @returns {Promise<void>} Promise that resolves when database is updated
 */
export function updateDatabaseWithNewTokens(instanceId: string, accessToken: string, refreshToken: string, expiresAt: Date, scope?: string): Promise<void>;
/**
 * Process successful token refresh - cache, update database, and setup request
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshResult} refreshResult - The token refresh result
 * @param {import('./types.js').DatabaseInstance} instance - The database instance
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @returns {Promise<import('./types.js').TokenRefreshMetadata>} Processing result with metadata
 */
export function processSuccessfulRefresh(instanceId: string, refreshResult: import("./types.js").TokenRefreshResult, instance: import("./types.js").DatabaseInstance, req: import("./types.js").ExpressRequest): Promise<import("./types.js").TokenRefreshMetadata>;
/**
 * Perform complete token refresh operation
 * @param {string} instanceId - The instance ID
 * @param {string} refreshToken - The refresh token
 * @param {import('./types.js').DatabaseInstance} instance - The database instance
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Refresh operation result
 */
export function performTokenRefresh(instanceId: string, refreshToken: string, instance: import("./types.js").DatabaseInstance, req: import("./types.js").ExpressRequest): Promise<import("./types.js").TokenRefreshResult>;
//# sourceMappingURL=tokenRefresh.d.ts.map