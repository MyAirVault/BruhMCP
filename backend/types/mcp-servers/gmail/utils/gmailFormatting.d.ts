/**
 * Email data for formatting MCP responses
 */
export type EmailData = {
    /**
     * - Operation timestamp
     */
    timestamp?: string | undefined;
    /**
     * - Action performed
     */
    action: string;
    /**
     * - Gmail message ID
     */
    messageId?: string | undefined;
    /**
     * - Gmail thread ID
     */
    threadId?: string | undefined;
    /**
     * - Recipient email
     */
    to?: string | undefined;
    /**
     * - Email subject
     */
    subject?: string | undefined;
    /**
     * - Draft ID
     */
    draftId?: string | undefined;
    /**
     * - Message previews
     */
    messages?: MessagePreview[] | undefined;
    /**
     * - Message count
     */
    count?: number | undefined;
    /**
     * - Search query
     */
    query?: string | undefined;
    /**
     * - Total result estimate
     */
    totalEstimate?: number | undefined;
    /**
     * - Attachment count
     */
    attachmentCount?: number | undefined;
    /**
     * - Attachment details
     */
    attachments?: AttachmentInfo[] | undefined;
    /**
     * - Message IDs array
     */
    messageIds?: string[] | undefined;
    /**
     * - Attachment ID
     */
    attachmentId?: string | undefined;
    /**
     * - Size in bytes
     */
    size?: number | undefined;
    /**
     * - Draft information
     */
    drafts?: DraftInfo[] | undefined;
};
/**
 * Message preview data
 */
export type MessagePreview = {
    /**
     * - Message ID
     */
    id: string;
    /**
     * - Message snippet
     */
    snippet?: string | undefined;
    /**
     * - Message subject
     */
    subject?: string | undefined;
    /**
     * - Sender email
     */
    from?: string | undefined;
    /**
     * - Message date
     */
    date?: string | undefined;
    /**
     * - Has attachments flag
     */
    hasAttachments?: boolean | undefined;
    /**
     * - Attachment list
     */
    attachments?: {
        filename: string;
    }[] | undefined;
};
/**
 * Attachment information
 */
export type AttachmentInfo = {
    /**
     * - Attachment filename
     */
    filename: string;
    /**
     * - Size in bytes
     */
    size: number;
    /**
     * - Human readable size
     */
    readableSize?: string | undefined;
    /**
     * - MIME type
     */
    mimeType?: string | undefined;
    /**
     * - Attachment ID
     */
    attachmentId?: string | undefined;
    /**
     * - Part ID
     */
    partId?: string | undefined;
};
/**
 * Draft information
 */
export type DraftInfo = {
    /**
     * - Draft ID
     */
    id: string;
    /**
     * - Message data
     */
    message: {
        subject?: string;
        to?: string;
    };
};
/**
 * Gmail message payload part
 */
export type MessagePayloadPart = {
    /**
     * - Message headers
     */
    headers?: {
        name: string;
        value: string;
    }[] | undefined;
    /**
     * - Part filename
     */
    filename?: string | undefined;
    /**
     * - MIME type
     */
    mimeType?: string | undefined;
    /**
     * - Part ID
     */
    partId?: string | undefined;
    /**
     * - Part body
     */
    body?: {
        data?: string | undefined;
        size?: number | undefined;
        attachmentId?: string | undefined;
    } | undefined;
    /**
     * - Nested parts
     */
    parts?: MessagePayloadPart[] | undefined;
};
/**
 * Gmail message object
 */
export type GmailMessage = {
    /**
     * - Message ID
     */
    id: string;
    /**
     * - Thread ID
     */
    threadId?: string | undefined;
    /**
     * - Label IDs
     */
    labelIds?: string[] | undefined;
    /**
     * - Message snippet
     */
    snippet?: string | undefined;
    /**
     * - Internal date
     */
    internalDate?: string | undefined;
    /**
     * - Message payload
     */
    payload?: MessagePayloadPart | undefined;
    /**
     * - Size estimate
     */
    sizeEstimate?: number | undefined;
    /**
     * - Raw message data
     */
    raw?: string | undefined;
};
/**
 * Formatted message response
 */
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
     * - Formatted date
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
    labelIds: Array<string>;
    /**
     * - Message ID header
     */
    messageId: string;
    /**
     * - Size estimate
     */
    sizeEstimate: number;
    /**
     * - Raw availability
     */
    raw: string;
    /**
     * - Attachments
     */
    attachments: Array<AttachmentInfo>;
    /**
     * - Has attachments flag
     */
    hasAttachments: boolean;
};
/**
 * Draft formatting data
 */
export type DraftData = {
    /**
     * - Operation timestamp
     */
    timestamp?: string | undefined;
    /**
     * - Action performed
     */
    action: string;
    /**
     * - Draft ID
     */
    draftId?: string | undefined;
    /**
     * - Message ID
     */
    messageId?: string | undefined;
    /**
     * - Recipient
     */
    to?: string | undefined;
    /**
     * - Subject
     */
    subject?: string | undefined;
    /**
     * - Draft count
     */
    count?: number | undefined;
    /**
     * - Draft list
     */
    drafts?: {
        draftId: string;
        messageId: string;
        snippet?: string | undefined;
        timestamp: string;
    }[] | undefined;
};
/**
 * Gmail response formatting utilities
 * Standardizes Gmail API responses for MCP protocol
 */
/**
 * Email data for formatting MCP responses
 * @typedef {Object} EmailData
 * @property {string} [timestamp] - Operation timestamp
 * @property {string} action - Action performed
 * @property {string} [messageId] - Gmail message ID
 * @property {string} [threadId] - Gmail thread ID
 * @property {string} [to] - Recipient email
 * @property {string} [subject] - Email subject
 * @property {string} [draftId] - Draft ID
 * @property {Array<MessagePreview>} [messages] - Message previews
 * @property {number} [count] - Message count
 * @property {string} [query] - Search query
 * @property {number} [totalEstimate] - Total result estimate
 * @property {number} [attachmentCount] - Attachment count
 * @property {Array<AttachmentInfo>} [attachments] - Attachment details
 * @property {Array<string>} [messageIds] - Message IDs array
 * @property {string} [attachmentId] - Attachment ID
 * @property {number} [size] - Size in bytes
 * @property {Array<DraftInfo>} [drafts] - Draft information
 */
/**
 * Message preview data
 * @typedef {Object} MessagePreview
 * @property {string} id - Message ID
 * @property {string} [snippet] - Message snippet
 * @property {string} [subject] - Message subject
 * @property {string} [from] - Sender email
 * @property {string} [date] - Message date
 * @property {boolean} [hasAttachments] - Has attachments flag
 * @property {Array<{filename: string}>} [attachments] - Attachment list
 */
/**
 * Attachment information
 * @typedef {Object} AttachmentInfo
 * @property {string} filename - Attachment filename
 * @property {number} size - Size in bytes
 * @property {string} [readableSize] - Human readable size
 * @property {string} [mimeType] - MIME type
 * @property {string} [attachmentId] - Attachment ID
 * @property {string} [partId] - Part ID
 */
/**
 * Draft information
 * @typedef {Object} DraftInfo
 * @property {string} id - Draft ID
 * @property {{subject?: string, to?: string}} message - Message data
 */
/**
 * Format email response for MCP protocol
 * @param {EmailData} data - Email data to format
 * @returns {string} Formatted email response
 */
export function formatEmailResponse(data: EmailData): string;
/**
 * Gmail message payload part
 * @typedef {Object} MessagePayloadPart
 * @property {Array<{name: string, value: string}>} [headers] - Message headers
 * @property {string} [filename] - Part filename
 * @property {string} [mimeType] - MIME type
 * @property {string} [partId] - Part ID
 * @property {{data?: string, size?: number, attachmentId?: string}} [body] - Part body
 * @property {Array<MessagePayloadPart>} [parts] - Nested parts
 */
/**
 * Gmail message object
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} [threadId] - Thread ID
 * @property {Array<string>} [labelIds] - Label IDs
 * @property {string} [snippet] - Message snippet
 * @property {string} [internalDate] - Internal date
 * @property {MessagePayloadPart} [payload] - Message payload
 * @property {number} [sizeEstimate] - Size estimate
 * @property {string} [raw] - Raw message data
 */
/**
 * Formatted message response
 * @typedef {Object} FormattedMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} subject - Message subject
 * @property {string} from - Sender
 * @property {string} to - Recipient
 * @property {string} date - Formatted date
 * @property {string} snippet - Message snippet
 * @property {string} body - Message body
 * @property {Array<string>} labelIds - Label IDs
 * @property {string} messageId - Message ID header
 * @property {number} sizeEstimate - Size estimate
 * @property {string} raw - Raw availability
 * @property {Array<AttachmentInfo>} attachments - Attachments
 * @property {boolean} hasAttachments - Has attachments flag
 */
/**
 * Format individual message response
 * @param {GmailMessage} message - Gmail message object
 * @returns {FormattedMessage} Formatted message data
 */
export function formatMessageResponse(message: GmailMessage): FormattedMessage;
/**
 * Draft formatting data
 * @typedef {Object} DraftData
 * @property {string} [timestamp] - Operation timestamp
 * @property {string} action - Action performed
 * @property {string} [draftId] - Draft ID
 * @property {string} [messageId] - Message ID
 * @property {string} [to] - Recipient
 * @property {string} [subject] - Subject
 * @property {number} [count] - Draft count
 * @property {Array<{draftId: string, messageId: string, snippet?: string, timestamp: string}>} [drafts] - Draft list
 */
/**
 * Format draft response for MCP protocol
 * @param {DraftData} data - Draft data to format
 * @returns {string} Formatted draft response
 */
export function formatDraftResponse(data: DraftData): string;
/**
 * Format search results for better readability
 * @param {Array<FormattedMessage>} messages - Array of message objects
 * @param {string} query - Search query used
 * @returns {string} Formatted search results
 */
export function formatSearchResults(messages: Array<FormattedMessage>, query: string): string;
/**
 * Format error messages for Gmail operations
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(operation: string, error: Error): string;
//# sourceMappingURL=gmailFormatting.d.ts.map