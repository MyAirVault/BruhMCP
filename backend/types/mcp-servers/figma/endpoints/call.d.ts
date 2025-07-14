/**
 * Execute a tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {{ fileKey: string }} args - Tool arguments
 * @param {string} apiKey - User's Figma API key
 */
export function executeToolCall(toolName: string, args: {
    fileKey: string;
}, apiKey: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
//# sourceMappingURL=call.d.ts.map