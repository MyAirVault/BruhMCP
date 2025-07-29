export type ReactionArgs = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Message timestamp
     */
    timestamp: string;
    /**
     * - Reaction name (emoji)
     */
    name: string;
};
export type GetReactionsArgs = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Message timestamp
     */
    timestamp: string;
};
export type SlackReactionResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type ReactionResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
/**
 * @typedef {Object} ReactionArgs
 * @property {string} channel - Channel ID
 * @property {string} timestamp - Message timestamp
 * @property {string} name - Reaction name (emoji)
 */
/**
 * @typedef {Object} GetReactionsArgs
 * @property {string} channel - Channel ID
 * @property {string} timestamp - Message timestamp
 */
/**
 * @typedef {Object} SlackReactionResponse
 * @property {boolean} ok - Success indicator
 * @property {string} [error] - Error message
 */
/**
 * @typedef {Object} ReactionResult
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Add a reaction to a message
 * @param {ReactionArgs} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReactionResult>} Add reaction result
 */
export function addReaction(args: ReactionArgs, bearerToken: string): Promise<ReactionResult>;
/**
 * Remove a reaction from a message
 * @param {ReactionArgs} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReactionResult>} Remove reaction result
 */
export function removeReaction(args: ReactionArgs, bearerToken: string): Promise<ReactionResult>;
/**
 * Get reactions for a message
 * @param {GetReactionsArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReactionResult>} Reactions result
 */
export function getReactions(args: GetReactionsArgs, bearerToken: string): Promise<ReactionResult>;
//# sourceMappingURL=reactionOperations.d.ts.map