/**
 * Validate instance ID format using UUID v4 regex
 * @param {string} instanceId - The instance ID to validate
 * @returns {boolean} True if valid UUID v4 format
 */
export function isValidInstanceId(instanceId: string): boolean;
/**
 * Create error response for invalid instance ID format
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The invalid instance ID
 * @returns {void} Express response
 */
export function createInstanceIdValidationError(res: import('express').Response, instanceId: string): void;
/**
 * Validate instance exists and is not null
 * @param {import('./types.js').DatabaseInstance | null | undefined} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstanceExists(instance: import('./types.js').DatabaseInstance | null | undefined, res: import('express').Response, instanceId: string): import('./types.js').InstanceValidationResult;
/**
 * Validate service is active for the instance
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateServiceActive(instance: import('./types.js').DatabaseInstance, res: import('express').Response, instanceId: string): import('./types.js').InstanceValidationResult;
/**
 * Validate instance status is not inactive or expired
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstanceStatus(instance: import('./types.js').DatabaseInstance, res: import('express').Response, instanceId: string): import('./types.js').InstanceValidationResult;
/**
 * Validate instance has not expired based on expiration timestamp
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstanceNotExpired(instance: import('./types.js').DatabaseInstance, res: import('express').Response, instanceId: string): import('./types.js').InstanceValidationResult;
/**
 * Validate OAuth credentials configuration
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateOAuthCredentials(instance: import('./types.js').DatabaseInstance, res: import('express').Response, instanceId: string): import('./types.js').InstanceValidationResult;
/**
 * Perform complete instance validation chain
 * @param {import('./types.js').DatabaseInstance | null | undefined} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {boolean} [requireOAuth] - Whether to validate OAuth credentials
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstance(instance: import('./types.js').DatabaseInstance | null | undefined, res: import('express').Response, instanceId: string, requireOAuth?: boolean | undefined): import('./types.js').InstanceValidationResult;
//# sourceMappingURL=validation.d.ts.map