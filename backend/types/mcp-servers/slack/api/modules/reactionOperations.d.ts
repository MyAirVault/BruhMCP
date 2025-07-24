/**
 * Add a reaction to a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Add reaction result
 */
export function addReaction(args: Object, bearerToken: string): Promise<Object>;
/**
 * Remove a reaction from a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Remove reaction result
 */
export function removeReaction(args: Object, bearerToken: string): Promise<Object>;
/**
 * Get reactions for a message
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Reactions result
 */
export function getReactions(args: Object, bearerToken: string): Promise<Object>;
//# sourceMappingURL=reactionOperations.d.ts.map