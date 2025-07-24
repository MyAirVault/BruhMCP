/**
 * Slack operations collection
 * @typedef {Object} SlackOperations
 * @property {MessageOperations} messages - Message operations
 * @property {ChannelOperations} channels - Channel operations
 * @property {UserOperations} users - User operations
 * @property {FileOperations} files - File operations
 * @property {WorkspaceOperations} workspace - Workspace operations
 */
/**
 * Create operation instances
 * @param {string} bearerToken - OAuth Bearer token
 * @param {string} instanceId - Instance ID for logging
 * @returns {SlackOperations} Collection of operation instances
 */
export function createSlackOperations(bearerToken: string, instanceId: string): SlackOperations;
/**
 * Message send/update/delete object
 * @typedef {Object} MessageOperation
 * @property {string} channel - Channel ID
 * @property {string} [text] - Message text
 * @property {string} [ts] - Message timestamp (for updates/deletes)
 * @property {Object[]} [attachments] - Message attachments
 * @property {Object[]} [blocks] - Message blocks
 */
/**
 * Operation result object
 * @typedef {Object} OperationResult
 * @property {boolean} success - Whether operation succeeded
 * @property {*} [result] - Result data if successful
 * @property {string} [error] - Error message if failed
 */
/**
 * Bulk message operations
 */
export class MessageOperations {
    /**
     * @param {string} bearerToken - OAuth Bearer token
     * @param {string} instanceId - Instance ID for logging
     */
    constructor(bearerToken: string, instanceId: string);
    bearerToken: string;
    instanceId: string;
    /**
     * Send multiple messages to different channels
     * @param {MessageOperation[]} messages - Array of message objects
     * @returns {Promise<OperationResult[]>} Results for each message
     */
    sendBulkMessages(messages: MessageOperation[]): Promise<OperationResult[]>;
    /**
     * Update multiple messages
     * @param {MessageOperation[]} updates - Array of message update objects
     * @returns {Promise<OperationResult[]>} Results for each update
     */
    updateBulkMessages(updates: MessageOperation[]): Promise<OperationResult[]>;
    /**
     * Delete multiple messages
     * @param {MessageOperation[]} deletions - Array of message deletion objects
     * @returns {Promise<OperationResult[]>} Results for each deletion
     */
    deleteBulkMessages(deletions: MessageOperation[]): Promise<OperationResult[]>;
}
/**
 * Channel analytics result
 * @typedef {Object} ChannelAnalytics
 * @property {Object|null} channel - Channel information
 * @property {number} memberCount - Number of members
 * @property {Object} recentActivity - Recent activity data
 * @property {number} recentActivity.messageCount - Number of recent messages
 * @property {string|null} recentActivity.lastMessage - Last message timestamp
 */
/**
 * Channel operation result
 * @typedef {Object} ChannelOperationResult
 * @property {string} channelId - Channel ID
 * @property {boolean} success - Whether operation succeeded
 * @property {Object} [result] - Result data if successful
 * @property {string} [error] - Error message if failed
 */
/**
 * Channel management operations
 */
export class ChannelOperations {
    /**
     * @param {string} bearerToken - OAuth Bearer token
     * @param {string} instanceId - Instance ID for logging
     */
    constructor(bearerToken: string, instanceId: string);
    bearerToken: string;
    instanceId: string;
    /**
     * Get detailed channel analytics
     * @param {string} channelId - Channel ID
     * @returns {Promise<ChannelAnalytics>} Channel analytics
     */
    getChannelAnalytics(channelId: string): Promise<ChannelAnalytics>;
    /**
     * Bulk channel operations
     * @param {string[]} channels - Array of channel IDs
     * @param {'archive'|'unarchive'|'join'|'leave'} operation - Operation to perform
     * @returns {Promise<ChannelOperationResult[]>} Results for each operation
     */
    bulkChannelOperations(channels: string[], operation: "archive" | "unarchive" | "join" | "leave"): Promise<ChannelOperationResult[]>;
}
/**
 * User activity summary
 * @typedef {Object} UserActivity
 * @property {Object|null} user - User information
 * @property {string} presence - User presence status
 * @property {number|null} lastActivity - Last activity timestamp
 */
/**
 * User lookup result
 * @typedef {Object} UserLookupResult
 * @property {string} userId - User ID
 * @property {boolean} success - Whether lookup succeeded
 * @property {Object|null} [user] - User data if successful
 * @property {string} [error] - Error message if failed
 */
/**
 * User management operations
 */
export class UserOperations {
    /**
     * @param {string} bearerToken - OAuth Bearer token
     * @param {string} instanceId - Instance ID for logging
     */
    constructor(bearerToken: string, instanceId: string);
    bearerToken: string;
    instanceId: string;
    /**
     * Get user activity summary
     * @param {string} userId - User ID
     * @returns {Promise<UserActivity>} User activity summary
     */
    getUserActivity(userId: string): Promise<UserActivity>;
    /**
     * Bulk user lookup
     * @param {string[]} userIds - Array of user IDs
     * @returns {Promise<UserLookupResult[]>} User information for each ID
     */
    bulkUserLookup(userIds: string[]): Promise<UserLookupResult[]>;
}
/**
 * File upload data
 * @typedef {Object} FileUploadData
 * @property {File|Blob} file - File to upload
 * @property {string} [channels] - Comma-separated channel IDs
 * @property {string} [title] - File title
 * @property {string} [initial_comment] - Initial comment
 */
/**
 * File operation result
 * @typedef {Object} FileOperationResult
 * @property {string} fileId - File ID
 * @property {boolean} success - Whether operation succeeded
 * @property {Object} [result] - Result data if successful
 * @property {string} [error] - Error message if failed
 */
/**
 * File operations
 */
export class FileOperations {
    /**
     * @param {string} bearerToken - OAuth Bearer token
     * @param {string} instanceId - Instance ID for logging
     */
    constructor(bearerToken: string, instanceId: string);
    bearerToken: string;
    instanceId: string;
    /**
     * Upload file with progress tracking
     * @param {FileUploadData} fileData - File data and metadata
     * @returns {Promise<Object>} Upload result
     */
    uploadFileWithProgress(fileData: FileUploadData): Promise<Object>;
    /**
     * Delete multiple files
     * @param {string[]} fileIds - Array of file IDs
     * @returns {Promise<FileOperationResult[]>} Results for each deletion
     */
    bulkDeleteFiles(fileIds: string[]): Promise<FileOperationResult[]>;
}
/**
 * Workspace statistics
 * @typedef {Object} WorkspaceStats
 * @property {Object} team - Team information
 * @property {Object} stats - Statistics
 * @property {number} stats.totalChannels - Total number of channels
 * @property {number} stats.totalUsers - Total number of users
 * @property {number} stats.activeUsers - Number of active users
 */
/**
 * Search results by content type
 * @typedef {Record<string, Object>} SearchResults
 */
/**
 * Workspace operations
 */
export class WorkspaceOperations {
    /**
     * @param {string} bearerToken - OAuth Bearer token
     * @param {string} instanceId - Instance ID for logging
     */
    constructor(bearerToken: string, instanceId: string);
    bearerToken: string;
    instanceId: string;
    /**
     * Get comprehensive workspace statistics
     * @returns {Promise<WorkspaceStats>} Workspace statistics
     */
    getWorkspaceStats(): Promise<WorkspaceStats>;
    /**
     * Search across multiple content types
     * @param {string} query - Search query
     * @param {('messages'|'files')[]} types - Content types to search
     * @returns {Promise<SearchResults>} Search results
     */
    comprehensiveSearch(query: string, types?: ("messages" | "files")[]): Promise<SearchResults>;
}
/**
 * Request options for Slack API calls
 */
export type SlackRequestOptions = {
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Additional headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - Request body
     */
    body?: string | Record<string, unknown> | undefined;
    /**
     * - Form data for file uploads
     */
    formData?: FormData | undefined;
};
/**
 * Slack operations collection
 */
export type SlackOperations = {
    /**
     * - Message operations
     */
    messages: MessageOperations;
    /**
     * - Channel operations
     */
    channels: ChannelOperations;
    /**
     * - User operations
     */
    users: UserOperations;
    /**
     * - File operations
     */
    files: FileOperations;
    /**
     * - Workspace operations
     */
    workspace: WorkspaceOperations;
};
/**
 * Message send/update/delete object
 */
export type MessageOperation = {
    /**
     * - Channel ID
     */
    channel: string;
    /**
     * - Message text
     */
    text?: string | undefined;
    /**
     * - Message timestamp (for updates/deletes)
     */
    ts?: string | undefined;
    /**
     * - Message attachments
     */
    attachments?: Object[] | undefined;
    /**
     * - Message blocks
     */
    blocks?: Object[] | undefined;
};
/**
 * Operation result object
 */
export type OperationResult = {
    /**
     * - Whether operation succeeded
     */
    success: boolean;
    /**
     * - Result data if successful
     */
    result?: any;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
};
/**
 * Channel analytics result
 */
export type ChannelAnalytics = {
    /**
     * - Channel information
     */
    channel: Object | null;
    /**
     * - Number of members
     */
    memberCount: number;
    /**
     * - Recent activity data
     */
    recentActivity: {
        messageCount: number;
        lastMessage: string | null;
    };
};
/**
 * Channel operation result
 */
export type ChannelOperationResult = {
    /**
     * - Channel ID
     */
    channelId: string;
    /**
     * - Whether operation succeeded
     */
    success: boolean;
    /**
     * - Result data if successful
     */
    result?: Object | undefined;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
};
/**
 * User activity summary
 */
export type UserActivity = {
    /**
     * - User information
     */
    user: Object | null;
    /**
     * - User presence status
     */
    presence: string;
    /**
     * - Last activity timestamp
     */
    lastActivity: number | null;
};
/**
 * User lookup result
 */
export type UserLookupResult = {
    /**
     * - User ID
     */
    userId: string;
    /**
     * - Whether lookup succeeded
     */
    success: boolean;
    /**
     * - User data if successful
     */
    user?: Object | null | undefined;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
};
/**
 * File upload data
 */
export type FileUploadData = {
    /**
     * - File to upload
     */
    file: File | Blob;
    /**
     * - Comma-separated channel IDs
     */
    channels?: string | undefined;
    /**
     * - File title
     */
    title?: string | undefined;
    /**
     * - Initial comment
     */
    initial_comment?: string | undefined;
};
/**
 * File operation result
 */
export type FileOperationResult = {
    /**
     * - File ID
     */
    fileId: string;
    /**
     * - Whether operation succeeded
     */
    success: boolean;
    /**
     * - Result data if successful
     */
    result?: Object | undefined;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
};
/**
 * Workspace statistics
 */
export type WorkspaceStats = {
    /**
     * - Team information
     */
    team: Object;
    /**
     * - Statistics
     */
    stats: {
        totalChannels: number;
        totalUsers: number;
        activeUsers: number;
    };
};
/**
 * Search results by content type
 */
export type SearchResults = Record<string, Object>;
//# sourceMappingURL=slackOperations.d.ts.map