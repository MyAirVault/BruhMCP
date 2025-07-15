/**
 * List all Gmail labels
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Labels list
 */
export function listLabels(bearerToken: string): Object;
/**
 * Create a new Gmail label
 * @param {Object} args - Label creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Label creation result
 */
export function createLabel(args: Object, bearerToken: string): Object;
/**
 * Modify labels on a message
 * @param {Object} args - Label modification arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Label modification result
 */
export function modifyLabels(args: Object, bearerToken: string): Object;
/**
 * Delete a Gmail label
 * @param {Object} args - Label deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Label deletion result
 */
export function deleteLabel(args: Object, bearerToken: string): Object;
/**
 * Update a Gmail label
 * @param {Object} args - Label update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Label update result
 */
export function updateLabel(args: Object, bearerToken: string): Object;
/**
 * Get label details by ID
 * @param {Object} args - Label get arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Label details
 */
export function getLabel(args: Object, bearerToken: string): Object;
//# sourceMappingURL=label-operations.d.ts.map