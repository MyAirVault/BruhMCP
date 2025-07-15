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
				name: 'get_figma_file',
				description: 'Retrieve the full document tree of a Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file to retrieve.'
						}
					},
					required: ['file_key']
				}
			},
			{
				name: 'list_components',
				description: 'List components in a specific Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file to retrieve components from.'
						}
					},
					required: ['file_key']
				}
			},
			{
				name: 'list_styles',
				description: 'List styles in a specific Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file to retrieve styles from.'
						}
					},
					required: ['file_key']
				}
			},
			{
				name: 'list_comments',
				description: 'List comments on a specific Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file to retrieve comments from.'
						}
					},
					required: ['file_key']
				}
			},
			{
				name: 'get_file_nodes',
				description: 'Retrieve specific nodes from a Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file.'
						},
						node_id: {
							type: 'string',
							description: 'The ID of the node to retrieve.'
						}
					},
					required: ['file_key']
				}
			},
			{
				name: 'get_image_fills',
				description: 'Get image fills from a Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file.'
						}
					},
					required: ['file_key']
				}
			},
			{
				name: 'get_current_user',
				description: 'Get current user information.',
				inputSchema: {
					type: 'object',
					properties: {},
					required: []
				}
			},
			{
				name: 'list_projects',
				description: 'List projects in a team.',
				inputSchema: {
					type: 'object',
					properties: {
						team_id: {
							type: 'string',
							description: 'The team ID.'
						}
					},
					required: ['team_id']
				}
			},
			{
				name: 'list_files',
				description: 'List files in a project.',
				inputSchema: {
					type: 'object',
					properties: {
						project_id: {
							type: 'string',
							description: 'The project ID.'
						}
					},
					required: ['project_id']
				}
			},
			{
				name: 'post_comment',
				description: 'Post a comment to a Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file.'
						},
						message: {
							type: 'string',
							description: 'The comment message.'
						},
						client_meta: {
							type: 'object',
							description: 'Additional client metadata.'
						}
					},
					required: ['file_key', 'message']
				}
			},
			{
				name: 'list_variables',
				description: 'List variables in a Figma file.',
				inputSchema: {
					type: 'object',
					properties: {
						file_key: {
							type: 'string',
							description: 'The key of the Figma file.'
						}
					},
					required: ['file_key']
				}
			},
		],
	};
}
