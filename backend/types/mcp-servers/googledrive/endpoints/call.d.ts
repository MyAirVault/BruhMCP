/**
 * Execute a Google Drive tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Record<string, string | number | boolean | string[] | Record<string, unknown>>} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Google Drive API
 * @returns {Promise<Object>} Tool execution result
 */
export function executeToolCall(toolName: string, args: Record<string, string | number | boolean | string[] | Record<string, unknown>>, bearerToken: string): Promise<Object>;
/**
 * Get list of available Google Drive tools
 * @returns {Array<Object>} List of tool definitions
 */
export function getAvailableTools(): Array<Object>;
//# sourceMappingURL=call.d.ts.map