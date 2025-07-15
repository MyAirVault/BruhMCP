/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Object): void;
/**
 * Validate Gmail search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid operators
 */
export function validateGmailQuery(query: string): void;
/**
 * Validate message ID format
 * @param {string} messageId - Gmail message ID
 * @throws {Error} If message ID format is invalid
 */
export function validateMessageId(messageId: string): void;
/**
 * Validate thread ID format
 * @param {string} threadId - Gmail thread ID
 * @throws {Error} If thread ID format is invalid
 */
export function validateThreadId(threadId: string): void;
/**
 * Validate label ID format
 * @param {string} labelId - Gmail label ID
 * @throws {Error} If label ID format is invalid
 */
export function validateLabelId(labelId: string): void;
//# sourceMappingURL=validation.d.ts.map