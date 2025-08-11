/**
 * Validate instance ID format (UUID v4)
 * @param {string} instanceId - Instance ID to validate
 * @returns {boolean} Whether instance ID is valid
 */
export function isValidInstanceId(instanceId: string): boolean;
/**
 * Create instance ID validation error response
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - Invalid instance ID
 * @returns {any} Error response
 */
export function createInstanceIdValidationError(res: import("./types.js").ExpressResponse, instanceId: string): any;
/**
 * Validate database instance
 * @param {import('./types.js').DatabaseInstance|null} instance - Database instance
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - Instance ID
 * @param {boolean} [checkOAuth=false] - Whether to check OAuth configuration
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateInstance(instance: import("./types.js").DatabaseInstance | null, res: import("./types.js").ExpressResponse, instanceId: string, checkOAuth?: boolean): import("./types.js").ValidationResult;
//# sourceMappingURL=validation.d.ts.map