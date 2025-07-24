/**
 * Send a message to a channel
 * @param {Object} args - Message arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Send result
 */
export function sendMessage(args: Object, bearerToken: string): Promise<Object>;
/**
 * Get messages from a channel
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Messages result
 */
export function getMessages(args: Object, bearerToken: string): Promise<Object>;
/**
 * Get messages from a thread
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Thread messages result
 */
export function getThreadMessages(args: Object, bearerToken: string): Promise<Object>;
/**
 * Delete a message
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Delete result
 */
export function deleteMessage(args: Object, bearerToken: string): Promise<Object>;
/**
 * Update a message
 * @param {Object} args - Update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Update result
 */
export function updateMessage(args: Object, bearerToken: string): Promise<Object>;
//# sourceMappingURL=messageOperations.d.ts.map