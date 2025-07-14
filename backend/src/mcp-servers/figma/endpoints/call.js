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
	getFigmaFileMeta,
	getFigmaFileVersions,
	getFigmaImages,
	getFigmaImageFills,
	getFigmaUser,
	getFigmaTeamProjects,
	getFigmaProjectFiles,
	postFigmaComment,
	deleteFigmaComment,
	getFigmaTeamComponents,
	getFigmaComponentSets,
	getFigmaComponentInfo,
	getFigmaComponentSetInfo,
	getFigmaLocalVariables,
	getFigmaPublishedVariables,
	postFigmaVariables,
	putFigmaVariables,
	deleteFigmaVariables,
	postFigmaWebhook,
	getFigmaWebhooks,
	putFigmaWebhook,
	deleteFigmaWebhook,
	getFigmaFileWithVersion
} from '../api/figma-api.js';

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

			case 'get_figma_nodes':
				const nodes = await getFigmaNodes(args.fileKey, apiKey, args.nodeIds);
				return {
					content: [
						{
							type: 'text',
							text: `Nodes in file:\n\n${JSON.stringify(nodes, null, 2)}`,
						},
					],
				};

			case 'get_figma_file_meta':
				const fileMeta = await getFigmaFileMeta(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `File metadata:\n\n${JSON.stringify(fileMeta, null, 2)}`,
						},
					],
				};

			case 'get_figma_file_versions':
				const versions = await getFigmaFileVersions(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `File versions:\n\n${JSON.stringify(versions, null, 2)}`,
						},
					],
				};

			case 'get_figma_images':
				const images = await getFigmaImages(args.fileKey, apiKey, args.nodeIds, args.format, args.scale);
				return {
					content: [
						{
							type: 'text',
							text: `Rendered images:\n\n${JSON.stringify(images, null, 2)}`,
						},
					],
				};

			case 'get_figma_image_fills':
				const imageFills = await getFigmaImageFills(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Image fills:\n\n${JSON.stringify(imageFills, null, 2)}`,
						},
					],
				};

			case 'get_figma_user':
				const user = await getFigmaUser(apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `User information:\n\n${JSON.stringify(user, null, 2)}`,
						},
					],
				};

			case 'get_figma_team_projects':
				const projects = await getFigmaTeamProjects(args.teamId, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Team projects:\n\n${JSON.stringify(projects, null, 2)}`,
						},
					],
				};

			case 'get_figma_project_files':
				const projectFiles = await getFigmaProjectFiles(args.projectId, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Project files:\n\n${JSON.stringify(projectFiles, null, 2)}`,
						},
					],
				};

			case 'post_figma_comment':
				const newComment = await postFigmaComment(args.fileKey, apiKey, args.message, args.position);
				return {
					content: [
						{
							type: 'text',
							text: `Comment posted:\n\n${JSON.stringify(newComment, null, 2)}`,
						},
					],
				};

			case 'delete_figma_comment':
				const deletedComment = await deleteFigmaComment(args.fileKey, apiKey, args.commentId);
				return {
					content: [
						{
							type: 'text',
							text: `Comment deleted:\n\n${JSON.stringify(deletedComment, null, 2)}`,
						},
					],
				};

			case 'get_figma_team_components':
				const teamComponents = await getFigmaTeamComponents(args.teamId, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Team components:\n\n${JSON.stringify(teamComponents, null, 2)}`,
						},
					],
				};

			case 'get_figma_component_sets':
				const componentSets = await getFigmaComponentSets(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Component sets:\n\n${JSON.stringify(componentSets, null, 2)}`,
						},
					],
				};

			case 'get_figma_component_info':
				const componentInfo = await getFigmaComponentInfo(args.componentKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Component information:\n\n${JSON.stringify(componentInfo, null, 2)}`,
						},
					],
				};

			case 'get_figma_component_set_info':
				const componentSetInfo = await getFigmaComponentSetInfo(args.componentSetKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Component set information:\n\n${JSON.stringify(componentSetInfo, null, 2)}`,
						},
					],
				};

			case 'get_figma_local_variables':
				const localVariables = await getFigmaLocalVariables(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Local variables:\n\n${JSON.stringify(localVariables, null, 2)}`,
						},
					],
				};

			case 'get_figma_published_variables':
				const publishedVariables = await getFigmaPublishedVariables(args.fileKey, apiKey);
				return {
					content: [
						{
							type: 'text',
							text: `Published variables:\n\n${JSON.stringify(publishedVariables, null, 2)}`,
						},
					],
				};

			case 'post_figma_variables':
				const createdVariables = await postFigmaVariables(args.fileKey, apiKey, args.variableData);
				return {
					content: [
						{
							type: 'text',
							text: `Variables created:\n\n${JSON.stringify(createdVariables, null, 2)}`,
						},
					],
				};

			case 'put_figma_variables':
				const updatedVariables = await putFigmaVariables(args.fileKey, apiKey, args.variableData);
				return {
					content: [
						{
							type: 'text',
							text: `Variables updated:\n\n${JSON.stringify(updatedVariables, null, 2)}`,
						},
					],
				};

			case 'delete_figma_variables':
				const deletedVariables = await deleteFigmaVariables(args.fileKey, apiKey, args.variableData);
				return {
					content: [
						{
							type: 'text',
							text: `Variables deleted:\n\n${JSON.stringify(deletedVariables, null, 2)}`,
						},
					],
				};

			case 'post_figma_webhook':
				const createdWebhook = await postFigmaWebhook(apiKey, args.webhookData);
				return {
					content: [
						{
							type: 'text',
							text: `Webhook created:\n\n${JSON.stringify(createdWebhook, null, 2)}`,
						},
					],
				};

			case 'get_figma_webhooks':
				const webhooks = await getFigmaWebhooks(apiKey, args.teamId);
				return {
					content: [
						{
							type: 'text',
							text: `Webhooks:\n\n${JSON.stringify(webhooks, null, 2)}`,
						},
					],
				};

			case 'put_figma_webhook':
				const updatedWebhook = await putFigmaWebhook(apiKey, args.webhookId, args.webhookData);
				return {
					content: [
						{
							type: 'text',
							text: `Webhook updated:\n\n${JSON.stringify(updatedWebhook, null, 2)}`,
						},
					],
				};

			case 'delete_figma_webhook':
				const deletedWebhook = await deleteFigmaWebhook(apiKey, args.webhookId);
				return {
					content: [
						{
							type: 'text',
							text: `Webhook deleted:\n\n${JSON.stringify(deletedWebhook, null, 2)}`,
						},
					],
				};

			case 'get_figma_file_with_version':
				const fileWithVersion = await getFigmaFileWithVersion(args.fileKey, apiKey, args.versionId);
				return {
					content: [
						{
							type: 'text',
							text: `File at version ${args.versionId}:\n\n${JSON.stringify(fileWithVersion, null, 2)}`,
						},
					],
				};

			default:
				throw new Error(`Unknown tool: ${toolName}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Error executing ${toolName}: ${errorMessage}`);
	}
}
