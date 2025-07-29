export type RequestOptions = {
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Request headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - Request body
     */
    body?: any;
};
export type GmailLabel = {
    /**
     * - Label ID
     */
    id: string;
    /**
     * - Label name
     */
    name: string;
    /**
     * - Label type (system/user)
     */
    type: string;
    /**
     * - Total messages
     */
    messagesTotal?: number | undefined;
    /**
     * - Unread messages
     */
    messagesUnread?: number | undefined;
    /**
     * - Total threads
     */
    threadsTotal?: number | undefined;
    /**
     * - Unread threads
     */
    threadsUnread?: number | undefined;
    /**
     * - Message list visibility
     */
    messageListVisibility?: string | undefined;
    /**
     * - Label list visibility
     */
    labelListVisibility?: string | undefined;
};
export type GmailApiResponse = {
    /**
     * - Array of labels
     */
    labels?: GmailLabel[] | undefined;
    /**
     * - ID field
     */
    id?: string | undefined;
    /**
     * - Name field
     */
    name?: string | undefined;
    /**
     * - Type field
     */
    type?: string | undefined;
    /**
     * - Thread ID
     */
    threadId?: string | undefined;
    /**
     * - Label IDs
     */
    labelIds?: string[] | undefined;
    /**
     * - Total messages
     */
    messagesTotal?: number | undefined;
    /**
     * - Unread messages
     */
    messagesUnread?: number | undefined;
    /**
     * - Total threads
     */
    threadsTotal?: number | undefined;
    /**
     * - Unread threads
     */
    threadsUnread?: number | undefined;
    /**
     * - Message list visibility
     */
    messageListVisibility?: string | undefined;
    /**
     * - Label list visibility
     */
    labelListVisibility?: string | undefined;
};
export type CreateLabelArgs = {
    /**
     * - Label name
     */
    name: string;
    /**
     * - Message list visibility
     */
    messageListVisibility?: string | undefined;
    /**
     * - Label list visibility
     */
    labelListVisibility?: string | undefined;
};
export type ModifyLabelsArgs = {
    /**
     * - Message ID
     */
    messageId: string;
    /**
     * - Label IDs to add
     */
    addLabelIds?: string[] | undefined;
    /**
     * - Label IDs to remove
     */
    removeLabelIds?: string[] | undefined;
};
export type LabelIdArgs = {
    /**
     * - Label ID
     */
    labelId: string;
};
export type UpdateLabelArgs = {
    /**
     * - Label ID
     */
    labelId: string;
    /**
     * - Label name
     */
    name?: string | undefined;
    /**
     * - Message list visibility
     */
    messageListVisibility?: string | undefined;
    /**
     * - Label list visibility
     */
    labelListVisibility?: string | undefined;
};
/**
 * List all Gmail labels
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Labels list
 */
export function listLabels(bearerToken: string): Promise<Object>;
/**
 * Create a new Gmail label
 * @param {CreateLabelArgs} args - Label creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label creation result
 */
export function createLabel(args: CreateLabelArgs, bearerToken: string): Promise<Object>;
/**
 * Modify labels on a message
 * @param {ModifyLabelsArgs} args - Label modification arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label modification result
 */
export function modifyLabels(args: ModifyLabelsArgs, bearerToken: string): Promise<Object>;
/**
 * Delete a Gmail label
 * @param {LabelIdArgs} args - Label deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label deletion result
 */
export function deleteLabel(args: LabelIdArgs, bearerToken: string): Promise<Object>;
/**
 * Update a Gmail label
 * @param {UpdateLabelArgs} args - Label update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label update result
 */
export function updateLabel(args: UpdateLabelArgs, bearerToken: string): Promise<Object>;
/**
 * Get label details by ID
 * @param {LabelIdArgs} args - Label get arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label details
 */
export function getLabel(args: LabelIdArgs, bearerToken: string): Promise<Object>;
//# sourceMappingURL=labelOperations.d.ts.map