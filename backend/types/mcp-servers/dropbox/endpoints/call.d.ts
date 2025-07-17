/**
 * Execute a Dropbox tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Dropbox API
 * @returns {Promise<Object>} Tool execution result in MCP format
 * @throws {Error} If tool execution fails or validation errors occur
 */
export function executeToolCall(toolName: string, args: Object, bearerToken: string): Promise<Object>;
//# sourceMappingURL=call.d.ts.map