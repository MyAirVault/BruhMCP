/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Object): void;
/**
 * Validate Dropbox search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid patterns
 */
export function validateDropboxQuery(query: string): void;
/**
 * Validate file path format
 * @param {string} path - Dropbox file path
 * @throws {Error} If path format is invalid
 */
export function validateDropboxPath(path: string): void;
/**
 * Sanitize file path to prevent directory traversal attacks
 * @param {string} path - File path to sanitize
 * @returns {string} Sanitized path
 */
export function sanitizePath(path: string): string;
/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum allowed size
 * @throws {Error} If size is invalid
 */
export function validateFileSize(size: number, maxSize?: number): void;
//# sourceMappingURL=validation.d.ts.map