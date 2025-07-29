/**
 * Slack MCP Tools Definition
 * Defines all available tools for Slack API integration
 */

/**
 * Get available Slack tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
function getTools() {
  return {
    tools: [
      {
        name: 'send_message',
        description: 'Send a message to a Slack channel or user',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID or user ID to send message to'
            },
            text: {
              type: 'string',
              description: 'Message text content'
            },
            thread_ts: {
              type: 'string',
              description: 'Timestamp of parent message to reply in thread (optional)'
            },
            reply_broadcast: {
              type: 'boolean',
              description: 'Whether to broadcast thread reply to channel',
              default: false
            }
          },
          required: ['channel', 'text']
        }
      },
      {
        name: 'get_messages',
        description: 'Get messages from a Slack channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID to get messages from'
            },
            count: {
              type: 'number',
              description: 'Number of messages to return',
              minimum: 1,
              maximum: 1000,
              default: 100
            },
            latest: {
              type: 'string',
              description: 'Latest message timestamp to include (optional)'
            },
            oldest: {
              type: 'string',
              description: 'Oldest message timestamp to include (optional)'
            },
            inclusive: {
              type: 'boolean',
              description: 'Include messages with latest and oldest timestamps',
              default: false
            }
          },
          required: ['channel']
        }
      },
      {
        name: 'get_thread_messages',
        description: 'Get messages from a Slack thread',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID where the thread is located'
            },
            ts: {
              type: 'string',
              description: 'Timestamp of the parent message'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of messages to return',
              minimum: 1,
              maximum: 1000,
              default: 200
            },
            cursor: {
              type: 'string',
              description: 'Cursor for pagination (optional)'
            }
          },
          required: ['channel', 'ts']
        }
      },
      {
        name: 'delete_message',
        description: 'Delete a Slack message',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID where the message is located'
            },
            ts: {
              type: 'string',
              description: 'Timestamp of the message to delete'
            }
          },
          required: ['channel', 'ts']
        }
      },
      {
        name: 'update_message',
        description: 'Update a Slack message',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID where the message is located'
            },
            ts: {
              type: 'string',
              description: 'Timestamp of the message to update'
            },
            text: {
              type: 'string',
              description: 'New message text content'
            }
          },
          required: ['channel', 'ts', 'text']
        }
      },
      {
        name: 'list_channels',
        description: 'List Slack channels',
        inputSchema: {
          type: 'object',
          properties: {
            types: {
              type: 'string',
              description: 'Channel types to include (comma separated)',
              default: 'public_channel,private_channel'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of channels to return',
              minimum: 1,
              maximum: 1000,
              default: 100
            },
            cursor: {
              type: 'string',
              description: 'Cursor for pagination (optional)'
            }
          },
          required: []
        }
      },
      {
        name: 'get_channel_info',
        description: 'Get information about a Slack channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID to get information about'
            }
          },
          required: ['channel']
        }
      },
      {
        name: 'join_channel',
        description: 'Join a Slack channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID or name to join'
            }
          },
          required: ['channel']
        }
      },
      {
        name: 'leave_channel',
        description: 'Leave a Slack channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID to leave'
            }
          },
          required: ['channel']
        }
      },
      {
        name: 'get_user_info',
        description: 'Get information about a Slack user',
        inputSchema: {
          type: 'object',
          properties: {
            user: {
              type: 'string',
              description: 'User ID to get information about'
            }
          },
          required: ['user']
        }
      },
      {
        name: 'list_users',
        description: 'List Slack users in the workspace',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of users to return',
              minimum: 1,
              maximum: 1000,
              default: 100
            },
            cursor: {
              type: 'string',
              description: 'Cursor for pagination (optional)'
            }
          },
          required: []
        }
      },
      {
        name: 'add_reaction',
        description: 'Add a reaction to a Slack message',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID where the message is located'
            },
            timestamp: {
              type: 'string',
              description: 'Timestamp of the message to react to'
            },
            name: {
              type: 'string',
              description: 'Emoji name (without colons)'
            }
          },
          required: ['channel', 'timestamp', 'name']
        }
      },
      {
        name: 'remove_reaction',
        description: 'Remove a reaction from a Slack message',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID where the message is located'
            },
            timestamp: {
              type: 'string',
              description: 'Timestamp of the message to remove reaction from'
            },
            name: {
              type: 'string',
              description: 'Emoji name (without colons)'
            }
          },
          required: ['channel', 'timestamp', 'name']
        }
      },
      {
        name: 'get_reactions',
        description: 'Get reactions for a Slack message',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel ID where the message is located'
            },
            timestamp: {
              type: 'string',
              description: 'Timestamp of the message to get reactions for'
            }
          },
          required: ['channel', 'timestamp']
        }
      },
      {
        name: 'upload_file',
        description: 'Upload a file to Slack',
        inputSchema: {
          type: 'object',
          properties: {
            channels: {
              type: 'string',
              description: 'Channel ID to upload file to'
            },
            content: {
              type: 'string',
              description: 'File content as a string'
            },
            filename: {
              type: 'string',
              description: 'Name of the file'
            },
            title: {
              type: 'string',
              description: 'Title for the file (optional)'
            },
            filetype: {
              type: 'string',
              description: 'File type (e.g., "text", "javascript") (optional)'
            },
            initial_comment: {
              type: 'string',
              description: 'Initial comment to add with the file (optional)'
            }
          },
          required: ['channels', 'content', 'filename']
        }
      },
      {
        name: 'get_file_info',
        description: 'Get information about a Slack file',
        inputSchema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              description: 'File ID to get information about'
            }
          },
          required: ['file']
        }
      },
      {
        name: 'create_reminder',
        description: 'Create a reminder in Slack',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Reminder text'
            },
            time: {
              type: 'string',
              description: 'When to remind (e.g., "in 20 minutes", "tomorrow at 9am")'
            },
            user: {
              type: 'string',
              description: 'User ID to remind (optional, defaults to current user)'
            }
          },
          required: ['text', 'time']
        }
      },
      {
        name: 'get_team_info',
        description: 'Get information about the Slack workspace/team',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'test_auth',
        description: 'Test Slack authentication and get user/team info',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    ]
  };
}

module.exports = {
  getTools
};