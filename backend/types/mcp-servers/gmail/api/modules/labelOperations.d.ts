/**
 * Mark messages as read
 * @param {Object} args - Mark read arguments
 * @param {string[]} args.messageIds - Array of message IDs to mark as read
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Mark read result
 */
export function markAsRead(args: {
    messageIds: string[];
}, bearerToken: string): Promise<Object>;
/**
 * Mark messages as unread
 * @param {Object} args - Mark unread arguments
 * @param {string[]} args.messageIds - Array of message IDs to mark as unread
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Mark unread result
 */
export function markAsUnread(args: {
    messageIds: string[];
}, bearerToken: string): Promise<Object>;
//# sourceMappingURL=labelOperations.d.ts.map