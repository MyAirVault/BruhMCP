export type SendMessageArgs = import('../api/modules/messageOperations.js').SendMessageArgs;
export type GetMessagesArgs = import('../api/modules/messageOperations.js').GetMessagesArgs;
export type GetThreadMessagesArgs = import('../api/modules/messageOperations.js').GetThreadMessagesArgs;
export type DeleteMessageArgs = import('../api/modules/messageOperations.js').DeleteMessageArgs;
export type UpdateMessageArgs = import('../api/modules/messageOperations.js').UpdateMessageArgs;
export type ListChannelsArgs = import('../api/modules/channelOperations.js').ListChannelsArgs;
export type ChannelInfoArgs = import('../api/modules/channelOperations.js').ChannelInfoArgs;
export type JoinChannelArgs = import('../api/modules/channelOperations.js').JoinChannelArgs;
export type LeaveChannelArgs = import('../api/modules/channelOperations.js').LeaveChannelArgs;
export type UserInfoArgs = import('../api/modules/userOperations.js').UserInfoArgs;
export type ListUsersArgs = import('../api/modules/userOperations.js').ListUsersArgs;
export type ReactionArgs = import('../api/modules/reactionOperations.js').ReactionArgs;
export type GetReactionsArgs = import('../api/modules/reactionOperations.js').GetReactionsArgs;
export type UploadFileArgs = import('../api/modules/fileOperations.js').UploadFileArgs;
export type FileInfoArgs = import('../api/modules/fileOperations.js').FileInfoArgs;
export type CreateReminderArgs = import('../api/modules/miscOperations.js').CreateReminderArgs;
export type ToolExecutionResult = {
    /**
     * - MCP-compliant result content
     */
    content: Array<{
        type: string;
        text: string;
    }>;
};
/**
 * Union type for all possible tool arguments
 */
export type ToolArguments = SendMessageArgs | GetMessagesArgs | GetThreadMessagesArgs | DeleteMessageArgs | UpdateMessageArgs | ListChannelsArgs | ChannelInfoArgs | JoinChannelArgs | LeaveChannelArgs | UserInfoArgs | ListUsersArgs | ReactionArgs | GetReactionsArgs | UploadFileArgs | FileInfoArgs | CreateReminderArgs | Record<string, never>;
/**
 * @typedef {import('../api/modules/messageOperations.js').SendMessageArgs} SendMessageArgs
 * @typedef {import('../api/modules/messageOperations.js').GetMessagesArgs} GetMessagesArgs
 * @typedef {import('../api/modules/messageOperations.js').GetThreadMessagesArgs} GetThreadMessagesArgs
 * @typedef {import('../api/modules/messageOperations.js').DeleteMessageArgs} DeleteMessageArgs
 * @typedef {import('../api/modules/messageOperations.js').UpdateMessageArgs} UpdateMessageArgs
 * @typedef {import('../api/modules/channelOperations.js').ListChannelsArgs} ListChannelsArgs
 * @typedef {import('../api/modules/channelOperations.js').ChannelInfoArgs} ChannelInfoArgs
 * @typedef {import('../api/modules/channelOperations.js').JoinChannelArgs} JoinChannelArgs
 * @typedef {import('../api/modules/channelOperations.js').LeaveChannelArgs} LeaveChannelArgs
 * @typedef {import('../api/modules/userOperations.js').UserInfoArgs} UserInfoArgs
 * @typedef {import('../api/modules/userOperations.js').ListUsersArgs} ListUsersArgs
 * @typedef {import('../api/modules/reactionOperations.js').ReactionArgs} ReactionArgs
 * @typedef {import('../api/modules/reactionOperations.js').GetReactionsArgs} GetReactionsArgs
 * @typedef {import('../api/modules/fileOperations.js').UploadFileArgs} UploadFileArgs
 * @typedef {import('../api/modules/fileOperations.js').FileInfoArgs} FileInfoArgs
 * @typedef {import('../api/modules/miscOperations.js').CreateReminderArgs} CreateReminderArgs
 */
/**
 * @typedef {Object} ToolExecutionResult
 * @property {Array<{type: string, text: string}>} content - MCP-compliant result content
 */
/**
 * Union type for all possible tool arguments
 * @typedef {SendMessageArgs|GetMessagesArgs|GetThreadMessagesArgs|DeleteMessageArgs|UpdateMessageArgs|ListChannelsArgs|ChannelInfoArgs|JoinChannelArgs|LeaveChannelArgs|UserInfoArgs|ListUsersArgs|ReactionArgs|GetReactionsArgs|UploadFileArgs|FileInfoArgs|CreateReminderArgs|Record<string, never>} ToolArguments
 */
/**
 * Execute a Slack tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {ToolArguments} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Slack API
 * @returns {Promise<ToolExecutionResult>} Tool execution result
 */
export function executeToolCall(toolName: string, args: ToolArguments, bearerToken: string): Promise<ToolExecutionResult>;
//# sourceMappingURL=call.d.ts.map