/**
 * JSON schema definition
 */
export type JSONSchema = {
    /**
     * - Data type
     */
    type?: string | undefined;
    /**
     * - Required properties
     */
    required?: string[] | undefined;
    /**
     * - Property schemas
     */
    properties?: Record<string, JSONSchema> | undefined;
    /**
     * - Enumerated values
     */
    enum?: any[] | undefined;
    /**
     * - Minimum string length
     */
    minLength?: number | undefined;
    /**
     * - Maximum string length
     */
    maxLength?: number | undefined;
    /**
     * - Regex pattern
     */
    pattern?: string | undefined;
    /**
     * - Minimum number value
     */
    minimum?: number | undefined;
    /**
     * - Maximum number value
     */
    maximum?: number | undefined;
    /**
     * - Multiple of value
     */
    multipleOf?: number | undefined;
    /**
     * - Minimum array items
     */
    minItems?: number | undefined;
    /**
     * - Maximum array items
     */
    maxItems?: number | undefined;
    /**
     * - Array item schema
     */
    items?: JSONSchema | undefined;
};
/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Record<string, any>} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Record<string, any>): void;
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