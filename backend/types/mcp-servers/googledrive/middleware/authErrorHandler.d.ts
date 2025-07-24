/**
 * Creates a system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error|unknown} error - Error object
 * @returns {void}
 */
export function createSystemErrorResponse(res: import("./types.js").ExpressResponse, instanceId: string, error: Error | unknown): void;
/**
 * Creates a lightweight system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error|unknown} error - Error object
 * @returns {void}
 */
export function createLightweightSystemErrorResponse(res: import("./types.js").ExpressResponse, instanceId: string, error: Error | unknown): void;
/**
 * Handles token refresh failure
 * @param {string} instanceId - Instance ID
 * @param {string} error - Error message
 * @param {boolean} requiresReauth - Whether re-authentication is required
 * @returns {{requiresReauth: boolean, error: string}}
 */
export function handleRefreshFailure(instanceId: string, error: string, requiresReauth: boolean): {
    requiresReauth: boolean;
    error: string;
};
/**
 * Creates a token refresh failure response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {string} error - Error message
 * @returns {void}
 */
export function createRefreshFailureResponse(res: import("./types.js").ExpressResponse, instanceId: string, error: string): void;
/**
 * Creates a re-authentication required response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
export function createReauthenticationResponse(res: import("./types.js").ExpressResponse, instanceId: string): void;
/**
 * Logs OAuth refresh fallback attempt
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
export function logRefreshFallback(instanceId: string): void;
/**
 * Creates no valid token response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
export function createNoValidTokenResponse(res: import("./types.js").ExpressResponse, instanceId: string): void;
/**
 * Handles OAuth-specific errors with appropriate responses
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error|unknown} error - Error object
 * @returns {void}
 */
export function handleOAuthError(res: import("./types.js").ExpressResponse, instanceId: string, error: Error | unknown): void;
//# sourceMappingURL=authErrorHandler.d.ts.map