/**
 * @typedef {Object} GmailMessagePayload
 * @property {string} [partId] - Part ID
 * @property {string} [mimeType] - MIME type
 * @property {string} [filename] - Filename
 * @property {Object} [headers] - Message headers
 * @property {Object} [body] - Message body
 * @property {GmailMessagePayload[]} [parts] - Message parts
 */
/**
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} snippet - Message snippet
 * @property {string} internalDate - Internal date timestamp
 * @property {GmailMessagePayload} payload - Message payload
 * @property {string[]} labelIds - Label IDs
 * @property {number} sizeEstimate - Size estimate
 */
/**
 * @typedef {Object} GmailThreadResponse
 * @property {string} id - Thread ID
 * @property {string} snippet - Thread snippet
 * @property {GmailMessage[]} messages - Array of messages in thread
 * @property {number} historyId - History ID
 */
/**
 * @typedef {Object} GetThreadArgs
 * @property {string} threadId - Thread ID to fetch
 * @property {string} [format] - Thread format
 */
/**
 * @typedef {Object} AttachmentInfo
 * @property {string} filename - Attachment filename
 * @property {string} mimeType - MIME type
 * @property {number} size - File size
 * @property {string} attachmentId - Attachment ID
 * @property {string} partId - Part ID
 */
/**
 * @typedef {Object} FormattedMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} subject - Message subject
 * @property {string} from - Sender
 * @property {string} to - Recipient
 * @property {string} date - Date
 * @property {string} snippet - Message snippet
 * @property {string} body - Message body
 * @property {string[]} labelIds - Label IDs
 * @property {string} messageId - Message ID header
 * @property {number} sizeEstimate - Size estimate
 * @property {string} raw - Raw message availability
 * @property {AttachmentInfo[]} attachments - Attachments
 * @property {boolean} hasAttachments - Has attachments flag
 */
/**
 * @typedef {Object} ThreadResult
 * @property {string} threadId - Thread ID
 * @property {number} messageCount - Number of messages in thread
 * @property {string} snippet - Thread snippet
 * @property {FormattedMessage[]} messages - Formatted messages
 */
/**
 * Get an email thread
 * @param {GetThreadArgs} args - Thread arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ThreadResult>} Thread details
 */
export function getThread(args: GetThreadArgs, bearerToken: string): Promise<ThreadResult>;
export type GmailMessagePayload = {
    /**
     * - Part ID
     */
    partId?: string | undefined;
    /**
     * - MIME type
     */
    mimeType?: string | undefined;
    /**
     * - Filename
     */
    filename?: string | undefined;
    /**
     * - Message headers
     */
    headers?: Object | undefined;
    /**
     * - Message body
     */
    body?: Object | undefined;
    /**
     * - Message parts
     */
    parts?: GmailMessagePayload[] | undefined;
};
export type GmailMessage = {
    /**
     * - Message ID
     */
    id: string;
    /**
     * - Thread ID
     */
    threadId: string;
    /**
     * - Message snippet
     */
    snippet: string;
    /**
     * - Internal date timestamp
     */
    internalDate: string;
    /**
     * - Message payload
     */
    payload: GmailMessagePayload;
    /**
     * - Label IDs
     */
    labelIds: string[];
    /**
     * - Size estimate
     */
    sizeEstimate: number;
};
export type GmailThreadResponse = {
    /**
     * - Thread ID
     */
    id: string;
    /**
     * - Thread snippet
     */
    snippet: string;
    /**
     * - Array of messages in thread
     */
    messages: GmailMessage[];
    /**
     * - History ID
     */
    historyId: number;
};
export type GetThreadArgs = {
    /**
     * - Thread ID to fetch
     */
    threadId: string;
    /**
     * - Thread format
     */
    format?: string | undefined;
};
export type AttachmentInfo = {
    /**
     * - Attachment filename
     */
    filename: string;
    /**
     * - MIME type
     */
    mimeType: string;
    /**
     * - File size
     */
    size: number;
    /**
     * - Attachment ID
     */
    attachmentId: string;
    /**
     * - Part ID
     */
    partId: string;
};
export type FormattedMessage = {
    /**
     * - Message ID
     */
    id: string;
    /**
     * - Thread ID
     */
    threadId: string;
    /**
     * - Message subject
     */
    subject: string;
    /**
     * - Sender
     */
    from: string;
    /**
     * - Recipient
     */
    to: string;
    /**
     * - Date
     */
    date: string;
    /**
     * - Message snippet
     */
    snippet: string;
    /**
     * - Message body
     */
    body: string;
    /**
     * - Label IDs
     */
    labelIds: string[];
    /**
     * - Message ID header
     */
    messageId: string;
    /**
     * - Size estimate
     */
    sizeEstimate: number;
    /**
     * - Raw message availability
     */
    raw: string;
    /**
     * - Attachments
     */
    attachments: AttachmentInfo[];
    /**
     * - Has attachments flag
     */
    hasAttachments: boolean;
};
export type ThreadResult = {
    /**
     * - Thread ID
     */
    threadId: string;
    /**
     * - Number of messages in thread
     */
    messageCount: number;
    /**
     * - Thread snippet
     */
    snippet: string;
    /**
     * - Formatted messages
     */
    messages: FormattedMessage[];
};
//# sourceMappingURL=thread-operations.d.ts.map