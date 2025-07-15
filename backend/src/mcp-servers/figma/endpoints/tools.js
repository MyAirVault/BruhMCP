/**
 * MCP Tools endpoint for Figma service
 * Defines available tools that can be called via MCP protocol
 */

/**
 * Get list of available tools for Figma service
 * @returns {Object} Tools definition response
 */
export function getTools() {
	return {
		tools: [
			{
				name: 'get_figma_file_optimized',
				description: 'Get Figma file with LLM-optimized response size and content. Automatically manages token limits and provides structured data perfect for code generation and analysis.',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL) or full Figma URL',
						},
						optimization: {
							type: 'string',
							enum: ['overview', 'components', 'styles', 'layout', 'full'],
							default: 'overview',
							description: 'Optimization level: overview (file structure), components (component details), styles (design tokens), layout (positioning), full (complete data)',
						},
						maxTokens: {
							type: 'number',
							default: 20000,
							description: 'Maximum token limit for response (default: 20,000)',
						},
						includeFields: {
							type: 'array',
							items: { type: 'string' },
							description: 'Specific fields to include (id, name, type, properties, children, styles)',
						},
						excludeFields: {
							type: 'array',
							items: { type: 'string' },
							description: 'Specific fields to exclude (geometry, effects, fills, transforms)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_design_summary',
				description: 'Get a high-level summary of a Figma design system or file, perfect for understanding the overall structure and components before diving into details.',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL) or full Figma URL',
						},
						focus: {
							type: 'string',
							enum: ['components', 'design_tokens', 'layout_patterns', 'content_audit'],
							description: 'Focus area for the summary analysis',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_components_optimized',
				description: 'Get component data optimized for LLM analysis and code generation. Includes structured component specifications, variants, and properties in a token-efficient format.',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL) or full Figma URL',
						},
						componentNames: {
							type: 'array',
							items: { type: 'string' },
							description: 'Specific component names to retrieve (if empty, gets all components)',
						},
						includeVariants: {
							type: 'boolean',
							default: true,
							description: 'Include component variants and properties',
						},
						includeUsage: {
							type: 'boolean',
							default: false,
							description: 'Include component usage examples and instances',
						},
						maxTokens: {
							type: 'number',
							default: 15000,
							description: 'Maximum token limit for response',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_file_chunk',
				description: 'Get a specific chunk of a large Figma file using a continuation token or resource URI. Used for accessing large files in manageable pieces.',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						chunkType: {
							type: 'string',
							enum: ['pages', 'components', 'styles', 'nodes'],
							description: 'Type of chunk to retrieve',
						},
						chunkId: {
							type: 'string',
							description: 'Specific chunk ID or continuation token',
						},
						resourceUri: {
							type: 'string',
							pattern: '^figma://file/[^/]+/(overview|components|styles|nodes)/.*',
							description: 'MCP resource URI for specific file chunk',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_file',
				description: 'Get details about a Figma file including document structure and metadata. Supports full Figma URLs and will automatically handle large files by falling back to metadata and components. If URL contains node-id parameter, will fetch that specific node instead.',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL) or full Figma URL. If URL contains node-id parameter, will fetch that specific node.',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_components',
				description: 'Get published components from a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_styles',
				description: 'Get published styles from a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_comments',
				description: 'Get comments from a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_nodes',
				description: 'Get specific nodes from a Figma file by their IDs. Automatically chunks large requests to avoid API limits.',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						nodeIds: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Array of node IDs to retrieve',
						},
					},
					required: ['fileKey', 'nodeIds'],
				},
			},
			{
				name: 'get_figma_file_meta',
				description: 'Get metadata about a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_file_versions',
				description: 'Get version history of a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_images',
				description: 'Render images from nodes in a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						nodeIds: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Array of node IDs to render as images',
						},
						format: {
							type: 'string',
							enum: ['png', 'jpg', 'svg', 'pdf'],
							description: 'Image format (default: png)',
						},
						scale: {
							type: 'number',
							description: 'Scale factor for the image (default: 1)',
						},
					},
					required: ['fileKey', 'nodeIds'],
				},
			},
			{
				name: 'get_figma_image_fills',
				description: 'Get download links for all images in image fills in a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_user',
				description: 'Get current user information',
				inputSchema: {
					type: 'object',
					properties: {},
					required: [],
				},
			},
			{
				name: 'get_figma_team_projects',
				description: 'Get projects for a team',
				inputSchema: {
					type: 'object',
					properties: {
						teamId: {
							type: 'string',
							description: 'The team ID',
						},
					},
					required: ['teamId'],
				},
			},
			{
				name: 'get_figma_project_files',
				description: 'Get files in a project',
				inputSchema: {
					type: 'object',
					properties: {
						projectId: {
							type: 'string',
							description: 'The project ID',
						},
					},
					required: ['projectId'],
				},
			},
			{
				name: 'post_figma_comment',
				description: 'Add a comment to a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						message: {
							type: 'string',
							description: 'The comment message',
						},
						position: {
							type: 'object',
							properties: {
								x: {
									type: 'number',
									description: 'X coordinate for the comment',
								},
								y: {
									type: 'number',
									description: 'Y coordinate for the comment',
								},
							},
							description: 'Optional position for the comment',
						},
					},
					required: ['fileKey', 'message'],
				},
			},
			{
				name: 'delete_figma_comment',
				description: 'Delete a comment from a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						commentId: {
							type: 'string',
							description: 'The comment ID to delete',
						},
					},
					required: ['fileKey', 'commentId'],
				},
			},
			{
				name: 'get_figma_team_components',
				description: 'Get components from a team',
				inputSchema: {
					type: 'object',
					properties: {
						teamId: {
							type: 'string',
							description: 'The team ID',
						},
					},
					required: ['teamId'],
				},
			},
			{
				name: 'get_figma_component_sets',
				description: 'Get component sets from a Figma file',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_component_info',
				description: 'Get information about a specific component',
				inputSchema: {
					type: 'object',
					properties: {
						componentKey: {
							type: 'string',
							description: 'The component key',
						},
					},
					required: ['componentKey'],
				},
			},
			{
				name: 'get_figma_component_set_info',
				description: 'Get information about a specific component set',
				inputSchema: {
					type: 'object',
					properties: {
						componentSetKey: {
							type: 'string',
							description: 'The component set key',
						},
					},
					required: ['componentSetKey'],
				},
			},
			{
				name: 'get_figma_local_variables',
				description: 'Get local variables from a Figma file (Enterprise only)',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'get_figma_published_variables',
				description: 'Get published variables from a Figma file (Enterprise only)',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
					},
					required: ['fileKey'],
				},
			},
			{
				name: 'post_figma_variables',
				description: 'Create variables in a Figma file (Enterprise only)',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						variableData: {
							type: 'object',
							description: 'Variable data to create',
						},
					},
					required: ['fileKey', 'variableData'],
				},
			},
			{
				name: 'put_figma_variables',
				description: 'Update variables in a Figma file (Enterprise only)',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						variableData: {
							type: 'object',
							description: 'Variable data to update',
						},
					},
					required: ['fileKey', 'variableData'],
				},
			},
			{
				name: 'delete_figma_variables',
				description: 'Delete variables from a Figma file (Enterprise only)',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						variableData: {
							type: 'object',
							description: 'Variable data specifying what to delete',
						},
					},
					required: ['fileKey', 'variableData'],
				},
			},
			{
				name: 'post_figma_webhook',
				description: 'Create a webhook (Webhooks V2 API)',
				inputSchema: {
					type: 'object',
					properties: {
						webhookData: {
							type: 'object',
							description: 'Webhook configuration data',
						},
					},
					required: ['webhookData'],
				},
			},
			{
				name: 'get_figma_webhooks',
				description: 'Get webhooks (Webhooks V2 API)',
				inputSchema: {
					type: 'object',
					properties: {
						teamId: {
							type: 'string',
							description: 'Optional team ID to filter webhooks',
						},
					},
					required: [],
				},
			},
			{
				name: 'put_figma_webhook',
				description: 'Update a webhook (Webhooks V2 API)',
				inputSchema: {
					type: 'object',
					properties: {
						webhookId: {
							type: 'string',
							description: 'The webhook ID to update',
						},
						webhookData: {
							type: 'object',
							description: 'Updated webhook configuration data',
						},
					},
					required: ['webhookId', 'webhookData'],
				},
			},
			{
				name: 'delete_figma_webhook',
				description: 'Delete a webhook (Webhooks V2 API)',
				inputSchema: {
					type: 'object',
					properties: {
						webhookId: {
							type: 'string',
							description: 'The webhook ID to delete',
						},
					},
					required: ['webhookId'],
				},
			},
			{
				name: 'get_figma_file_with_version',
				description: 'Get a Figma file at a specific version',
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The Figma file key (found in Figma URL)',
						},
						versionId: {
							type: 'string',
							description: 'The version ID to retrieve',
						},
					},
					required: ['fileKey', 'versionId'],
				},
			},
		],
	};
}
