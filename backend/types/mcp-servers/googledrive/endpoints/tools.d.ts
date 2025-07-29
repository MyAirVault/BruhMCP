/**
 * Google Drive MCP Tool Definitions
 * Defines all available tools for the Google Drive MCP server
 */
/**
 * Get all available tools for Google Drive MCP
 * @returns {{ tools: { name: string, description: string, inputSchema: { type: string, properties?: Record<string, { type?: string, description?: string, enum?: string[], pattern?: string, minLength?: number, maxLength?: number, minimum?: number, maximum?: number, multipleOf?: number, minItems?: number, maxItems?: number, items?: Record<string, string | number | boolean> }>, required?: string[] } }[] }} Tools definition object
 */
export function getTools(): {
    tools: {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties?: Record<string, {
                type?: string;
                description?: string;
                enum?: string[];
                pattern?: string;
                minLength?: number;
                maxLength?: number;
                minimum?: number;
                maximum?: number;
                multipleOf?: number;
                minItems?: number;
                maxItems?: number;
                items?: Record<string, string | number | boolean>;
            }>;
            required?: string[];
        };
    }[];
};
/**
 * Get all tool names
 * @returns {string[]} Array of tool names
 */
export function getToolNames(): string[];
/**
 * Validate if a tool name exists
 * @param {string} toolName - Name of the tool to validate
 * @returns {boolean} True if tool exists
 */
export function isValidTool(toolName: string): boolean;
//# sourceMappingURL=tools.d.ts.map