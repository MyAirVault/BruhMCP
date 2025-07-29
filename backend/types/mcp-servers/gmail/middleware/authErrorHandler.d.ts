/**
 * Create system error response for authentication middleware
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - The error that occurred
 * @returns {void} Express response
 */
export function createSystemErrorResponse(res: import('express').Response, instanceId: string, error: Error): void;
/**
 * Create lightweight auth system error response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - The error that occurred
 * @returns {void} Express response
 */
export function createLightweightSystemErrorResponse(res: import('express').Response, instanceId: string, error: Error): void;
/**
 * Handle token refresh failure and determine appropriate response
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshError} refreshError - The token refresh error
 * @returns {Promise<import('./types.js').AuthErrorResult>} Error handling result
 */
export function handleRefreshFailure(instanceId: string, refreshError: import('./types.js').TokenRefreshError): Promise<import('./types.js').AuthErrorResult>;
/**
 * Create unauthorized response for token refresh failure
 * @param {import('express').Response} res - Express response object
 * @param {import('./types.js').AuthErrorResult} errorResult - The error result from handling
 * @returns {void} Express response
 */
export function createRefreshFailureResponse(res: import('express').Response, errorResult: import('./types.js').AuthErrorResult): void;
/**
 * Mark OAuth status as failed and create re-authentication response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {string} [refreshToken] - The refresh token to preserve
 * @returns {Promise<void>} Express response
 */
export function createReauthenticationResponse(res: import('express').Response, instanceId: string, refreshToken?: string | undefined): Promise<void>;
/**
 * Log fallback message when token refresh fails
 * @param {import('./types.js').TokenRefreshError} refreshError - The token refresh error
 * @returns {void}
 */
export function logRefreshFallback(refreshError: import('./types.js').TokenRefreshError): void;
//# sourceMappingURL=authErrorHandler.d.ts.map