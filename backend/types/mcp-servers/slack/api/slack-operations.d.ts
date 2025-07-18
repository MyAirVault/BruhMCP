/**
 * Create operation instances
 */
export function createSlackOperations(bearerToken: any, instanceId: any): {
    messages: MessageOperations;
    channels: ChannelOperations;
    users: UserOperations;
    files: FileOperations;
    workspace: WorkspaceOperations;
};
/**
 * Bulk message operations
 */
export class MessageOperations {
    constructor(bearerToken: any, instanceId: any);
    bearerToken: any;
    instanceId: any;
    /**
     * Send multiple messages to different channels
     * @param {Array} messages - Array of message objects
     * @returns {Array} Results for each message
     */
    sendBulkMessages(messages: any[]): any[];
    /**
     * Update multiple messages
     * @param {Array} updates - Array of message update objects
     * @returns {Array} Results for each update
     */
    updateBulkMessages(updates: any[]): any[];
    /**
     * Delete multiple messages
     * @param {Array} deletions - Array of message deletion objects
     * @returns {Array} Results for each deletion
     */
    deleteBulkMessages(deletions: any[]): any[];
}
/**
 * Channel management operations
 */
export class ChannelOperations {
    constructor(bearerToken: any, instanceId: any);
    bearerToken: any;
    instanceId: any;
    /**
     * Get detailed channel analytics
     * @param {string} channelId - Channel ID
     * @returns {Object} Channel analytics
     */
    getChannelAnalytics(channelId: string): Object;
    /**
     * Bulk channel operations
     * @param {Array} channels - Array of channel IDs
     * @param {string} operation - Operation to perform ('archive', 'unarchive', 'join', 'leave')
     * @returns {Array} Results for each operation
     */
    bulkChannelOperations(channels: any[], operation: string): any[];
}
/**
 * User management operations
 */
export class UserOperations {
    constructor(bearerToken: any, instanceId: any);
    bearerToken: any;
    instanceId: any;
    /**
     * Get user activity summary
     * @param {string} userId - User ID
     * @returns {Object} User activity summary
     */
    getUserActivity(userId: string): Object;
    /**
     * Bulk user lookup
     * @param {Array} userIds - Array of user IDs
     * @returns {Array} User information for each ID
     */
    bulkUserLookup(userIds: any[]): any[];
}
/**
 * File operations
 */
export class FileOperations {
    constructor(bearerToken: any, instanceId: any);
    bearerToken: any;
    instanceId: any;
    /**
     * Upload file with progress tracking
     * @param {Object} fileData - File data and metadata
     * @returns {Object} Upload result
     */
    uploadFileWithProgress(fileData: Object): Object;
    /**
     * Delete multiple files
     * @param {Array} fileIds - Array of file IDs
     * @returns {Array} Results for each deletion
     */
    bulkDeleteFiles(fileIds: any[]): any[];
}
/**
 * Workspace operations
 */
export class WorkspaceOperations {
    constructor(bearerToken: any, instanceId: any);
    bearerToken: any;
    instanceId: any;
    /**
     * Get comprehensive workspace statistics
     * @returns {Object} Workspace statistics
     */
    getWorkspaceStats(): Object;
    /**
     * Search across multiple content types
     * @param {string} query - Search query
     * @param {Array} types - Content types to search ('messages', 'files')
     * @returns {Object} Search results
     */
    comprehensiveSearch(query: string, types?: any[]): Object;
}
//# sourceMappingURL=slack-operations.d.ts.map