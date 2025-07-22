/**
 * Result of log directory creation operation
 * @typedef {Object} LogDirectoryResult
 * @property {boolean} success - Whether the operation was successful
 * @property {string} [logDir] - Path to the created log directory (on success)
 * @property {string} [error] - Error message (on failure)
 */
/**
 * Result of user log directory creation operation
 * @typedef {Object} UserLogDirectoryResult
 * @property {boolean} success - Whether the operation was successful
 * @property {string} [userLogDir] - Path to the created user log directory (on success)
 * @property {string} [error] - Error message (on failure)
 */
/**
 * Result of log directory removal operation
 * @typedef {Object} RemoveDirectoryResult
 * @property {boolean} success - Whether the operation was successful
 * @property {string} [error] - Error message (on failure)
 */
/**
 * Creates log directory structure for a new MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {Promise<LogDirectoryResult>}
 */
export function createMCPLogDirectory(userId: string, instanceId: string): Promise<LogDirectoryResult>;
/**
 * Removes log directory structure for a deleted MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {Promise<RemoveDirectoryResult>}
 */
export function removeMCPLogDirectory(userId: string, instanceId: string): Promise<RemoveDirectoryResult>;
/**
 * Gets the log directory path for an MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {string} Log directory path
 */
export function getMCPLogDirectoryPath(userId: string, instanceId: string): string;
/**
 * Checks if log directory exists for an MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {boolean} True if directory exists
 */
export function mcpLogDirectoryExists(userId: string, instanceId: string): boolean;
/**
 * Creates user log directory structure if it doesn't exist
 * @param {string} userId - User ID
 * @returns {Promise<UserLogDirectoryResult>}
 */
export function createUserLogDirectory(userId: string): Promise<UserLogDirectoryResult>;
/**
 * Result of log directory creation operation
 */
export type LogDirectoryResult = {
    /**
     * - Whether the operation was successful
     */
    success: boolean;
    /**
     * - Path to the created log directory (on success)
     */
    logDir?: string | undefined;
    /**
     * - Error message (on failure)
     */
    error?: string | undefined;
};
/**
 * Result of user log directory creation operation
 */
export type UserLogDirectoryResult = {
    /**
     * - Whether the operation was successful
     */
    success: boolean;
    /**
     * - Path to the created user log directory (on success)
     */
    userLogDir?: string | undefined;
    /**
     * - Error message (on failure)
     */
    error?: string | undefined;
};
/**
 * Result of log directory removal operation
 */
export type RemoveDirectoryResult = {
    /**
     * - Whether the operation was successful
     */
    success: boolean;
    /**
     * - Error message (on failure)
     */
    error?: string | undefined;
};
//# sourceMappingURL=logDirectoryManager.d.ts.map