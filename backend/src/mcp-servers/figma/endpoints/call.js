/**
 * MCP Call endpoint for Figma service
 * Handles tool execution requests via MCP protocol
 */

import { getFigmaFile, getFigmaComponents, getFigmaStyles, getFigmaComments } from '../api/figma-api.js';

/**
 * Execute a tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {{ fileKey: string }} args - Tool arguments
 * @param {string} apiKey - User's Figma API key
 */
export async function executeToolCall(toolName, args, apiKey) {
	try {
		switch (toolName) {
			case 'get_figma_file':
				const fileData = await getFigmaFile(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Figma File: ${fileData.name}\n\nDocument Structure:\n${JSON.stringify(fileData.document, null, 2)}`,
						},
					],
				};

			case 'get_figma_components':
				const components = await getFigmaComponents(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Components in file:\n\n${JSON.stringify(components, null, 2)}`,
						},
					],
				};

			case 'get_figma_styles':
				const styles = await getFigmaStyles(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Styles in file:\n\n${JSON.stringify(styles, null, 2)}`,
						},
					],
				};

			case 'get_figma_comments':
				const comments = await getFigmaComments(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Comments in file:\n\n${JSON.stringify(comments, null, 2)}`,
						},
					],
				};

			default:
				throw new Error(`Unknown tool: ${toolName}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			content: [
				{
					type: 'text',
					text: `Error executing ${toolName}: ${errorMessage}`,
				},
			],
			isError: true,
		};
	}
}
