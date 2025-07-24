/**
 * Figma MCP JSON-RPC protocol handler using official SDK
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { FigmaService } from '../services/figmaService.js';
import yaml from 'js-yaml';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 */

export class FigmaMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} apiKey
	 */
	constructor(serviceConfig, apiKey) {
		this.serviceConfig = serviceConfig;
		this.apiKey = apiKey;
		this.server = new McpServer({
			name: `${serviceConfig.displayName} MCP Server`,
			version: serviceConfig.version,
		});
		// Store transports by session
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;
		
		// Initialize Figma service
		this.figmaService = new FigmaService({
			figmaApiKey: apiKey,
			figmaOAuthToken: '', // Could be enhanced to support OAuth
			useOAuth: false
		});
		
		this.setupTools();
	}

	/**
	 * Setup MCP tools using direct Zod schemas
	 */
	setupTools() {
		// Tool 1: get_figma_data
		this.server.tool(
			"get_figma_data",
			"When the nodeId cannot be obtained, obtain the layout information about the entire Figma file",
			{
				fileKey: z
					.string()
					.describe("The key of the Figma file to fetch, often found in a provided URL like figma.com/(file|design)/<fileKey>/..."),
				nodeId: z
					.string()
					.optional()
					.describe("The ID of the node to fetch, often found as URL parameter node-id=<nodeId>, always use if provided"),
				depth: z
					.number()
					.optional()
					.describe("OPTIONAL. Do NOT use unless explicitly requested by the user. Controls how many levels deep to traverse the node tree")
			},
			async ({ fileKey, nodeId, depth }) => {
				console.log(`🔧 Tool call: get_figma_data for ${this.serviceConfig.name}`);
				console.log(`📁 FileKey: ${fileKey}, NodeId: ${nodeId || 'none'}, Depth: ${depth || 'all'}`);

				try {
					let file;
					if (nodeId) {
						file = await this.figmaService.getNode(fileKey, nodeId, depth);
					} else {
						file = await this.figmaService.getFile(fileKey, depth);
					}

					console.log(`✅ Successfully fetched file: ${file.name}`);
					const { nodes, globalVars, ...metadata } = file;

					const result = {
						metadata,
						nodes,
						globalVars,
					};

					console.log('📤 Generating YAML result from file');
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					console.log('📨 Sending result to client');
					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (/** @type {any} */ error) {
					const message = error instanceof Error ? error.message : JSON.stringify(error);
					console.error(`❌ Error fetching file ${fileKey}:`, message);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error fetching file: ${message}` }],
					};
				}
			}
		);

		// Tool 2: download_figma_images
		this.server.tool(
			"download_figma_images", 
			"Download SVG and PNG images used in a Figma file based on the IDs of image or icon nodes",
			{
				fileKey: z.string().describe("The key of the Figma file containing the node"),
				nodes: z
					.object({
						nodeId: z.string().describe("The ID of the Figma image node to fetch, formatted as 1234:5678"),
						imageRef: z.string().optional().describe("If a node has an imageRef fill, you must include this variable. Leave blank when downloading Vector SVG images."),
						fileName: z.string().describe("The local name for saving the fetched file")
					})
					.array()
					.describe("The nodes to fetch as images"),
				pngScale: z
					.number()
					.positive()
					.optional()
					.default(2)
					.describe("Export scale for PNG images. Optional, defaults to 2 if not specified. Affects PNG images only."),
				localPath: z
					.string()
					.describe("The absolute path to the directory where images are stored in the project. If the directory does not exist, it will be created."),
				svgOptions: z
					.object({
						outlineText: z.boolean().optional().default(true).describe("Whether to outline text in SVG exports. Default is true."),
						includeId: z.boolean().optional().default(false).describe("Whether to include IDs in SVG exports. Default is false."),
						simplifyStroke: z.boolean().optional().default(true).describe("Whether to simplify strokes in SVG exports. Default is true.")
					})
					.optional()
					.default({})
					.describe("Options for SVG export")
			},
			async ({ fileKey, nodes, pngScale, localPath, svgOptions }) => {
				console.log(`🔧 Tool call: download_figma_images for ${this.serviceConfig.name}`);
				console.log(`📁 FileKey: ${fileKey}, Nodes: ${nodes.length}, Path: ${localPath}`);

				try {
					const imageFills = nodes.filter(({ imageRef }) => !!imageRef).map(node => ({
						nodeId: node.nodeId,
						fileName: node.fileName,
						imageRef: /** @type {string} */ (node.imageRef)
					}));
					const fillDownloads = this.figmaService.getImageFills(fileKey, imageFills, localPath);
					
					const renderRequests = nodes
						.filter(({ imageRef }) => !imageRef)
						.map(({ nodeId, fileName }) => ({
							nodeId,
							fileName,
							fileType: fileName.endsWith('.svg') ? 'svg' : 'png',
						}));

					const renderDownloads = this.figmaService.getImages(
						fileKey,
						renderRequests,
						localPath,
						pngScale,
						svgOptions,
					);

					const downloads = await Promise.all([fillDownloads, renderDownloads]).then(([f, r]) => [
						...f,
						...r,
					]);

					// If any download fails, return false
					const saveSuccess = !downloads.find((success) => !success);
					return {
						content: [
							{
								type: 'text',
								text: saveSuccess
									? `Success, ${downloads.length} images downloaded: ${downloads.join(', ')}`
									: 'Failed',
							},
						],
					};
				} catch (/** @type {any} */ error) {
					console.error(`❌ Error downloading images from file ${fileKey}:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error downloading images: ${error}` }],
					};
				}
			}
		);
	}


	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {any} req - Express request object
	 * @param {any} res - Express response object
	 * @param {any} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = req.headers['mcp-session-id'];
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);
			
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (newSessionId) => {
						console.log(`✅ Figma MCP session initialized: ${newSessionId}`);
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});
				
				// Setup cleanup on transport close
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						console.log(`🧹 Cleaned up transport for session: ${transport.sessionId}`);
					}
				};
				
				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
			} else {
				// Invalid request - no session ID and not an initialize request
				console.log(`❌ Invalid request: No session ID and not initialize request`);
				res.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided and not an initialize request',
					},
					id: message?.id || null,
				});
				return;
			}

			// Handle the request using the appropriate transport
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
			
		} catch (/** @type {any} */ error) {
			console.error('❌ StreamableHTTP processing error:', error);

			// Return proper JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: message?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error.message },
				},
			});
		}
	}
}

