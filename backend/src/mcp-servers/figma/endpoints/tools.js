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
        description: 'Get details about a Figma file including document structure and metadata',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key (found in Figma URL)'
            }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'get_figma_components',
        description: 'Get published components from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key (found in Figma URL)'
            }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'get_figma_styles',
        description: 'Get published styles from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key (found in Figma URL)'
            }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'get_figma_comments',
        description: 'Get comments from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key (found in Figma URL)'
            }
          },
          required: ['fileKey']
        }
      }
    ]
  };
}