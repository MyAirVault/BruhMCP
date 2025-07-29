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
     * - Request body
     */
    body?: Record<string, any> | undefined;
    /**
     * - Whether to send raw body
     */
    raw?: boolean | undefined;
};
export type CreateFolderArgs = {
    /**
     * - Name of the folder to create
     */
    folderName: string;
    /**
     * - ID of parent folder
     */
    parentFolderId?: string | undefined;
};
export type DeleteFileArgs = {
    /**
     * - ID of file to delete
     */
    fileId: string;
    /**
     * - Whether to permanently delete
     */
    permanent?: boolean | undefined;
};
export type CopyFileArgs = {
    /**
     * - ID of file to copy
     */
    fileId: string;
    /**
     * - New name for copied file
     */
    newName?: string | undefined;
    /**
     * - Destination folder ID
     */
    destinationFolderId?: string | undefined;
};
export type MoveFileArgs = {
    /**
     * - ID of file to move
     */
    fileId: string;
    /**
     * - Destination folder ID
     */
    destinationFolderId: string;
};
export type DriveFileMetadata = {
    /**
     * - File name
     */
    name: string;
    /**
     * - MIME type
     */
    mimeType: string;
    /**
     * - Parent folder IDs
     */
    parents?: string[] | undefined;
};
export type DriveApiResponse = {
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
     * - File size
     */
    size?: string | undefined;
    /**
     * - Creation time
     */
    createdTime: string;
    /**
     * - Modification time
     */
    modifiedTime: string;
    /**
     * - Parent folder IDs
     */
    parents?: string[] | undefined;
    /**
     * - Web view link
     */
    webViewLink: string;
    /**
     * - File owners
     */
    owners: Object[];
    /**
     * - Whether file is shared
     */
    shared: boolean;
};
export type FileOperationResult = {
    /**
     * - Operation success status
     */
    success: boolean;
    /**
     * - File ID
     */
    fileId: string;
    /**
     * - Result message
     */
    message: string;
    /**
     * - Action performed
     */
    action: string;
    /**
     * - File details (for non-permanent delete)
     */
    file?: Object | undefined;
};
/**
 * Create a folder in Google Drive
 * @param {CreateFolderArgs} args - Folder creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../utils/googledriveFormatting.js').FormattedFile|null>} Created folder info
 */
export function createFolder(args: CreateFolderArgs, bearerToken: string): Promise<import('../../utils/googledriveFormatting.js').FormattedFile | null>;
/**
 * Delete a file or folder from Google Drive
 * @param {DeleteFileArgs} args - Deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FileOperationResult>} Deletion result
 */
export function deleteFile(args: DeleteFileArgs, bearerToken: string): Promise<FileOperationResult>;
/**
 * Copy a file in Google Drive
 * @param {CopyFileArgs} args - Copy arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../utils/googledriveFormatting.js').FormattedFile|null>} Copied file info
 */
export function copyFile(args: CopyFileArgs, bearerToken: string): Promise<import('../../utils/googledriveFormatting.js').FormattedFile | null>;
/**
 * Move a file to a different folder in Google Drive
 * @param {MoveFileArgs} args - Move arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../utils/googledriveFormatting.js').FormattedFile|null>} Moved file info
 */
export function moveFile(args: MoveFileArgs, bearerToken: string): Promise<import('../../utils/googledriveFormatting.js').FormattedFile | null>;
//# sourceMappingURL=fileManagement.d.ts.map