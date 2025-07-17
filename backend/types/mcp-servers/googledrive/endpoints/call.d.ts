/**
 * Execute a Google Drive tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Google Drive API
 * @returns {Object} Tool execution result
 */
export function executeToolCall(toolName: string, args: Object, bearerToken: string): Object;
/**
 * Get list of available Google Drive tools
 * @returns {Array} List of tool definitions
 */
export function getAvailableTools(): any[];
//# sourceMappingURL=call.d.ts.map