/**
 * MCP Call endpoint for Figma service
 * Handles tool execution requests via MCP protocol
 */

import { 
	getFigmaFile, 
	getFigmaComponents, 
	getFigmaStyles, 
	getFigmaComments,
	getFigmaNodes,
	getFigmaImageFills,
	getFigmaUser,
	getFigmaTeamProjects,
	getFigmaProjectFiles,
	postFigmaComment,
	getFigmaLocalVariables
} from '../api/figma-api.js';

import { 
	createSuccessResponse, 
	createErrorResponse
} from '../utils/mcp-responses.js';


/**
 * Execute a tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {any} args - Tool arguments
 * @param {string} apiKey - User's Figma API key
 */
export async function executeToolCall(toolName, args, apiKey) {
	try {
		switch (toolName) {
			case 'get_figma_file':
				const fileData = await getFigmaFile(args.file_key, apiKey);
				return createSuccessResponse(fileData);

			case 'list_components':
				const components = await getFigmaComponents(args.file_key, apiKey);
				return createSuccessResponse(components);

			case 'list_styles':
				const styles = await getFigmaStyles(args.file_key, apiKey);
				return createSuccessResponse(styles);

			case 'list_comments':
				const comments = await getFigmaComments(args.file_key, apiKey);
				return createSuccessResponse(comments);

			case 'get_file_nodes':
				if (args.node_id) {
					const nodeData = await getFigmaNodes(args.file_key, apiKey, [args.node_id]);
					return createSuccessResponse(nodeData);
				} else {
					const allNodes = await getFigmaFile(args.file_key, apiKey);
					return createSuccessResponse(allNodes);
				}

			case 'get_image_fills':
				const imageFills = await getFigmaImageFills(args.file_key, apiKey);
				return createSuccessResponse(imageFills);

			case 'get_current_user':
				const user = await getFigmaUser(apiKey);
				return createSuccessResponse(user);

			case 'list_projects':
				const projects = await getFigmaTeamProjects(args.team_id, apiKey);
				return createSuccessResponse(projects);

			case 'list_files':
				const projectFiles = await getFigmaProjectFiles(args.project_id, apiKey);
				return createSuccessResponse(projectFiles);

			case 'post_comment':
				const newComment = await postFigmaComment(args.file_key, apiKey, args.message, args.client_meta);
				return createSuccessResponse(newComment);

			case 'list_variables':
				const variables = await getFigmaLocalVariables(args.file_key, apiKey);
				return createSuccessResponse(variables);

			default:
				throw new Error(`Unknown tool: ${toolName}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Error executing ${toolName}: ${errorMessage}`);
	}
}
