/**
 * @typedef {import('../middleware/types.js').SlackMessage} SlackMessage
 * @typedef {import('../middleware/types.js').SlackAttachment} SlackAttachment
 * @typedef {import('../middleware/types.js').SlackReaction} SlackReaction
 * @typedef {import('../middleware/types.js').SlackFile} SlackFile
 * @typedef {import('../middleware/types.js').SlackFileUploadResult} SlackFileUploadResult
 * @typedef {import('../middleware/types.js').SlackMessageEdit} SlackMessageEdit
 * @typedef {import('../middleware/types.js').SlackBlock} SlackBlock
 * @typedef {import('../middleware/types.js').SlackField} SlackField
 */
/**
 * Formatted message response object
 * @typedef {Object} FormattedMessage
 * @property {string} [ts] - Message timestamp
 * @property {string} [type] - Message type
 * @property {string} [text] - Message text
 * @property {string} [user] - User ID
 * @property {string} [channel] - Channel ID
 * @property {string|null} [timestamp] - ISO timestamp
 * @property {string} [thread_ts] - Thread timestamp
 * @property {number} [reply_count] - Reply count
 * @property {number} [reply_users_count] - Reply users count
 * @property {string} [latest_reply] - Latest reply timestamp
 * @property {string} [bot_id] - Bot ID
 * @property {string} [username] - Username
 * @property {FormattedAttachment[]} [attachments] - Attachments
 * @property {SlackBlock[]} [blocks] - Message blocks
 * @property {FormattedReaction[]} [reactions] - Reactions
 * @property {FormattedFile[]} [files] - Files
 * @property {FormattedMessageEdit} [edited] - Edit information
 */
/**
 * Formatted attachment object
 * @typedef {Object} FormattedAttachment
 * @property {string} [id] - Attachment ID
 * @property {string} [color] - Color
 * @property {string} [fallback] - Fallback text
 * @property {string} [title] - Title
 * @property {string} [title_link] - Title link
 * @property {string} [text] - Text
 * @property {string} [pretext] - Pretext
 * @property {string} [author_name] - Author name
 * @property {string} [author_link] - Author link
 * @property {string} [author_icon] - Author icon
 * @property {string} [image_url] - Image URL
 * @property {string} [thumb_url] - Thumbnail URL
 * @property {string} [footer] - Footer
 * @property {string} [footer_icon] - Footer icon
 * @property {number} [ts] - Timestamp
 * @property {SlackField[]} [fields] - Fields
 */
/**
 * Formatted reaction object
 * @typedef {Object} FormattedReaction
 * @property {string} [name] - Reaction name
 * @property {number} [count] - Count
 * @property {string[]} [users] - User IDs
 */
/**
 * Formatted file object
 * @typedef {Object} FormattedFile
 * @property {string} [id] - File ID
 * @property {string} [name] - Name
 * @property {string} [title] - Title
 * @property {string} [mimetype] - MIME type
 * @property {string} [filetype] - File type
 * @property {string} [pretty_type] - Pretty type
 * @property {string} [user] - User ID
 * @property {string} [mode] - Mode
 * @property {boolean} [editable] - Editable
 * @property {boolean} [is_external] - Is external
 * @property {string} [external_type] - External type
 * @property {number} [size] - Size
 * @property {string} [url_private] - Private URL
 * @property {string} [url_private_download] - Private download URL
 * @property {string} [thumb_64] - 64px thumbnail
 * @property {string} [thumb_80] - 80px thumbnail
 * @property {string} [thumb_160] - 160px thumbnail
 * @property {string} [thumb_360] - 360px thumbnail
 * @property {string} [thumb_480] - 480px thumbnail
 * @property {string} [thumb_720] - 720px thumbnail
 * @property {string} [thumb_800] - 800px thumbnail
 * @property {string} [thumb_960] - 960px thumbnail
 * @property {string} [thumb_1024] - 1024px thumbnail
 * @property {string} [permalink] - Permalink
 * @property {string} [permalink_public] - Public permalink
 * @property {number} [created] - Created timestamp
 * @property {number} [timestamp] - Timestamp
 */
/**
 * Formatted message edit object
 * @typedef {Object} FormattedMessageEdit
 * @property {string} [user] - User ID
 * @property {string} [ts] - Timestamp
 * @property {string} [timestamp] - ISO timestamp
 */
/**
 * Formatted file upload result object
 * @typedef {Object} FormattedFileUploadResult
 * @property {boolean} [ok] - Success status
 * @property {FormattedFile|null} [file] - File object
 * @property {string} [upload_time] - Upload time
 * @property {string} [warning] - Warning message
 */
/**
 * Format a Slack message response
 * @param {SlackMessage|null} message - Raw Slack message object
 * @returns {FormattedMessage|null} Formatted message
 */
export function formatMessageResponse(message: SlackMessage | null): FormattedMessage | null;
/**
 * Format a Slack attachment
 * @param {SlackAttachment} attachment - Raw Slack attachment object
 * @returns {FormattedAttachment|null} Formatted attachment
 */
export function formatAttachment(attachment: SlackAttachment): FormattedAttachment | null;
/**
 * Format a Slack reaction
 * @param {SlackReaction} reaction - Raw Slack reaction object
 * @returns {FormattedReaction|null} Formatted reaction
 */
export function formatReaction(reaction: SlackReaction): FormattedReaction | null;
/**
 * Format a Slack file
 * @param {SlackFile} file - Raw Slack file object
 * @returns {FormattedFile|null} Formatted file
 */
export function formatFile(file: SlackFile): FormattedFile | null;
/**
 * Format file upload progress
 * @param {SlackFileUploadResult} uploadResult - File upload result
 * @returns {FormattedFileUploadResult|null} Formatted upload result
 */
export function formatFileUploadResult(uploadResult: SlackFileUploadResult): FormattedFileUploadResult | null;
export type SlackMessage = import("../middleware/types.js").SlackMessage;
export type SlackAttachment = import("../middleware/types.js").SlackAttachment;
export type SlackReaction = import("../middleware/types.js").SlackReaction;
export type SlackFile = import("../middleware/types.js").SlackFile;
export type SlackFileUploadResult = import("../middleware/types.js").SlackFileUploadResult;
export type SlackMessageEdit = import("../middleware/types.js").SlackMessageEdit;
export type SlackBlock = import("../middleware/types.js").SlackBlock;
export type SlackField = import("../middleware/types.js").SlackField;
/**
 * Formatted message response object
 */
export type FormattedMessage = {
    /**
     * - Message timestamp
     */
    ts?: string | undefined;
    /**
     * - Message type
     */
    type?: string | undefined;
    /**
     * - Message text
     */
    text?: string | undefined;
    /**
     * - User ID
     */
    user?: string | undefined;
    /**
     * - Channel ID
     */
    channel?: string | undefined;
    /**
     * - ISO timestamp
     */
    timestamp?: string | null | undefined;
    /**
     * - Thread timestamp
     */
    thread_ts?: string | undefined;
    /**
     * - Reply count
     */
    reply_count?: number | undefined;
    /**
     * - Reply users count
     */
    reply_users_count?: number | undefined;
    /**
     * - Latest reply timestamp
     */
    latest_reply?: string | undefined;
    /**
     * - Bot ID
     */
    bot_id?: string | undefined;
    /**
     * - Username
     */
    username?: string | undefined;
    /**
     * - Attachments
     */
    attachments?: FormattedAttachment[] | undefined;
    /**
     * - Message blocks
     */
    blocks?: import("../middleware/types.js").SlackBlock[] | undefined;
    /**
     * - Reactions
     */
    reactions?: FormattedReaction[] | undefined;
    /**
     * - Files
     */
    files?: FormattedFile[] | undefined;
    /**
     * - Edit information
     */
    edited?: FormattedMessageEdit | undefined;
};
/**
 * Formatted attachment object
 */
export type FormattedAttachment = {
    /**
     * - Attachment ID
     */
    id?: string | undefined;
    /**
     * - Color
     */
    color?: string | undefined;
    /**
     * - Fallback text
     */
    fallback?: string | undefined;
    /**
     * - Title
     */
    title?: string | undefined;
    /**
     * - Title link
     */
    title_link?: string | undefined;
    /**
     * - Text
     */
    text?: string | undefined;
    /**
     * - Pretext
     */
    pretext?: string | undefined;
    /**
     * - Author name
     */
    author_name?: string | undefined;
    /**
     * - Author link
     */
    author_link?: string | undefined;
    /**
     * - Author icon
     */
    author_icon?: string | undefined;
    /**
     * - Image URL
     */
    image_url?: string | undefined;
    /**
     * - Thumbnail URL
     */
    thumb_url?: string | undefined;
    /**
     * - Footer
     */
    footer?: string | undefined;
    /**
     * - Footer icon
     */
    footer_icon?: string | undefined;
    /**
     * - Timestamp
     */
    ts?: number | undefined;
    /**
     * - Fields
     */
    fields?: import("../middleware/types.js").SlackField[] | undefined;
};
/**
 * Formatted reaction object
 */
export type FormattedReaction = {
    /**
     * - Reaction name
     */
    name?: string | undefined;
    /**
     * - Count
     */
    count?: number | undefined;
    /**
     * - User IDs
     */
    users?: string[] | undefined;
};
/**
 * Formatted file object
 */
export type FormattedFile = {
    /**
     * - File ID
     */
    id?: string | undefined;
    /**
     * - Name
     */
    name?: string | undefined;
    /**
     * - Title
     */
    title?: string | undefined;
    /**
     * - MIME type
     */
    mimetype?: string | undefined;
    /**
     * - File type
     */
    filetype?: string | undefined;
    /**
     * - Pretty type
     */
    pretty_type?: string | undefined;
    /**
     * - User ID
     */
    user?: string | undefined;
    /**
     * - Mode
     */
    mode?: string | undefined;
    /**
     * - Editable
     */
    editable?: boolean | undefined;
    /**
     * - Is external
     */
    is_external?: boolean | undefined;
    /**
     * - External type
     */
    external_type?: string | undefined;
    /**
     * - Size
     */
    size?: number | undefined;
    /**
     * - Private URL
     */
    url_private?: string | undefined;
    /**
     * - Private download URL
     */
    url_private_download?: string | undefined;
    /**
     * - 64px thumbnail
     */
    thumb_64?: string | undefined;
    /**
     * - 80px thumbnail
     */
    thumb_80?: string | undefined;
    /**
     * - 160px thumbnail
     */
    thumb_160?: string | undefined;
    /**
     * - 360px thumbnail
     */
    thumb_360?: string | undefined;
    /**
     * - 480px thumbnail
     */
    thumb_480?: string | undefined;
    /**
     * - 720px thumbnail
     */
    thumb_720?: string | undefined;
    /**
     * - 800px thumbnail
     */
    thumb_800?: string | undefined;
    /**
     * - 960px thumbnail
     */
    thumb_960?: string | undefined;
    /**
     * - 1024px thumbnail
     */
    thumb_1024?: string | undefined;
    /**
     * - Permalink
     */
    permalink?: string | undefined;
    /**
     * - Public permalink
     */
    permalink_public?: string | undefined;
    /**
     * - Created timestamp
     */
    created?: number | undefined;
    /**
     * - Timestamp
     */
    timestamp?: number | undefined;
};
/**
 * Formatted message edit object
 */
export type FormattedMessageEdit = {
    /**
     * - User ID
     */
    user?: string | undefined;
    /**
     * - Timestamp
     */
    ts?: string | undefined;
    /**
     * - ISO timestamp
     */
    timestamp?: string | undefined;
};
/**
 * Formatted file upload result object
 */
export type FormattedFileUploadResult = {
    /**
     * - Success status
     */
    ok?: boolean | undefined;
    /**
     * - File object
     */
    file?: FormattedFile | null | undefined;
    /**
     * - Upload time
     */
    upload_time?: string | undefined;
    /**
     * - Warning message
     */
    warning?: string | undefined;
};
//# sourceMappingURL=messageFormatting.d.ts.map