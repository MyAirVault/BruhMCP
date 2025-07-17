/**
 * Execute a Notion tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Tool execution result
 */
export function executeToolCall(toolName: string, args: Object, bearerToken: string): Object;
/**
 * Get available Notion tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
export function getTools(): Object;
//# sourceMappingURL=tools.d.ts.map