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
export type DriveRevision = {
    /**
     * - Revision ID
     */
    id: string;
    /**
     * - Modified time
     */
    modifiedTime: string;
    /**
     * - Keep forever flag
     */
    keepForever: boolean;
    /**
     * - Published flag
     */
    published: boolean;
    /**
     * - Auto publish flag
     */
    publishAuto: boolean;
    /**
     * - Published outside domain flag
     */
    publishedOutsideDomain: boolean;
    /**
     * - Last modifying user
     */
    lastModifyingUser: Object;
    /**
     * - Original filename
     */
    originalFilename: string;
    /**
     * - MD5 checksum
     */
    md5Checksum: string;
    /**
     * - File size
     */
    size: string;
};
export type DriveFile = {
    /**
     * - File ID
     */
    id: string;
    /**
     * - File name
     */
    name: string;
    /**
     * - MIME type
     */
    mimeType: string;
    /**
     * - Modified time
     */
    modifiedTime: string;
    /**
     * - Viewed by me time
     */
    viewedByMeTime: string;
    /**
     * - Modified by me time
     */
    modifiedByMeTime: string;
    /**
     * - Last modifying user
     */
    lastModifyingUser: Object;
    /**
     * - File owners
     */
    owners: Object[];
};
export type DriveComment = {
    /**
     * - Comment ID
     */
    id: string;
    /**
     * - Comment content
     */
    content: string;
    /**
     * - Created time
     */
    createdTime: string;
    /**
     * - Modified time
     */
    modifiedTime: string;
    /**
     * - Comment author
     */
    author: Object;
    /**
     * - Resolved flag
     */
    resolved: boolean;
    /**
     * - Comment replies
     */
    replies: DriveReply[];
};
export type DriveReply = {
    /**
     * - Reply ID
     */
    id: string;
    /**
     * - Reply content
     */
    content: string;
    /**
     * - Created time
     */
    createdTime: string;
    /**
     * - Modified time
     */
    modifiedTime: string;
    /**
     * - Reply author
     */
    author: Object;
};
export type DriveChange = {
    /**
     * - Removed flag
     */
    removed: boolean;
    /**
     * - Change type
     */
    changeType: string;
    /**
     * - Change time
     */
    time: string;
    /**
     * - Changed file
     */
    file: DriveFile | null;
};
export type DrivePermission = {
    /**
     * - Permission ID
     */
    id: string;
    /**
     * - Permission type (user, group, domain, anyone)
     */
    type: string;
    /**
     * - Permission role (owner, organizer, fileOrganizer, writer, commenter, reader)
     */
    role: string;
    /**
     * - Email address for user/group permissions
     */
    emailAddress?: string | undefined;
    /**
     * - Domain for domain permissions
     */
    domain?: string | undefined;
};
export type DriveMetadata = {
    /**
     * - File name
     */
    name?: string | undefined;
    /**
     * - File description
     */
    description?: string | undefined;
    /**
     * - Parent folder IDs
     */
    parents?: string[] | undefined;
    /**
     * - Starred flag
     */
    starred?: boolean | undefined;
    /**
     * - Trashed flag
     */
    trashed?: boolean | undefined;
};
//# sourceMappingURL=types.d.ts.map