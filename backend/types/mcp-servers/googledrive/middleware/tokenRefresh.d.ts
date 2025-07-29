/**
 * Performs complete token refresh with all error handling
 * @param {string} instanceId - Instance ID
 * @param {string} refreshToken - Refresh token
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Refresh result
 */
export function performTokenRefresh(instanceId: string, refreshToken: string, instance: import('./types.js').DatabaseInstance, req: import('./types.js').ExpressRequest): Promise<import('./types.js').TokenRefreshResult>;
//# sourceMappingURL=tokenRefresh.d.ts.map