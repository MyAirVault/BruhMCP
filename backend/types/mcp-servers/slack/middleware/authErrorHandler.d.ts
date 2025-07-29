/**
 * Handle token refresh failure and determine appropriate response
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshError} refreshError - The token refresh error
 * @returns {Promise<import('./types.js').AuthErrorResult>} Error handling result
 */
export function handleRefreshFailure(instanceId: string, refreshError: import('./types.js').TokenRefreshError): Promise<import('./types.js').AuthErrorResult>;
/**
 * Mark OAuth status as failed and create re-authentication response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {string} [refreshToken] - The refresh token to preserve
 * @returns {Promise<void>} Express response
 */
export function createReauthenticationResponse(res: import('express').Response, instanceId: string, refreshToken?: string | undefined): Promise<void>;
//# sourceMappingURL=authErrorHandler.d.ts.map