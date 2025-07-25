/**
 * Execute a Dropbox tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Record<string, unknown>} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Dropbox API
 * @returns {Promise<Record<string, unknown>>} Tool execution result in MCP format
 * @throws {Error} If tool execution fails or validation errors occur
 */
export function executeToolCall(toolName: string, args: Record<string, unknown>, bearerToken: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=call.d.ts.map