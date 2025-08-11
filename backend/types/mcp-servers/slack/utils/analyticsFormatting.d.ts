export type SlackMessage = import("../middleware/types.js").SlackMessage;
export type SlackUser = import("../middleware/types.js").SlackUser;
export type SlackChannel = import("../middleware/types.js").SlackChannel;
export type SlackTeam = import("../middleware/types.js").SlackTeam;
export type SlackSearchMatch = {
    /**
     * - Type of search match (message, file, etc.)
     */
    type: string;
    /**
     * - Matched text content
     */
    text: string;
    /**
     * - User ID who created the content
     */
    user: string;
    /**
     * - Username of the content creator
     */
    username: string;
    /**
     * - Channel information
     */
    channel: {
        id: string;
        name: string;
    };
    /**
     * - Timestamp of the match
     */
    ts: string;
    /**
     * - Permanent link to the content
     */
    permalink: string;
};
export type SlackSearchResults = {
    /**
     * - Array of search matches
     */
    matches: SlackSearchMatch[];
    /**
     * - Pagination information
     */
    pagination: {
        total_count: number;
        page: number;
        per_page: number;
        page_count: number;
        first: number;
        last: number;
    };
};
export type SlackConversationHistory = {
    /**
     * - Success status
     */
    ok: boolean;
    /**
     * - Array of messages
     */
    messages: SlackMessage[];
    /**
     * - Whether more messages exist
     */
    has_more: boolean;
    /**
     * - Number of pinned messages
     */
    pin_count: number;
    /**
     * - Response metadata
     */
    response_metadata: {
        next_cursor: string;
    };
};
export type BulkOperationResult = {
    /**
     * - Whether operation succeeded
     */
    success: boolean;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
    /**
     * - Result data if successful
     */
    data?: Object | undefined;
    /**
     * - Item ID that was processed
     */
    id: string;
};
/**
 * Format search results for better readability
 * @param {SlackSearchResults} results - Search results from Slack API
 * @param {string} query - Original search query
 * @returns {{query: string, total: number, pagination: Object, matches: Array<{type: string, text: string, user: string, username: string, channel: string, timestamp: string|null, permalink: string}>}|null} Formatted search results
 */
export function formatSearchResults(results: SlackSearchResults, query: string): {
    query: string;
    total: number;
    pagination: Object;
    matches: Array<{
        type: string;
        text: string;
        user: string;
        username: string;
        channel: string;
        timestamp: string | null;
        permalink: string;
    }>;
} | null;
/**
 * Format conversation history with enhanced metadata
 * @param {SlackConversationHistory} history - Conversation history from Slack API
 * @param {SlackUser[]} [users=[]] - User data for mention resolution
 * @returns {{ok: boolean, messages: Array<Object>, has_more: boolean, pin_count: number, response_metadata: Object}|null} Formatted conversation history
 */
export function formatConversationHistory(history: SlackConversationHistory, users?: SlackUser[]): {
    ok: boolean;
    messages: Array<Object>;
    has_more: boolean;
    pin_count: number;
    response_metadata: Object;
} | null;
/**
 * Format bulk operation results
 * @param {BulkOperationResult[]} results - Array of operation results
 * @param {string} operation - Operation type
 * @returns {{operation: string, total: number, successes: number, failures: number, success_rate: string, results: Array<BulkOperationResult & {timestamp: string}>}|null} Formatted bulk operation results
 */
export function formatBulkOperationResults(results: BulkOperationResult[], operation: string): {
    operation: string;
    total: number;
    successes: number;
    failures: number;
    success_rate: string;
    results: Array<BulkOperationResult & {
        timestamp: string;
    }>;
} | null;
/**
 * Format channel analytics data
 * @param {{channel: SlackChannel, memberCount: number, recentActivity: {messageCount: number, lastMessage: string|null}}} analytics - Channel analytics data
 * @returns {{channel: ReturnType<typeof formatChannelResponse>, analytics: {member_count: number, recent_activity: {message_count: number, last_message: string|null}}, generated_at: string}|null} Formatted analytics
 */
export function formatChannelAnalytics(analytics: {
    channel: SlackChannel;
    memberCount: number;
    recentActivity: {
        messageCount: number;
        lastMessage: string | null;
    };
}): {
    channel: ReturnType<typeof formatChannelResponse>;
    analytics: {
        member_count: number;
        recent_activity: {
            message_count: number;
            last_message: string | null;
        };
    };
    generated_at: string;
} | null;
/**
 * Format user activity summary
 * @param {{user: SlackUser, presence: string, lastActivity: string|number|null}} activity - User activity data
 * @returns {{user: ReturnType<typeof formatUserResponse>, activity: {presence: string, last_activity: string|null, is_online: boolean}, generated_at: string}|null} Formatted activity summary
 */
export function formatUserActivity(activity: {
    user: SlackUser;
    presence: string;
    lastActivity: string | number | null;
}): {
    user: ReturnType<typeof formatUserResponse>;
    activity: {
        presence: string;
        last_activity: string | null;
        is_online: boolean;
    };
    generated_at: string;
} | null;
/**
 * Format workspace statistics
 * @param {{team: SlackTeam, stats: {totalChannels: number, publicChannels?: number, privateChannels?: number, totalUsers: number, activeUsers: number}}} stats - Workspace statistics
 * @returns {{team: ReturnType<typeof formatTeamResponse>, statistics: {channels: {total: number, public: number, private: number}, users: {total: number, active: number, bots: number}}, generated_at: string}|null} Formatted workspace stats
 */
export function formatWorkspaceStats(stats: {
    team: SlackTeam;
    stats: {
        totalChannels: number;
        publicChannels?: number;
        privateChannels?: number;
        totalUsers: number;
        activeUsers: number;
    };
}): {
    team: ReturnType<typeof formatTeamResponse>;
    statistics: {
        channels: {
            total: number;
            public: number;
            private: number;
        };
        users: {
            total: number;
            active: number;
            bots: number;
        };
    };
    generated_at: string;
} | null;
import { formatChannelResponse } from "./entityFormatting";
import { formatUserResponse } from "./entityFormatting";
import { formatTeamResponse } from "./entityFormatting";
//# sourceMappingURL=analyticsFormatting.d.ts.map