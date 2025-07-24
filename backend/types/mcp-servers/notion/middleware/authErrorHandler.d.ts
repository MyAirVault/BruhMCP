/**
 * Create system error response for authentication failures
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error object
 * @returns {void} Express response
 */
export function createSystemErrorResponse(res: import("express").Response, instanceId: string, error: Error): void;
/**
 * Create lightweight system error response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error object
 * @returns {void} Express response
 */
export function createLightweightSystemErrorResponse(res: import("express").Response, instanceId: string, error: Error): void;
/**
 * Handle token refresh failure and determine next steps
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshError} error - Token refresh error
 * @returns {Promise<import('./types.js').ErrorHandlingResult>} Error handling result
 */
export function handleRefreshFailure(instanceId: string, error: import("./types.js").TokenRefreshError): Promise<import("./types.js").ErrorHandlingResult>;
/**
 * Create refresh failure response
 * @param {import('express').Response} res - Express response object
 * @param {import('./types.js').ErrorHandlingResult} errorResult - Error handling result
 * @returns {void} Express response
 */
export function createRefreshFailureResponse(res: import("express").Response, errorResult: import("./types.js").ErrorHandlingResult): void;
/**
 * Create re-authentication response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {string | undefined} refreshToken - Whether refresh token was available
 * @returns {Promise<void>} Express response
 */
export function createReauthenticationResponse(res: import("express").Response, instanceId: string, refreshToken: string | undefined): Promise<void>;
/**
 * Log refresh fallback scenario
 * @param {import('./types.js').TokenRefreshError} error - Token refresh error
 * @returns {void}
 */
export function logRefreshFallback(error: import("./types.js").TokenRefreshError): void;
/**
 * Handle network errors during authentication
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Network error
 * @returns {void} Express response
 */
export function handleNetworkError(res: import("express").Response, instanceId: string, error: Error): void;
/**
 * Handle OAuth provider errors
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - OAuth provider error
 * @returns {void} Express response
 */
export function handleOAuthProviderError(res: import("express").Response, instanceId: string, error: Error): void;
/**
 * Handle rate limiting errors
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Rate limit error
 * @returns {void} Express response
 */
export function handleRateLimitError(res: import("express").Response, instanceId: string, error: Error): void;
declare namespace _default {
    export { createSystemErrorResponse };
    export { createLightweightSystemErrorResponse };
    export { handleRefreshFailure };
    export { createRefreshFailureResponse };
    export { createReauthenticationResponse };
    export { logRefreshFallback };
    export { handleNetworkError };
    export { handleOAuthProviderError };
    export { handleRateLimitError };
}
export default _default;
//# sourceMappingURL=authErrorHandler.d.ts.map