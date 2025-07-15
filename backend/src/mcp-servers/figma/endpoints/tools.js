/**
 * MCP Tools endpoint for Figma service - Copied from Figma-Context-MCP
 * Defines available tools that can be called via MCP protocol
 */

/**
 * Get list of available tools for Figma service (matching Figma-Context-MCP)
 * @returns {Object} Tools definition response
 */
export function getTools() {
	return {
		tools: [
			{
				name: 'get_figma_data',
				description: 'When the nodeId cannot be obtained, obtain the layout information about the entire Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The key of the Figma file to fetch, often found in a provided URL like figma.com/(file|design)/<fileKey>/...'
						},
						nodeId: {
							type: 'string',
							description: 'The ID of the node to fetch, often found as URL parameter node-id=<nodeId>, always use if provided'
						},
						depth: {
							type: 'number',
							description: 'OPTIONAL. Do NOT use unless explicitly requested by the user. Controls how many levels deep to traverse the node tree'
						}
					},
					required: ['fileKey']
				}
			},
			{
				name: 'download_figma_images',
				description: 'Download SVG and PNG images used in a Figma file based on the IDs of image or icon nodes',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The key of the Figma file containing the node'
						},
						nodes: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									nodeId: {
										type: 'string',
										description: 'The ID of the Figma image node to fetch, formatted as 1234:5678'
									},
									imageRef: {
										type: 'string',
										description: 'If a node has an imageRef fill, you must include this variable. Leave blank when downloading Vector SVG images.'
									},
									fileName: {
										type: 'string',
										description: 'The local name for saving the fetched file'
									}
								},
								required: ['nodeId', 'fileName']
							},
							description: 'The nodes to fetch as images'
						},
						pngScale: {
							type: 'number',
							description: 'Export scale for PNG images. Optional, defaults to 2 if not specified. Affects PNG images only.'
						},
						localPath: {
							type: 'string',
							description: 'The absolute path to the directory where images are stored in the project. If the directory does not exist, it will be created.'
						},
						svgOptions: {
							type: 'object',
							properties: {
								outlineText: {
									type: 'boolean',
									description: 'Whether to outline text in SVG exports. Default is true.'
								},
								includeId: {
									type: 'boolean',
									description: 'Whether to include IDs in SVG exports. Default is false.'
								},
								simplifyStroke: {
									type: 'boolean',
									description: 'Whether to simplify strokes in SVG exports. Default is true.'
								}
							},
							description: 'Options for SVG export'
						}
					},
					required: ['fileKey', 'nodes', 'localPath']
				}
			}
		],
	};
}
