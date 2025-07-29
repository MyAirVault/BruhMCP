/**
 * Perform complete token refresh operation
 * @param {string} instanceId - Instance ID
 * @param {string} refreshToken - Refresh token
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @returns {Promise<import('./types.js').RefreshResult>} Refresh result
 */
export function performTokenRefresh(instanceId: string, refreshToken: string, instance: import('./types.js').DatabaseInstance, req: import('./types.js').ExpressRequest): Promise<import('./types.js').RefreshResult>;
//# sourceMappingURL=tokenRefresh.d.ts.map