/**
 * Get file revisions
 * @param {string} fileId - File ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{fileId: string, revisions: Array<any>, count: number}>} File revisions
 */
export function getFileRevisions(fileId: string, bearerToken: string): Promise<{
    fileId: string;
    revisions: Array<any>;
    count: number;
}>;
/**
 * Get recent activity for the user's Drive
 * @param {import('../types.js').ActivityOptions} [options={}] - Activity options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{files: Array<any>, count: number}>} Recent activity
 */
export function getRecentActivity(bearerToken: string, options?: import("../types.js").ActivityOptions | undefined): Promise<{
    files: Array<any>;
    count: number;
}>;
/**
 * Get comments on a file
 * @param {string} fileId - File ID
 * @param {import('../types.js').CommentOptions} [options={}] - Comment options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{fileId: string, comments: Array<any>, count: number}>} File comments
 */
export function getFileComments(fileId: string, bearerToken: string, options?: import("../types.js").CommentOptions | undefined): Promise<{
    fileId: string;
    comments: Array<any>;
    count: number;
}>;
/**
 * Track file changes in real-time (via changes API)
 * @param {import('../types.js').ChangeTrackingOptions} [options={}] - Change tracking options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{startPageToken?: string, message?: string, changes?: Array<any>, changeCount?: number, nextPageToken?: string, newStartPageToken?: string}>} Changes and next page token
 */
export function trackFileChanges(bearerToken: string, options?: import("../types.js").ChangeTrackingOptions | undefined): Promise<{
    startPageToken?: string;
    message?: string;
    changes?: Array<any>;
    changeCount?: number;
    nextPageToken?: string;
    newStartPageToken?: string;
}>;
//# sourceMappingURL=activityOperations.d.ts.map