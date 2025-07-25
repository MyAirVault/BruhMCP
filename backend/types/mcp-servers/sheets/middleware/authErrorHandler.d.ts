/**
 * Create system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Error object
 * @returns {any} Error response
 */
export function createSystemErrorResponse(res: import("./types.js").ExpressResponse, instanceId: string, error: Error): any;
/**
 * Create lightweight system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Error object
 * @returns {any} Error response
 */
export function createLightweightSystemErrorResponse(res: import("./types.js").ExpressResponse, instanceId: string, error: Error): any;
/**
 * Handle token refresh failure
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @returns {Object} Error response details
 */
export function handleRefreshFailure(instanceId: string, error: Error): Object;
/**
 * Create token refresh failure response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {{error: string, errorCode: string, requiresReauth: boolean, instanceId: string}} errorDetails - Error details
 * @returns {any} Error response
 */
export function createRefreshFailureResponse(res: import("./types.js").ExpressResponse, _instanceId: any, errorDetails: {
    error: string;
    errorCode: string;
    requiresReauth: boolean;
    instanceId: string;
}): any;
/**
 * Create re-authentication required response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @returns {any} Error response
 */
export function createReauthenticationResponse(res: import("./types.js").ExpressResponse, instanceId: string): any;
/**
 * Log refresh fallback attempt
 * @param {Error} error - Original error
 */
export function logRefreshFallback(error: Error): void;
//# sourceMappingURL=authErrorHandler.d.ts.map