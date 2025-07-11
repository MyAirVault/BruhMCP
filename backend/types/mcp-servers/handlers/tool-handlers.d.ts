/**
 * Handle tool execution for MCP protocol
 * @param {Object} params - Tool execution parameters
 * @param {string} params.toolName - Name of the tool to execute
 * @param {Object} params.args - Tool arguments
 * @param {string} params.mcpType - MCP type
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} Tool execution result
 */
export function handleToolExecution({
	toolName,
	args: _args,
	mcpType,
	serviceConfig,
	apiKey,
}: {
	toolName: string;
	args: object;
	mcpType: string;
	serviceConfig: object;
	apiKey: string;
}): Promise<object>;
/**
 * Generate tools list based on service configuration
 * @param {Object} serviceConfig - Service configuration
 * @param {string} mcpType - MCP type
 * @returns {Array} List of available tools
 */
export function generateTools(serviceConfig: object, mcpType: string): any[];
//# sourceMappingURL=tool-handlers.d.ts.map
