/**
 * Send an email
 * @param {Object} args - Email arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Send result
 */
export function sendEmail(args: Object, bearerToken: string): Object;
/**
 * Fetch emails from Gmail
 * @param {Object} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Fetched emails
 */
export function fetchEmails(args: Object, bearerToken: string): Object;
/**
 * Fetch a specific message by ID
 * @param {Object} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Message details
 */
export function fetchMessageById(args: Object, bearerToken: string): Object;
/**
 * Reply to an email thread
 * @param {Object} args - Reply arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reply result
 */
export function replyToEmail(args: Object, bearerToken: string): Object;
/**
 * Create an email draft
 * @param {Object} args - Draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Draft creation result
 */
export function createDraft(args: Object, bearerToken: string): Object;
/**
 * Send a draft email
 * @param {Object} args - Send draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Send result
 */
export function sendDraft(args: Object, bearerToken: string): Object;
/**
 * List email drafts
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Drafts list
 */
export function listDrafts(args: Object, bearerToken: string): Object;
/**
 * Delete a message permanently
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Delete result
 */
export function deleteMessage(args: Object, bearerToken: string): Object;
/**
 * Move message to trash
 * @param {Object} args - Trash arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Trash result
 */
export function moveToTrash(args: Object, bearerToken: string): Object;
/**
 * Search emails with advanced query
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export function searchEmails(args: Object, bearerToken: string): Object;
/**
 * Get an email thread
 * @param {Object} args - Thread arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Thread details
 */
export function getThread(args: Object, bearerToken: string): Object;
/**
 * Mark messages as read
 * @param {Object} args - Mark read arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Mark read result
 */
export function markAsRead(args: Object, bearerToken: string): Object;
/**
 * Mark messages as unread
 * @param {Object} args - Mark unread arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Mark unread result
 */
export function markAsUnread(args: Object, bearerToken: string): Object;
//# sourceMappingURL=gmail-api.d.ts.map