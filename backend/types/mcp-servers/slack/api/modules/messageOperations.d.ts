export type SlackMessage = import("../../middleware/types.js").SlackMessage;
export type SlackBlock = import("../../middleware/types.js").SlackBlock;
export type SlackAttachment = import("../../middleware/types.js").SlackAttachment;
export type FormattedMessage = import("../../utils/messageFormatting.js").FormattedMessage;
export type SendMessageArgs = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Message text
     */
    text?: string | undefined;
    /**
     * - Message blocks
     */
    blocks?: import("../../middleware/types.js").SlackBlock[] | undefined;
    /**
     * - Message attachments
     */
    attachments?: import("../../middleware/types.js").SlackAttachment[] | undefined;
    /**
     * - Thread timestamp
     */
    thread_ts?: string | undefined;
    /**
     * - Whether to broadcast reply
     */
    reply_broadcast?: boolean | undefined;
};
export type GetMessagesArgs = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Number of messages to retrieve
     */
    count?: number | undefined;
    /**
     * - Latest timestamp
     */
    latest?: string | undefined;
    /**
     * - Oldest timestamp
     */
    oldest?: string | undefined;
    /**
     * - Include messages with exact timestamps
     */
    inclusive?: boolean | undefined;
};
export type GetThreadMessagesArgs = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Thread timestamp
     */
    ts: string;
    /**
     * - Number of messages to retrieve
     */
    limit?: number | undefined;
    /**
     * - Pagination cursor
     */
    cursor?: string | undefined;
};
export type DeleteMessageArgs = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Message timestamp
     */
    ts: string;
};
export type UpdateMessageArgs = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Message timestamp
     */
    ts: string;
    /**
     * - New message text
     */
    text?: string | undefined;
    /**
     * - New message blocks
     */
    blocks?: import("../../middleware/types.js").SlackBlock[] | undefined;
    /**
     * - New message attachments
     */
    attachments?: import("../../middleware/types.js").SlackAttachment[] | undefined;
};
export type SlackApiResponse = {
    /**
     * - Whether request was successful
     */
    ok: boolean;
    /**
     * - Error message if not ok
     */
    error?: string | undefined;
    /**
     * - Message data
     */
    message?: import("../../middleware/types.js").SlackMessage | undefined;
    /**
     * - Array of messages
     */
    messages?: import("../../middleware/types.js").SlackMessage[] | undefined;
    /**
     * - Whether more results available
     */
    has_more?: boolean | undefined;
    /**
     * - Response metadata
     */
    response_metadata?: string | undefined;
};
export type MessageOperationResult = {
    /**
     * - Whether operation was successful
     */
    ok?: boolean | undefined;
    /**
     * - Error message if not ok
     */
    error?: string | undefined;
    /**
     * - Formatted message data
     */
    message?: import("../../utils/messageFormatting.js").FormattedMessage | null | undefined;
    /**
     * - Array of formatted messages
     */
    messages?: import("../../utils/messageFormatting.js").FormattedMessage[] | undefined;
    /**
     * - Operation summary
     */
    summary: string;
    /**
     * - Whether more results available
     */
    has_more?: boolean | undefined;
    /**
     * - Response metadata
     */
    response_metadata?: string | undefined;
    /**
     * - Channel information
     */
    channel?: string | undefined;
    /**
     * - Timestamp information
     */
    ts?: string | undefined;
};
/**
 * @typedef {import('../../middleware/types.js').SlackMessage} SlackMessage
 * @typedef {import('../../middleware/types.js').SlackBlock} SlackBlock
 * @typedef {import('../../middleware/types.js').SlackAttachment} SlackAttachment
 * @typedef {import('../../utils/messageFormatting.js').FormattedMessage} FormattedMessage
 */
/**
 * @typedef {Object} SendMessageArgs
 * @property {string} channel - Channel ID
 * @property {string} [text] - Message text
 * @property {SlackBlock[]} [blocks] - Message blocks
 * @property {SlackAttachment[]} [attachments] - Message attachments
 * @property {string} [thread_ts] - Thread timestamp
 * @property {boolean} [reply_broadcast] - Whether to broadcast reply
 */
/**
 * @typedef {Object} GetMessagesArgs
 * @property {string} channel - Channel ID
 * @property {number} [count] - Number of messages to retrieve
 * @property {string} [latest] - Latest timestamp
 * @property {string} [oldest] - Oldest timestamp
 * @property {boolean} [inclusive] - Include messages with exact timestamps
 */
/**
 * @typedef {Object} GetThreadMessagesArgs
 * @property {string} channel - Channel ID
 * @property {string} ts - Thread timestamp
 * @property {number} [limit] - Number of messages to retrieve
 * @property {string} [cursor] - Pagination cursor
 */
/**
 * @typedef {Object} DeleteMessageArgs
 * @property {string} channel - Channel ID
 * @property {string} ts - Message timestamp
 */
/**
 * @typedef {Object} UpdateMessageArgs
 * @property {string} channel - Channel ID
 * @property {string} ts - Message timestamp
 * @property {string} [text] - New message text
 * @property {SlackBlock[]} [blocks] - New message blocks
 * @property {SlackAttachment[]} [attachments] - New message attachments
 */
/**
 * @typedef {Object} SlackApiResponse
 * @property {boolean} ok - Whether request was successful
 * @property {string} [error] - Error message if not ok
 * @property {SlackMessage} [message] - Message data
 * @property {SlackMessage[]} [messages] - Array of messages
 * @property {boolean} [has_more] - Whether more results available
 * @property {string} [response_metadata] - Response metadata
 */
/**
 * @typedef {Object} MessageOperationResult
 * @property {boolean} [ok] - Whether operation was successful
 * @property {string} [error] - Error message if not ok
 * @property {FormattedMessage|null} [message] - Formatted message data
 * @property {FormattedMessage[]} [messages] - Array of formatted messages
 * @property {string} summary - Operation summary
 * @property {boolean} [has_more] - Whether more results available
 * @property {string} [response_metadata] - Response metadata
 * @property {string} [channel] - Channel information
 * @property {string} [ts] - Timestamp information
 */
/**
 * Send a message to a channel
 * @param {SendMessageArgs} args - Message arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Send result
 */
export function sendMessage(args: SendMessageArgs, bearerToken: string): Promise<MessageOperationResult>;
/**
 * Get messages from a channel
 * @param {GetMessagesArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Messages result
 */
export function getMessages(args: GetMessagesArgs, bearerToken: string): Promise<MessageOperationResult>;
/**
 * Get messages from a thread
 * @param {GetThreadMessagesArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Thread messages result
 */
export function getThreadMessages(args: GetThreadMessagesArgs, bearerToken: string): Promise<MessageOperationResult>;
/**
 * Delete a message
 * @param {DeleteMessageArgs} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Delete result
 */
export function deleteMessage(args: DeleteMessageArgs, bearerToken: string): Promise<MessageOperationResult>;
/**
 * Update a message
 * @param {UpdateMessageArgs} args - Update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Update result
 */
export function updateMessage(args: UpdateMessageArgs, bearerToken: string): Promise<MessageOperationResult>;
//# sourceMappingURL=messageOperations.d.ts.map