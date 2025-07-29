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
 * Create appropriate error response based on authentication error
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').AuthErrorResult} errorResult - Error handling result
 * @returns {void} Express response
 */
export function createAuthErrorResponse(res: import('express').Response, instanceId: string, errorResult: import('./types.js').AuthErrorResult): void;
//# sourceMappingURL=authErrorHandler.d.ts.map