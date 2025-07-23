/**
 * @typedef {import('../api/modules/message-operations.js').SendEmailArgs} SendEmailArgs
 * @typedef {import('../api/modules/message-operations.js').FetchEmailsArgs} FetchEmailsArgs
 * @typedef {import('../api/modules/message-operations.js').FetchMessageByIdArgs} FetchMessageByIdArgs
 * @typedef {import('../api/modules/message-operations.js').ReplyToEmailArgs} ReplyToEmailArgs
 * @typedef {import('../api/modules/message-operations.js').MessageIdArgs} MessageIdArgs
 * @typedef {import('../api/modules/message-operations.js').SearchEmailsArgs} SearchEmailsArgs
 * @typedef {import('../api/modules/thread-operations.js').GetThreadArgs} GetThreadArgs
 * @typedef {import('../api/modules/draft-operations.js').CreateDraftArgs} CreateDraftArgs
 * @typedef {import('../api/modules/draft-operations.js').SendDraftArgs} SendDraftArgs
 * @typedef {import('../api/modules/draft-operations.js').ListDraftsArgs} ListDraftsArgs
 * @typedef {import('../api/label-operations.js').CreateLabelArgs} CreateLabelArgs
 * @typedef {import('../api/label-operations.js').ModifyLabelsArgs} ModifyLabelsArgs
 */
/**
 * @typedef {Object} MarkAsReadArgs
 * @property {string[]} messageIds - Array of message IDs to mark as read
 */
/**
 * @typedef {Object} MarkAsUnreadArgs
 * @property {string[]} messageIds - Array of message IDs to mark as unread
 */
/**
 * Union type for all possible tool arguments
 * @typedef {SendEmailArgs | FetchEmailsArgs | FetchMessageByIdArgs | ReplyToEmailArgs |
 *           MessageIdArgs | SearchEmailsArgs | GetThreadArgs | CreateDraftArgs |
 *           SendDraftArgs | ListDraftsArgs | CreateLabelArgs | ModifyLabelsArgs |
 *           MarkAsReadArgs | MarkAsUnreadArgs} ToolArgs
 */
/**
 * Execute a Gmail tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {ToolArgs} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Gmail API
 * @returns {Promise<Object>} Tool execution result
 */
export function executeToolCall(toolName: string, args: ToolArgs, bearerToken: string): Promise<Object>;
export type SendEmailArgs = import("../api/modules/message-operations.js").SendEmailArgs;
export type FetchEmailsArgs = import("../api/modules/message-operations.js").FetchEmailsArgs;
export type FetchMessageByIdArgs = import("../api/modules/message-operations.js").FetchMessageByIdArgs;
export type ReplyToEmailArgs = import("../api/modules/message-operations.js").ReplyToEmailArgs;
export type MessageIdArgs = import("../api/modules/message-operations.js").MessageIdArgs;
export type SearchEmailsArgs = import("../api/modules/message-operations.js").SearchEmailsArgs;
export type GetThreadArgs = import("../api/modules/thread-operations.js").GetThreadArgs;
export type CreateDraftArgs = import("../api/modules/draft-operations.js").CreateDraftArgs;
export type SendDraftArgs = import("../api/modules/draft-operations.js").SendDraftArgs;
export type ListDraftsArgs = import("../api/modules/draft-operations.js").ListDraftsArgs;
export type CreateLabelArgs = import("../api/label-operations.js").CreateLabelArgs;
export type ModifyLabelsArgs = import("../api/label-operations.js").ModifyLabelsArgs;
export type MarkAsReadArgs = {
    /**
     * - Array of message IDs to mark as read
     */
    messageIds: string[];
};
export type MarkAsUnreadArgs = {
    /**
     * - Array of message IDs to mark as unread
     */
    messageIds: string[];
};
/**
 * Union type for all possible tool arguments
 */
export type ToolArgs = SendEmailArgs | FetchEmailsArgs | FetchMessageByIdArgs | ReplyToEmailArgs | MessageIdArgs | SearchEmailsArgs | GetThreadArgs | CreateDraftArgs | SendDraftArgs | ListDraftsArgs | CreateLabelArgs | ModifyLabelsArgs | MarkAsReadArgs | MarkAsUnreadArgs;
//# sourceMappingURL=call.d.ts.map