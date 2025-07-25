/**
 * @typedef {Object} ListChannelsArgs
 * @property {string} [types] - Channel types to include
 * @property {number} [limit] - Number of channels to return
 * @property {string} [cursor] - Pagination cursor
 */
/**
 * @typedef {Object} ChannelInfoArgs
 * @property {string} channel - Channel ID
 */
/**
 * @typedef {Object} JoinChannelArgs
 * @property {string} channel - Channel ID
 */
/**
 * @typedef {Object} LeaveChannelArgs
 * @property {string} channel - Channel ID
 */
/**
 * @typedef {import('../../middleware/types.js').SlackChannel} SlackChannel
 */
/**
 * @typedef {Object} SlackChannelsResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackChannel[]} [channels] - Array of channels
 * @property {string} [error] - Error message
 */
/**
 * @typedef {Object} SlackChannelResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackChannel} [channel] - Channel object
 * @property {string} [error] - Error message
 */
/**
 * @typedef {Object} FormattedChannel
 * @property {string} id - Channel ID
 * @property {string} name - Channel name
 * @property {boolean} is_channel - Whether this is a channel
 * @property {boolean} is_group - Whether this is a group
 * @property {boolean} is_im - Whether this is a direct message
 * @property {boolean} is_mpim - Whether this is a multi-party direct message
 * @property {boolean} is_private - Whether the channel is private
 * @property {number} created - Channel creation timestamp
 * @property {string} creator - User ID of channel creator
 * @property {boolean} is_archived - Whether the channel is archived
 * @property {boolean} is_general - Whether this is the general channel
 */
/**
 * @typedef {Object} ChannelsListResult
 * @property {boolean} ok - Success indicator
 * @property {(FormattedChannel|null)[]} channels - Array of formatted channels
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * List channels in the workspace
 * @param {ListChannelsArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ChannelsListResult>} Channels list result
 */
export function listChannels(args: ListChannelsArgs, bearerToken: string): Promise<ChannelsListResult>;
/**
 * @typedef {Object} ChannelInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedChannel|null} channel - Formatted channel object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Get information about a channel
 * @param {ChannelInfoArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ChannelInfoResult>} Channel info result
 */
export function getChannelInfo(args: ChannelInfoArgs, bearerToken: string): Promise<ChannelInfoResult>;
/**
 * Join a channel
 * @param {JoinChannelArgs} args - Join arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ChannelInfoResult>} Join result
 */
export function joinChannel(args: JoinChannelArgs, bearerToken: string): Promise<ChannelInfoResult>;
/**
 * @typedef {Object} LeaveChannelResult
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Leave a channel
 * @param {LeaveChannelArgs} args - Leave arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<LeaveChannelResult>} Leave result
 */
export function leaveChannel(args: LeaveChannelArgs, bearerToken: string): Promise<LeaveChannelResult>;
export type ListChannelsArgs = {
    /**
     * - Channel types to include
     */
    types?: string | undefined;
    /**
     * - Number of channels to return
     */
    limit?: number | undefined;
    /**
     * - Pagination cursor
     */
    cursor?: string | undefined;
};
export type ChannelInfoArgs = {
    /**
     * - Channel ID
     */
    channel: string;
};
export type JoinChannelArgs = {
    /**
     * - Channel ID
     */
    channel: string;
};
export type LeaveChannelArgs = {
    /**
     * - Channel ID
     */
    channel: string;
};
export type SlackChannel = import("../../middleware/types.js").SlackChannel;
export type SlackChannelsResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Array of channels
     */
    channels?: import("../../middleware/types.js").SlackChannel[] | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type SlackChannelResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Channel object
     */
    channel?: import("../../middleware/types.js").SlackChannel | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type FormattedChannel = {
    /**
     * - Channel ID
     */
    id: string;
    /**
     * - Channel name
     */
    name: string;
    /**
     * - Whether this is a channel
     */
    is_channel: boolean;
    /**
     * - Whether this is a group
     */
    is_group: boolean;
    /**
     * - Whether this is a direct message
     */
    is_im: boolean;
    /**
     * - Whether this is a multi-party direct message
     */
    is_mpim: boolean;
    /**
     * - Whether the channel is private
     */
    is_private: boolean;
    /**
     * - Channel creation timestamp
     */
    created: number;
    /**
     * - User ID of channel creator
     */
    creator: string;
    /**
     * - Whether the channel is archived
     */
    is_archived: boolean;
    /**
     * - Whether this is the general channel
     */
    is_general: boolean;
};
export type ChannelsListResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Array of formatted channels
     */
    channels: (FormattedChannel | null)[];
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type ChannelInfoResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Formatted channel object
     */
    channel: FormattedChannel | null;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type LeaveChannelResult = {
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
//# sourceMappingURL=channelOperations.d.ts.map