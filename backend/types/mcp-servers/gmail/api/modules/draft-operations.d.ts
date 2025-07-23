/**
 * @typedef {Object} GmailDraftResponse
 * @property {string} id - Draft ID
 * @property {GmailMessage} message - Draft message object
 */
/**
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} snippet - Message snippet
 * @property {string} internalDate - Internal date timestamp
 */
/**
 * @typedef {Object} GmailDraftListResponse
 * @property {GmailDraft[]} [drafts] - Array of draft objects
 * @property {string} [nextPageToken] - Token for next page
 */
/**
 * @typedef {Object} GmailDraft
 * @property {string} id - Draft ID
 * @property {GmailMessage} message - Message object
 */
/**
 * @typedef {Object} GmailSendResponse
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 */
/**
 * @typedef {Object} CreateDraftArgs
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} body - Email body content
 * @property {string} [cc] - CC recipients
 * @property {string} [bcc] - BCC recipients
 * @property {string} [format] - Email format (text|html)
 */
/**
 * @typedef {Object} SendDraftArgs
 * @property {string} draftId - Draft ID to send
 */
/**
 * @typedef {Object} ListDraftsArgs
 * @property {number} [maxResults] - Maximum results to return
 * @property {string} [query] - Search query for drafts
 */
/**
 * Create an email draft
 * @param {CreateDraftArgs} args - Draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Draft creation result
 */
export function createDraft(args: CreateDraftArgs, bearerToken: string): Promise<string>;
/**
 * Send a draft email
 * @param {SendDraftArgs} args - Send draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Send result
 */
export function sendDraft(args: SendDraftArgs, bearerToken: string): Promise<string>;
/**
 * List email drafts
 * @param {ListDraftsArgs} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Drafts list
 */
export function listDrafts(args: ListDraftsArgs, bearerToken: string): Promise<string>;
export type GmailDraftResponse = {
    /**
     * - Draft ID
     */
    id: string;
    /**
     * - Draft message object
     */
    message: GmailMessage;
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
};
export type GmailDraftListResponse = {
    /**
     * - Array of draft objects
     */
    drafts?: GmailDraft[] | undefined;
    /**
     * - Token for next page
     */
    nextPageToken?: string | undefined;
};
export type GmailDraft = {
    /**
     * - Draft ID
     */
    id: string;
    /**
     * - Message object
     */
    message: GmailMessage;
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
export type CreateDraftArgs = {
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
export type SendDraftArgs = {
    /**
     * - Draft ID to send
     */
    draftId: string;
};
export type ListDraftsArgs = {
    /**
     * - Maximum results to return
     */
    maxResults?: number | undefined;
    /**
     * - Search query for drafts
     */
    query?: string | undefined;
};
//# sourceMappingURL=draft-operations.d.ts.map