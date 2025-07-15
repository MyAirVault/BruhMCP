/**
 * Creates log directory structure for a new MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {Promise<{success: boolean, logDir?: string, error?: string}>}
 */
export function createMCPLogDirectory(userId: string, instanceId: string): Promise<{
    success: boolean;
    logDir?: string;
    error?: string;
}>;
/**
 * Removes log directory structure for a deleted MCP instance
 * @param {string} userId - User ID
 * @param {string} instanceId - MCP instance ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export function removeMCPLogDirectory(userId: string, instanceId: string): Promise<{
    success: boolean;
    error?: string;
}>;
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
 * @returns {Promise<{success: boolean, userLogDir?: string, error?: string}>}
 */
export function createUserLogDirectory(userId: string): Promise<{
    success: boolean;
    userLogDir?: string;
    error?: string;
}>;
//# sourceMappingURL=logDirectoryManager.d.ts.map