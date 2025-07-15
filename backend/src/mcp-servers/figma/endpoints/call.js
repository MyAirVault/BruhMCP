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

// Import LLM optimization services
import { optimizeFigmaFile } from '../services/response-optimizer.js';
import { estimateTokenCount, exceedsTokenLimit } from '../services/token-manager.js';
import { 
	createSuccessResponse, 
	createErrorResponse, 
	createOversizedResponse, 
	createOverviewResponse,
	createFigmaResourceUri,
	parseFigmaResourceUri
} from '../utils/mcp-responses.js';

/**
 * Safe Figma file fetcher with automatic fallback for token limit errors
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<Object>} File data or fallback data
 */
async function safeGetFigmaFile(fileKey, apiKey) {
	try {
		return await getFigmaFile(fileKey, apiKey);
	} catch (error) {
		if (error.message.includes('exceeds maximum allowed tokens')) {
			console.warn('Figma file too large, falling back to metadata and components');
			
			const fallbackResult = {
				error: 'Full file too large, returning available data',
				name: 'Large Figma File (Partial Data)'
			};
			
			// Try to get metadata
			try {
				fallbackResult.meta = await getFigmaFileMeta(fileKey, apiKey);
			} catch (metaError) {
				console.warn('Failed to get file metadata:', metaError.message);
			}
			
			// Try to get components
			try {
				fallbackResult.components = await getFigmaComponents(fileKey, apiKey);
			} catch (componentError) {
				console.warn('Failed to get components:', componentError.message);
			}
			
			return fallbackResult;
		}
		
		throw error;
	}
}

/**
 * Extract node ID from Figma URL if provided
 * @param {string} input - Either a fileKey or full Figma URL
 * @returns {{fileKey: string, nodeId: string|null}} Parsed file key and node ID
 */
function parseFigmaInput(input) {
	const nodeIdMatch = input.match(/node-id=([^&]+)/);
	const fileKeyMatch = input.match(/figma\.com\/design\/([^/]+)/) || input.match(/figma\.com\/file\/([^/]+)/);
	
	if (fileKeyMatch) {
		return {
			fileKey: fileKeyMatch[1],
			nodeId: nodeIdMatch ? nodeIdMatch[1] : null
		};
	}
	
	// Assume it's just a file key
	return {
		fileKey: input,
		nodeId: null
	};
}

/**
 * Safe Figma nodes fetcher with chunking for large node lists
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs
 * @param {number} chunkSize - Size of chunks for large requests
 * @returns {Promise<Object>} Nodes data
 */
async function safeGetFigmaNodes(fileKey, apiKey, nodeIds, chunkSize = 50) {
	if (nodeIds.length <= chunkSize) {
		return await getFigmaNodes(fileKey, apiKey, nodeIds);
	}
	
	// Chunk large node ID lists
	const chunks = [];
	for (let i = 0; i < nodeIds.length; i += chunkSize) {
		chunks.push(nodeIds.slice(i, i + chunkSize));
	}
	
	const results = [];
	for (const chunk of chunks) {
		try {
			const result = await getFigmaNodes(fileKey, apiKey, chunk);
			results.push(result);
		} catch (error) {
			console.warn('Failed to fetch node chunk:', error.message);
			results.push({ error: error.message, nodeIds: chunk });
		}
	}
	
	return {
		nodes: results,
		chunked: true,
		totalChunks: chunks.length
	};
}

/**
 * Execute a tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {any} args - Tool arguments
 * @param {string} apiKey - User's Figma API key
 */
export async function executeToolCall(toolName, args, apiKey) {
	try {
		switch (toolName) {
			case 'get_figma_file_optimized':
				const parsed = parseFigmaInput(args.fileKey);
				const optimization = args.optimization || 'overview';
				const maxTokens = args.maxTokens || 20000;
				
				// Get raw file data
				const rawData = await safeGetFigmaFile(parsed.fileKey, apiKey);
				
				// Check if raw data is too large
				if (exceedsTokenLimit(rawData, maxTokens)) {
					const optimizedData = optimizeFigmaFile(rawData, optimization, { maxTokens });
					return createOverviewResponse(optimizedData, optimizedData.availableDetails);
				}
				
				// If it fits, optimize it anyway for better LLM consumption
				const optimizedData = optimizeFigmaFile(rawData, optimization, { maxTokens });
				return createOverviewResponse(optimizedData, optimizedData.availableDetails);

			case 'get_figma_design_summary':
				const summaryParsed = parseFigmaInput(args.fileKey);
				const summaryData = await safeGetFigmaFile(summaryParsed.fileKey, apiKey);
				
				// Always use overview optimization for summaries
				const summaryOptimized = optimizeFigmaFile(summaryData, 'overview', { maxTokens: 15000 });
				
				let summaryText = `Design System Analysis for ${summaryOptimized.meta?.name || 'Unknown File'}:`;
				if (summaryOptimized.summary) {
					summaryText += `\n\nType: ${summaryOptimized.summary.type}`;
					summaryText += `\nPages: ${summaryOptimized.summary.pageCount}`;
					summaryText += `\nComponents: ${summaryOptimized.summary.componentCount}`;
					summaryText += `\nStyles: ${summaryOptimized.summary.styleCount}`;
				}
				
				return createSuccessResponse(summaryOptimized, {
					summary: summaryText,
					tokenCount: summaryOptimized._meta?.tokenCount,
					hasMore: summaryOptimized._meta?.hasMore
				});

			case 'get_figma_components_optimized':
				const compParsed = parseFigmaInput(args.fileKey);
				const maxCompTokens = args.maxTokens || 15000;
				
				// Get components data
				const componentsData = await getFigmaComponents(compParsed.fileKey, apiKey);
				
				// Check if too large
				if (exceedsTokenLimit(componentsData, maxCompTokens)) {
					const optimizedComps = optimizeFigmaFile(
						{ components: componentsData }, 
						'components', 
						{ maxTokens: maxCompTokens }
					);
					return createSuccessResponse(optimizedComps.components, {
						summary: `Found ${Object.keys(componentsData).length} components, showing optimized view`,
						tokenCount: optimizedComps._meta?.tokenCount,
						hasMore: optimizedComps._meta?.hasMore
					});
				}
				
				return createSuccessResponse(componentsData, {
					summary: `Found ${Object.keys(componentsData).length} components`,
					tokenCount: estimateTokenCount(componentsData)
				});

			case 'get_figma_file_chunk':
				const chunkParsed = parseFigmaInput(args.fileKey);
				
				// Handle resource URI if provided
				if (args.resourceUri) {
					const uriParsed = parseFigmaResourceUri(args.resourceUri);
					if (!uriParsed) {
						return createErrorResponse('Invalid resource URI format', 'INVALID_URI');
					}
					
					// Route to appropriate handler based on URI type
					switch (uriParsed.type) {
						case 'components':
							const uriComps = await getFigmaComponents(uriParsed.fileKey, apiKey);
							return createSuccessResponse(uriComps, {
								summary: `Components chunk for ${uriParsed.fileKey}`,
								resourceUri: args.resourceUri
							});
						case 'styles':
							const uriStyles = await getFigmaStyles(uriParsed.fileKey, apiKey);
							return createSuccessResponse(uriStyles, {
								summary: `Styles chunk for ${uriParsed.fileKey}`,
								resourceUri: args.resourceUri
							});
						default:
							return createErrorResponse(`Unsupported resource type: ${uriParsed.type}`, 'UNSUPPORTED_TYPE');
					}
				}
				
				// Handle chunk type
				switch (args.chunkType) {
					case 'components':
						const chunkComps = await getFigmaComponents(chunkParsed.fileKey, apiKey);
						return createSuccessResponse(chunkComps, {
							summary: `Components chunk`,
							resourceUri: createFigmaResourceUri(chunkParsed.fileKey, 'components')
						});
					case 'styles':
						const chunkStyles = await getFigmaStyles(chunkParsed.fileKey, apiKey);
						return createSuccessResponse(chunkStyles, {
							summary: `Styles chunk`,
							resourceUri: createFigmaResourceUri(chunkParsed.fileKey, 'styles')
						});
					default:
						return createErrorResponse(`Unsupported chunk type: ${args.chunkType}`, 'UNSUPPORTED_CHUNK_TYPE');
				}

			case 'get_figma_file':
				// Parse input to check for URL with node ID
				const fileParsed = parseFigmaInput(args.fileKey);
				
				// If URL contains node ID, fetch that specific node instead
				if (fileParsed.nodeId) {
					const nodeData = await safeGetFigmaNodes(fileParsed.fileKey, apiKey, [fileParsed.nodeId]);
					return createSuccessResponse(nodeData, {
						summary: `Figma Node (${fileParsed.nodeId})`,
						tokenCount: estimateTokenCount(nodeData)
					});
				}
				
				// Otherwise fetch full file with fallback
				const fileData = await safeGetFigmaFile(fileParsed.fileKey, apiKey);
				
				// Check if response is too large for LLM consumption
				if (exceedsTokenLimit(fileData, 25000)) {
					return createOversizedResponse(
						estimateTokenCount(fileData),
						25000,
						[
							{ name: 'get_figma_file_optimized', description: 'with optimization="overview"' },
							{ name: 'get_figma_components', description: 'for component data only' },
							{ name: 'get_figma_design_summary', description: 'for high-level overview' }
						]
					);
				}
				
				const documentText = fileData.document 
					? `Document Structure:\n${JSON.stringify(fileData.document, null, 2)}`
					: fileData.error || 'Document structure not available';
				
				return createSuccessResponse(fileData, {
					summary: `Figma File: ${fileData.name}`,
					tokenCount: estimateTokenCount(fileData)
				});

			case 'get_figma_components':
				// Parse input to handle URLs
				const componentsParsed = parseFigmaInput(args.fileKey);
				const components = await getFigmaComponents(componentsParsed.fileKey, apiKey);
				
				// Check if response is too large for LLM consumption
				if (exceedsTokenLimit(components, 20000)) {
					return createOversizedResponse(
						estimateTokenCount(components),
						20000,
						[
							{ name: 'get_figma_components_optimized', description: 'for LLM-optimized component data' },
							{ name: 'get_figma_file_optimized', description: 'with optimization="components"' }
						]
					);
				}
				
				return createSuccessResponse(components, {
					summary: `Found ${Object.keys(components).length} components`,
					tokenCount: estimateTokenCount(components)
				});

			case 'get_figma_styles':
				const stylesParsed = parseFigmaInput(args.fileKey);
				const styles = await getFigmaStyles(stylesParsed.fileKey, apiKey);
				
				// Check if response is too large for LLM consumption
				if (exceedsTokenLimit(styles, 20000)) {
					return createOversizedResponse(
						estimateTokenCount(styles),
						20000,
						[
							{ name: 'get_figma_file_optimized', description: 'with optimization="styles"' },
							{ name: 'get_figma_design_summary', description: 'with focus="design_tokens"' }
						]
					);
				}
				
				return createSuccessResponse(styles, {
					summary: `Found ${Object.keys(styles).length} styles`,
					tokenCount: estimateTokenCount(styles)
				});

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
				const nodes = await safeGetFigmaNodes(args.fileKey, apiKey, args.nodeIds);
				return {
					content: [
						{
							type: 'text',
							text: `Nodes in file:\n\n${JSON.stringify(nodes, null, 2)}`,
						},
					],
				};

			case 'get_figma_file_meta':
				// Parse input to handle URLs
				const metaParsed = parseFigmaInput(args.fileKey);
				const fileMeta = await getFigmaFileMeta(metaParsed.fileKey, apiKey);
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
