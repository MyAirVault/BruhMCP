export type RequestOptions = {
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Request headers
     */
    headers?: Object | undefined;
    /**
     * - Request body
     */
    body?: string | Object | FormData | undefined;
    /**
     * - Whether body is raw (not JSON)
     */
    raw?: boolean | undefined;
};
export type ActivityOptions = {
    /**
     * - Page size
     */
    pageSize?: number | undefined;
    /**
     * - Filter by current user
     */
    filterByMe?: boolean | undefined;
};
export type CommentOptions = {
    /**
     * - Include deleted comments
     */
    includeDeleted?: boolean | undefined;
    /**
     * - Page size
     */
    pageSize?: number | undefined;
};
export type ChangeTrackingOptions = {
    /**
     * - Page token
     */
    pageToken?: string | undefined;
    /**
     * - Page size
     */
    pageSize?: number | undefined;
    /**
     * - Include removed items
     */
    includeRemoved?: boolean | undefined;
    /**
     * - Restrict to My Drive
     */
    restrictToMyDrive?: boolean | undefined;
};
export type ListOptions = {
    /**
     * - Page size
     */
    pageSize?: number | undefined;
    /**
     * - Page token
     */
    pageToken?: string | undefined;
    /**
     * - Order by clause
     */
    orderBy?: string | undefined;
};
export type SyncParams = {
    /**
     * - Apply recursively
     */
    recursive?: boolean | undefined;
    /**
     * - Apply to files
     */
    applyToFiles?: boolean | undefined;
    /**
     * - Apply to folders
     */
    applyToFolders?: boolean | undefined;
};
export type UpdateMetadata = {
    /**
     * - File ID
     */
    fileId: string;
    /**
     * - Metadata to update
     */
    metadata: Object;
};
//# sourceMappingURL=types.d.ts.map