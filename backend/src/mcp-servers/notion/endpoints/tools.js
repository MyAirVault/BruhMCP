/**
 * Notion MCP Tools Definition
 * Defines all available tools for Notion API integration
 */

/**
 * Get available Notion tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
function getTools() {
  return {
    tools: [
      {
        name: 'search',
        description: 'Search for pages and databases in Notion',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            page_size: {
              type: 'number',
              description: 'Number of results to return (1-100)',
              minimum: 1,
              maximum: 100,
              default: 10
            },
            start_cursor: {
              type: 'string',
              description: 'Pagination cursor'
            },
            sort: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  enum: ['ascending', 'descending'],
                  description: 'Sort direction'
                },
                timestamp: {
                  type: 'string',
                  enum: ['created_time', 'last_edited_time'],
                  description: 'Sort timestamp'
                }
              },
              description: 'Sort options'
            },
            filter: {
              type: 'object',
              properties: {
                value: {
                  type: 'string',
                  enum: ['page', 'database'],
                  description: 'Filter by type'
                },
                property: {
                  type: 'string',
                  description: 'Filter property'
                }
              },
              description: 'Filter options'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_page',
        description: 'Get a specific page by ID',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'Page ID'
            }
          },
          required: ['page_id']
        }
      },
      {
        name: 'get_page_blocks',
        description: 'Get blocks/content of a page',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'Page ID'
            },
            start_cursor: {
              type: 'string',
              description: 'Pagination cursor'
            },
            page_size: {
              type: 'number',
              description: 'Number of blocks to return',
              minimum: 1,
              maximum: 100,
              default: 100
            }
          },
          required: ['page_id']
        }
      },
      {
        name: 'create_page',
        description: 'Create a new page',
        inputSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['page_id', 'database_id'],
                  description: 'Parent type'
                },
                page_id: {
                  type: 'string',
                  description: 'Parent page ID'
                },
                database_id: {
                  type: 'string',
                  description: 'Parent database ID'
                }
              },
              description: 'Parent page or database'
            },
            properties: {
              type: 'object',
              description: 'Page properties'
            },
            children: {
              type: 'array',
              description: 'Page content blocks'
            }
          },
          required: ['parent']
        }
      },
      {
        name: 'update_page',
        description: 'Update page properties',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'Page ID'
            },
            properties: {
              type: 'object',
              description: 'Properties to update'
            },
            archived: {
              type: 'boolean',
              description: 'Archive status'
            }
          },
          required: ['page_id']
        }
      },
      {
        name: 'get_database',
        description: 'Get database information',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'Database ID'
            }
          },
          required: ['database_id']
        }
      },
      {
        name: 'query_database',
        description: 'Query database entries',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'Database ID'
            },
            filter: {
              type: 'object',
              description: 'Filter criteria'
            },
            sorts: {
              type: 'array',
              description: 'Sort criteria'
            },
            start_cursor: {
              type: 'string',
              description: 'Pagination cursor'
            },
            page_size: {
              type: 'number',
              description: 'Number of results',
              minimum: 1,
              maximum: 100,
              default: 100
            }
          },
          required: ['database_id']
        }
      },
      {
        name: 'create_database',
        description: 'Create a new database',
        inputSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['page_id'],
                  description: 'Parent type (must be page_id)'
                },
                page_id: {
                  type: 'string',
                  description: 'Parent page ID'
                }
              },
              description: 'Parent page'
            },
            title: {
              type: 'array',
              description: 'Database title'
            },
            properties: {
              type: 'object',
              description: 'Database properties schema'
            }
          },
          required: ['parent', 'title', 'properties']
        }
      },
      {
        name: 'update_database',
        description: 'Update database properties',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'Database ID'
            },
            title: {
              type: 'array',
              description: 'Database title'
            },
            properties: {
              type: 'object',
              description: 'Database properties schema'
            }
          },
          required: ['database_id']
        }
      },
      {
        name: 'append_blocks',
        description: 'Append blocks to a page',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'Page ID'
            },
            children: {
              type: 'array',
              description: 'Blocks to append'
            }
          },
          required: ['page_id', 'children']
        }
      },
      {
        name: 'delete_block',
        description: 'Delete a block',
        inputSchema: {
          type: 'object',
          properties: {
            block_id: {
              type: 'string',
              description: 'Block ID'
            }
          },
          required: ['block_id']
        }
      },
      {
        name: 'get_current_user',
        description: 'Get current user information',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'list_users',
        description: 'List all users',
        inputSchema: {
          type: 'object',
          properties: {
            start_cursor: {
              type: 'string',
              description: 'Pagination cursor'
            },
            page_size: {
              type: 'number',
              description: 'Number of users to return',
              minimum: 1,
              maximum: 100,
              default: 100
            }
          },
          required: []
        }
      }
    ]
  };
}