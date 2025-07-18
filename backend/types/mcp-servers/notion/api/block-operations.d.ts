/**
 * Get block by ID
 * @param {Object} args - Block get arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block details
 */
export function getBlock(args: Object, bearerToken: string): Object;
/**
 * Update block content
 * @param {Object} args - Block update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block update result
 */
export function updateBlock(args: Object, bearerToken: string): Object;
/**
 * Delete block
 * @param {Object} args - Block deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block deletion result
 */
export function deleteBlock(args: Object, bearerToken: string): Object;
/**
 * Get block children
 * @param {Object} args - Block children arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block children
 */
export function getBlockChildren(args: Object, bearerToken: string): Object;
/**
 * Append children to block
 * @param {Object} args - Append children arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Append result
 */
export function appendBlockChildren(args: Object, bearerToken: string): Object;
/**
 * Create text block
 * @param {Object} args - Text block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Text block creation data
 */
export function createTextBlock(args: Object, bearerToken: string): Object;
/**
 * Create heading block
 * @param {Object} args - Heading block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Heading block creation data
 */
export function createHeadingBlock(args: Object, bearerToken: string): Object;
/**
 * Create code block
 * @param {Object} args - Code block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Code block creation data
 */
export function createCodeBlock(args: Object, bearerToken: string): Object;
/**
 * Create bulleted list item block
 * @param {Object} args - List item creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} List item block creation data
 */
export function createBulletedListItemBlock(args: Object, bearerToken: string): Object;
/**
 * Create numbered list item block
 * @param {Object} args - List item creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} List item block creation data
 */
export function createNumberedListItemBlock(args: Object, bearerToken: string): Object;
/**
 * Create to-do block
 * @param {Object} args - To-do block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} To-do block creation data
 */
export function createToDoBlock(args: Object, bearerToken: string): Object;
//# sourceMappingURL=block-operations.d.ts.map