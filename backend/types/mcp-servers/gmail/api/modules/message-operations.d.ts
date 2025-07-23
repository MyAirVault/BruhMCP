/**
 * @typedef {Object} SendEmailArgs
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} body - Email body content
 * @property {string} [cc] - CC recipients
 * @property {string} [bcc] - BCC recipients
 * @property {string} [format] - Email format (text|html)
 */
/**
 * @typedef {Object} FetchEmailsArgs
 * @property {string} [query] - Search query
 * @property {number} [maxResults] - Maximum results to return
 * @property {string[]} [labelIds] - Label IDs to filter by
 * @property {boolean} [includeSpamTrash] - Include spam/trash messages
 */
/**
 * @typedef {Object} FetchMessageByIdArgs
 * @property {string} messageId - Message ID to fetch
 * @property {string} [format] - Message format
 */
/**
 * @typedef {Object} ReplyToEmailArgs
 * @property {string} threadId - Thread ID to reply to
 * @property {string} body - Reply body content
 * @property {string} [subject] - Reply subject (auto-generated if empty)
 * @property {string} [format] - Email format (text|html)
 */
/**
 * @typedef {Object} MessageIdArgs
 * @property {string} messageId - Message ID
 */
/**
 * @typedef {Object} SearchEmailsArgs
 * @property {string} query - Search query string
 * @property {number} [maxResults] - Maximum results to return
 * @property {string} [newerThan] - Filter emails newer than date
 * @property {string} [olderThan] - Filter emails older than date
 */
/**
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {Object} payload - Message payload
 * @property {Array<{name: string, value: string}>} payload.headers - Message headers
 */
/**
 * @typedef {Object} GmailThread
 * @property {GmailMessage[]} messages - Messages in thread
 */
/**
 * @typedef {Object} GmailListResponse
 * @property {Array<{id: string, threadId: string}>} [messages] - Message list
 * @property {number} [resultSizeEstimate] - Estimated result count
 */
/**
 * @typedef {Object} GmailSendResponse
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 */
/**
 * @typedef {Object} FormattedMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} subject - Subject
 * @property {string} from - From address
 * @property {string} to - To address
 * @property {string} date - Date
 * @property {string} snippet - Message snippet
 * @property {string} body - Message body
 * @property {string[]} labelIds - Label IDs
 * @property {string} messageId - Message ID header
 * @property {number} sizeEstimate - Size estimate
 * @property {string} raw - Raw availability
 * @property {Array<Object>} attachments - Attachments
 * @property {boolean} hasAttachments - Has attachments flag
 */
/**
 * @typedef {Object} EmailResponse
 * @property {string} action - Action performed
 * @property {string} [messageId] - Message ID
 * @property {string} [threadId] - Thread ID
 * @property {string} [to] - Recipient
 * @property {string} [subject] - Subject
 * @property {string} timestamp - Timestamp
 * @property {number} [count] - Count of messages
 * @property {number} [totalEstimate] - Total estimate
 * @property {FormattedMessage[]} [messages] - Array of messages
 * @property {string} [query] - Search query
 */
/**
 * Send an email
 * @param {SendEmailArgs} args - Email arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Send result
 */
export function sendEmail(args: SendEmailArgs, bearerToken: string): Promise<string>;
/**
 * Fetch emails from Gmail
 * @param {FetchEmailsArgs} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Fetched emails
 */
export function fetchEmails(args: FetchEmailsArgs, bearerToken: string): Promise<string>;
/**
 * Fetch a specific message by ID
 * @param {FetchMessageByIdArgs} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FormattedMessage>} Message details
 */
export function fetchMessageById(args: FetchMessageByIdArgs, bearerToken: string): Promise<FormattedMessage>;
/**
 * Reply to an email thread
 * @param {ReplyToEmailArgs} args - Reply arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Reply result
 */
export function replyToEmail(args: ReplyToEmailArgs, bearerToken: string): Promise<string>;
/**
 * Delete a message permanently
 * @param {MessageIdArgs} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Delete result
 */
export function deleteMessage(args: MessageIdArgs, bearerToken: string): Promise<string>;
/**
 * Move message to trash
 * @param {MessageIdArgs} args - Trash arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Trash result
 */
export function moveToTrash(args: MessageIdArgs, bearerToken: string): Promise<string>;
/**
 * Search emails with advanced query
 * @param {SearchEmailsArgs} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Search results
 */
export function searchEmails(args: SearchEmailsArgs, bearerToken: string): Promise<string>;
export type SendEmailArgs = {
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
};
export type FetchEmailsArgs = {
    /**
     * - Search query
     */
    query?: string | undefined;
    /**
     * - Maximum results to return
     */
    maxResults?: number | undefined;
    /**
     * - Label IDs to filter by
     */
    labelIds?: string[] | undefined;
    /**
     * - Include spam/trash messages
     */
    includeSpamTrash?: boolean | undefined;
};
export type FetchMessageByIdArgs = {
    /**
     * - Message ID to fetch
     */
    messageId: string;
    /**
     * - Message format
     */
    format?: string | undefined;
};
export type ReplyToEmailArgs = {
    /**
     * - Thread ID to reply to
     */
    threadId: string;
    /**
     * - Reply body content
     */
    body: string;
    /**
     * - Reply subject (auto-generated if empty)
     */
    subject?: string | undefined;
    /**
     * - Email format (text|html)
     */
    format?: string | undefined;
};
export type MessageIdArgs = {
    /**
     * - Message ID
     */
    messageId: string;
};
export type SearchEmailsArgs = {
    /**
     * - Search query string
     */
    query: string;
    /**
     * - Maximum results to return
     */
    maxResults?: number | undefined;
    /**
     * - Filter emails newer than date
     */
    newerThan?: string | undefined;
    /**
     * - Filter emails older than date
     */
    olderThan?: string | undefined;
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
     * - Message payload
     */
    payload: {
        headers: Array<{
            name: string;
            value: string;
        }>;
    };
};
export type GmailThread = {
    /**
     * - Messages in thread
     */
    messages: GmailMessage[];
};
export type GmailListResponse = {
    /**
     * - Message list
     */
    messages?: {
        id: string;
        threadId: string;
    }[] | undefined;
    /**
     * - Estimated result count
     */
    resultSizeEstimate?: number | undefined;
};
export type GmailSendResponse = {
    /**
     * - Message ID
     */
    id: string;
    /**
     * - Thread ID
     */
    threadId: string;
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
     * - Subject
     */
    subject: string;
    /**
     * - From address
     */
    from: string;
    /**
     * - To address
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
     * - Raw availability
     */
    raw: string;
    /**
     * - Attachments
     */
    attachments: Array<Object>;
    /**
     * - Has attachments flag
     */
    hasAttachments: boolean;
};
export type EmailResponse = {
    /**
     * - Action performed
     */
    action: string;
    /**
     * - Message ID
     */
    messageId?: string | undefined;
    /**
     * - Thread ID
     */
    threadId?: string | undefined;
    /**
     * - Recipient
     */
    to?: string | undefined;
    /**
     * - Subject
     */
    subject?: string | undefined;
    /**
     * - Timestamp
     */
    timestamp: string;
    /**
     * - Count of messages
     */
    count?: number | undefined;
    /**
     * - Total estimate
     */
    totalEstimate?: number | undefined;
    /**
     * - Array of messages
     */
    messages?: FormattedMessage[] | undefined;
    /**
     * - Search query
     */
    query?: string | undefined;
};
//# sourceMappingURL=message-operations.d.ts.map