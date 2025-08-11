/**
 * Validates if a string is a valid UUID v4
 * @param {string} instanceId - Instance ID to validate
 * @returns {boolean} Whether the instance ID is valid
 */
export function isValidInstanceId(instanceId: string): boolean;
/**
 * Creates an error response for invalid instance ID
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - The invalid instance ID
 * @returns {void}
 */
export function createInstanceIdValidationError(res: import("./types.js").ExpressResponse, instanceId: string): void;
/**
 * Validates database instance and creates appropriate error responses
 * @param {import('./types.js').DatabaseInstance|null} instance - Database instance
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - Instance ID
 * @param {boolean} requireOAuth - Whether OAuth completion is required
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateInstance(instance: import("./types.js").DatabaseInstance | null, res: import("./types.js").ExpressResponse, instanceId: string, requireOAuth?: boolean): import("./types.js").ValidationResult;
//# sourceMappingURL=validation.d.ts.map