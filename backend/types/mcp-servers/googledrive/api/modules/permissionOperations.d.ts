/**
 * Share a file with specific users or make it public
 * @param {ShareFileArgs} args - Sharing arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ShareFileResult>} Sharing result
 */
export function shareFile(args: ShareFileArgs, bearerToken: string): Promise<ShareFileResult>;
/**
 * Get permissions for a file
 * @param {GetFilePermissionsArgs} args - Arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FilePermissionsResult>} File permissions
 */
export function getFilePermissions(args: GetFilePermissionsArgs, bearerToken: string): Promise<FilePermissionsResult>;
export type RequestOptions = {
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Additional headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - Request body as JSON string
     */
    body?: string | undefined;
    /**
     * - Whether to send raw body
     */
    raw?: boolean | undefined;
};
export type DriveAPIErrorResponse = {
    /**
     * - Error object with message
     */
    error: {
        message: string;
    };
};
export type Permission = {
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
    /**
     * - Display name of the permission holder
     */
    displayName?: string | undefined;
    /**
     * - Photo link of the permission holder
     */
    photoLink?: string | undefined;
};
export type PermissionRequest = {
    /**
     * - Permission type
     */
    type: string;
    /**
     * - Permission role
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
export type PermissionsListResponse = {
    /**
     * - Array of permissions
     */
    permissions: Permission[];
};
export type DriveAPIResponse = {
    /**
     * - Response ID
     */
    id?: string | undefined;
    /**
     * - Response type
     */
    type?: string | undefined;
    /**
     * - Response role
     */
    role?: string | undefined;
    /**
     * - Response email address
     */
    emailAddress?: string | undefined;
    /**
     * - Response domain
     */
    domain?: string | undefined;
    /**
     * - Response permissions array
     */
    permissions?: Permission[] | undefined;
};
export type ShareFileArgs = {
    /**
     * - File ID to share
     */
    fileId: string;
    /**
     * - Email address or domain to share with
     */
    emailAddress?: string | undefined;
    /**
     * - Permission role
     */
    role?: string | undefined;
    /**
     * - Permission type
     */
    type?: string | undefined;
    /**
     * - Whether to send notification email
     */
    sendNotificationEmail?: boolean | undefined;
    /**
     * - Custom email message
     */
    emailMessage?: string | undefined;
};
export type ShareFileResult = {
    /**
     * - Whether the operation was successful
     */
    success: boolean;
    /**
     * - File ID that was shared
     */
    fileId: string;
    /**
     * - ID of the created permission
     */
    permissionId: string;
    /**
     * - Permission type
     */
    type: string;
    /**
     * - Permission role
     */
    role: string;
    /**
     * - Email address (if applicable)
     */
    emailAddress?: string | undefined;
    /**
     * - Domain (if applicable)
     */
    domain?: string | undefined;
    /**
     * - Success message
     */
    message: string;
};
export type GetFilePermissionsArgs = {
    /**
     * - File ID to get permissions for
     */
    fileId: string;
};
export type FilePermissionsResult = {
    /**
     * - File ID
     */
    fileId: string;
    /**
     * - Array of permissions
     */
    permissions: Permission[];
    /**
     * - Number of permissions
     */
    count: number;
};
//# sourceMappingURL=permissionOperations.d.ts.map