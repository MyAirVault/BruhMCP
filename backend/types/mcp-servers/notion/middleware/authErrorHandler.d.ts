/**
 * Create system error response for authentication failures
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error object
 * @returns {void} Express response
 */
export function createSystemErrorResponse(res: import('express').Response, instanceId: string, error: Error): void;
/**
 * Create lightweight system error response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error object
 * @returns {void} Express response
 */
export function createLightweightSystemErrorResponse(res: import('express').Response, instanceId: string, error: Error): void;
/**
 * Handle token refresh failure and determine next steps
 * @param {string} _instanceId - The instance ID
 * @param {Error} error - Token refresh error
 * @returns {Promise<{requiresReauth: boolean, errorType: string, message: string}>} Error handling result
 */
export function handleRefreshFailure(_instanceId: string, error: Error): Promise<{
    requiresReauth: boolean;
    errorType: string;
    message: string;
}>;
/**
 * Create refresh failure response
 * @param {import('express').Response} res - Express response object
 * @param {{requiresReauth: boolean, errorType: string, message: string}} errorResult - Error handling result
 * @returns {void} Express response
 */
export function createRefreshFailureResponse(res: import('express').Response, errorResult: {
    requiresReauth: boolean;
    errorType: string;
    message: string;
}): void;
/**
 * Create re-authentication response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {string | undefined} refreshToken - Whether refresh token was available
 * @returns {Promise<void>} Express response
 */
export function createReauthenticationResponse(res: import('express').Response, instanceId: string, refreshToken: string | undefined): Promise<void>;
/**
 * Log refresh fallback scenario
 * @param {Error} error - Token refresh error
 * @returns {void}
 */
export function logRefreshFallback(error: Error): void;
/**
 * Handle network errors during authentication
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Network error
 * @returns {void} Express response
 */
export function handleNetworkError(res: import('express').Response, instanceId: string, error: Error): void;
/**
 * Handle OAuth provider errors
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - OAuth provider error
 * @returns {void} Express response
 */
export function handleOAuthProviderError(res: import('express').Response, instanceId: string, error: Error): void;
/**
 * Handle rate limiting errors
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Rate limit error
 * @returns {void} Express response
 */
export function handleRateLimitError(res: import('express').Response, instanceId: string, error: Error): void;
//# sourceMappingURL=authErrorHandler.d.ts.map