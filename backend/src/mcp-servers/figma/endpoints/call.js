/**
 * MCP Call endpoint for Figma service
 * Handles tool execution requests via MCP protocol
 */

import { 
	getFigmaFile, 
	getFigmaNodes
} from '../api/index.js';

import { 
	createSuccessResponse, 
	createErrorResponse,
	createFigmaOptimizedResponse
} from '../utils/mcpResponses.js';


/**
 * Execute a tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {any} args - Tool arguments
 * @param {string} apiKey - User's Figma API key
 */
export async function executeToolCall(toolName, args, apiKey) {
	try {
		switch (toolName) {
			case 'get_figma_data':
				if (args.nodeId) {
					const nodeData = await getFigmaNodes(args.fileKey, apiKey, [args.nodeId]);
					return createFigmaOptimizedResponse(nodeData, {
						outputFormat: 'yaml',
						depth: args.depth,
						maxNodes: 1000,
						fileKey: args.fileKey,
						nodeId: args.nodeId
					});
				} else {
					const fileData = await getFigmaFile(args.fileKey, apiKey);
					return createFigmaOptimizedResponse(fileData, {
						outputFormat: 'yaml',
						depth: args.depth,
						maxNodes: 1000,
						fileKey: args.fileKey
					});
				}

			case 'download_figma_images':
				// Simple response for image download requests
				return createSuccessResponse('Image download functionality not implemented in this version', {
					outputFormat: 'yaml'
				});

			default:
				return createErrorResponse(`Unknown tool: ${toolName}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(`Tool execution error for ${toolName}:`, errorMessage);
		return createErrorResponse(`Failed to execute ${toolName}: ${errorMessage}`);
	}
}