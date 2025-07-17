/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 * @returns {void}
 */
export function validateToolArguments(toolName: string, args: Object): void;
/**
 * Validate Google Drive search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid operators
 */
export function validateDriveQuery(query: string): void;
/**
 * Validate file ID format
 * @param {string} fileId - Google Drive file ID
 * @throws {Error} If file ID format is invalid
 */
export function validateFileId(fileId: string): void;
/**
 * Validate folder ID format
 * @param {string} folderId - Google Drive folder ID
 * @throws {Error} If folder ID format is invalid
 */
export function validateFolderId(folderId: string): void;
/**
 * Validate MIME type format
 * @param {string} mimeType - MIME type string
 * @throws {Error} If MIME type format is invalid
 */
export function validateMimeType(mimeType: string): void;
/**
 * Validate file name
 * @param {string} fileName - File name
 * @throws {Error} If file name is invalid
 */
export function validateFileName(fileName: string): void;
/**
 * Validate permissions role
 * @param {string} role - Permission role
 * @throws {Error} If role is invalid
 */
export function validatePermissionRole(role: string): void;
/**
 * Validate permissions type
 * @param {string} type - Permission type
 * @throws {Error} If type is invalid
 */
export function validatePermissionType(type: string): void;
/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @throws {Error} If email format is invalid
 */
export function validateEmailAddress(email: string): void;
/**
 * Validate domain name format
 * @param {string} domain - Domain name to validate
 * @throws {Error} If domain format is invalid
 */
export function validateDomainName(domain: string): void;
/**
 * Validate local file path
 * @param {string} path - File path to validate
 * @throws {Error} If path is invalid
 */
export function validateLocalPath(path: string): void;
//# sourceMappingURL=validation.d.ts.map