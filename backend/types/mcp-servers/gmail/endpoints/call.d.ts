/**
 * @typedef {import('../api/modules/messageOperations.js').SendEmailArgs} SendEmailArgs
 * @typedef {import('../api/modules/messageOperations.js').FetchEmailsArgs} FetchEmailsArgs
 * @typedef {import('../api/modules/messageOperations.js').FetchMessageByIdArgs} FetchMessageByIdArgs
 * @typedef {import('../api/modules/messageOperations.js').ReplyToEmailArgs} ReplyToEmailArgs
 * @typedef {import('../api/modules/messageOperations.js').MessageIdArgs} MessageIdArgs
 * @typedef {import('../api/modules/messageOperations.js').SearchEmailsArgs} SearchEmailsArgs
 * @typedef {import('../api/modules/threadOperations.js').GetThreadArgs} GetThreadArgs
 * @typedef {import('../api/modules/draftOperations.js').CreateDraftArgs} CreateDraftArgs
 * @typedef {import('../api/modules/draftOperations.js').SendDraftArgs} SendDraftArgs
 * @typedef {import('../api/modules/draftOperations.js').ListDraftsArgs} ListDraftsArgs
 * @typedef {import('../api/labelOperations.js').CreateLabelArgs} CreateLabelArgs
 * @typedef {import('../api/labelOperations.js').ModifyLabelsArgs} ModifyLabelsArgs
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
export type SendEmailArgs = import("../api/modules/messageOperations.js").SendEmailArgs;
export type FetchEmailsArgs = import("../api/modules/messageOperations.js").FetchEmailsArgs;
export type FetchMessageByIdArgs = import("../api/modules/messageOperations.js").FetchMessageByIdArgs;
export type ReplyToEmailArgs = import("../api/modules/messageOperations.js").ReplyToEmailArgs;
export type MessageIdArgs = import("../api/modules/messageOperations.js").MessageIdArgs;
export type SearchEmailsArgs = import("../api/modules/messageOperations.js").SearchEmailsArgs;
export type GetThreadArgs = import("../api/modules/threadOperations.js").GetThreadArgs;
export type CreateDraftArgs = import("../api/modules/draftOperations.js").CreateDraftArgs;
export type SendDraftArgs = import("../api/modules/draftOperations.js").SendDraftArgs;
export type ListDraftsArgs = import("../api/modules/draftOperations.js").ListDraftsArgs;
export type CreateLabelArgs = import("../api/labelOperations.js").CreateLabelArgs;
export type ModifyLabelsArgs = import("../api/labelOperations.js").ModifyLabelsArgs;
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