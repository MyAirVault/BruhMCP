/**
 * @typedef {Object} UploadFileArgs
 * @property {string} channels - Channel IDs to upload to
 * @property {string} content - File content
 * @property {string} filename - File name
 * @property {string} [title] - File title
 * @property {string} [filetype] - File type
 * @property {string} [initial_comment] - Initial comment
 */
/**
 * @typedef {Object} FileInfoArgs
 * @property {string} file - File ID
 */
/**
 * @typedef {import('../../middleware/types.js').SlackFile} SlackFile
 */
/**
 * @typedef {Object} SlackFileResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackFile} [file] - File object
 * @property {string} [error] - Error message
 */
/**
 * @typedef {import('../../utils/messageFormatting.js').FormattedFile} FormattedFile
 */
/**
 * @typedef {Object} FileUploadResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedFile|null} file - Formatted file object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Upload a file to Slack
 * @param {UploadFileArgs} args - Upload arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FileUploadResult>} Upload result
 */
export function uploadFile(args: UploadFileArgs, bearerToken: string): Promise<FileUploadResult>;
/**
 * @typedef {Object} FileInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedFile|null} file - Formatted file object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Get information about a file
 * @param {FileInfoArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FileInfoResult>} File info result
 */
export function getFileInfo(args: FileInfoArgs, bearerToken: string): Promise<FileInfoResult>;
export type UploadFileArgs = {
    /**
     * - Channel IDs to upload to
     */
    channels: string;
    /**
     * - File content
     */
    content: string;
    /**
     * - File name
     */
    filename: string;
    /**
     * - File title
     */
    title?: string | undefined;
    /**
     * - File type
     */
    filetype?: string | undefined;
    /**
     * - Initial comment
     */
    initial_comment?: string | undefined;
};
export type FileInfoArgs = {
    /**
     * - File ID
     */
    file: string;
};
export type SlackFile = import("../../middleware/types.js").SlackFile;
export type SlackFileResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - File object
     */
    file?: import("../../middleware/types.js").SlackFile | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type FormattedFile = import("../../utils/messageFormatting.js").FormattedFile;
export type FileUploadResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Formatted file object
     */
    file: FormattedFile | null;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type FileInfoResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Formatted file object
     */
    file: FormattedFile | null;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
//# sourceMappingURL=fileOperations.d.ts.map