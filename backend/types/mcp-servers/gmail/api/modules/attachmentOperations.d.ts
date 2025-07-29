export type GmailAttachment = {
    /**
     * - Attachment ID
     */
    attachmentId: string;
    /**
     * - Attachment filename
     */
    filename: string;
    /**
     * - MIME type
     */
    mimeType: string;
    /**
     * - Size in bytes
     */
    size: number;
    /**
     * - Part ID
     */
    partId: string;
};
export type GmailApiResponse = {
    /**
     * - Response ID
     */
    id: string;
    /**
     * - Thread ID
     */
    threadId: string;
    /**
     * - Base64 encoded data
     */
    data: string;
    /**
     * - Size in bytes
     */
    size: number;
};
export type GmailMessageApiResponse = {
    /**
     * - Message ID
     */
    id: string;
    /**
     * - Thread ID
     */
    threadId: string;
    /**
     * - Message payload
     */
    payload: Object;
};
export type AttachmentData = {
    /**
     * - Filename
     */
    filename: string;
    /**
     * - MIME type
     */
    mimeType: string;
    /**
     * - Base64 encoded data
     */
    data: string;
};
export type MessageResponse = {
    /**
     * - Array of attachments
     */
    attachments: GmailAttachment[];
    /**
     * - Whether message has attachments
     */
    hasAttachments: boolean;
};
export type DownloadArgs = {
    /**
     * - Message ID containing the attachment
     */
    messageId: string;
    /**
     * - Attachment ID to download
     */
    attachmentId: string;
    /**
     * - Return data as data URL
     */
    returnDataUrl?: boolean | undefined;
};
export type ListAttachmentsArgs = {
    /**
     * - Message ID to list attachments for
     */
    messageId: string;
};
export type SendWithAttachmentsArgs = {
    /**
     * - Recipient email address
     */
    to: string;
    /**
     * - Email subject
     */
    subject: string;
    /**
     * - Email body content
     */
    body: string;
    /**
     * - CC recipients
     */
    cc?: string | undefined;
    /**
     * - BCC recipients
     */
    bcc?: string | undefined;
    /**
     * - Email format (text|html)
     */
    format?: string | undefined;
    /**
     * - Attachments array
     */
    attachments?: AttachmentData[] | undefined;
};
/**
 * Download an attachment from a Gmail message
 * @param {DownloadArgs} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Attachment data
 */
export function downloadAttachment(args: DownloadArgs, bearerToken: string): Promise<Object>;
/**
 * List attachments for a specific message
 * @param {ListAttachmentsArgs} args - List attachments arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Attachments list
 */
export function listAttachments(args: ListAttachmentsArgs, bearerToken: string): Promise<Object>;
/**
 * Send an email with attachments
 * @param {SendWithAttachmentsArgs} args - Email with attachments arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Send result
 */
export function sendEmailWithAttachments(args: SendWithAttachmentsArgs, bearerToken: string): Promise<Object>;
//# sourceMappingURL=attachmentOperations.d.ts.map