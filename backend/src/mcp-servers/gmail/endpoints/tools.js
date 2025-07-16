/**
 * Gmail MCP Tools Definition
 * Defines all available tools for Gmail API integration
 */

/**
 * Get available Gmail tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
export function getTools() {
  return {
    tools: [
      {
        name: 'send_email',
        description: 'Send an email message through Gmail',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address'
            },
            subject: {
              type: 'string',
              description: 'Email subject line'
            },
            body: {
              type: 'string',
              description: 'Email body content (supports HTML)'
            },
            cc: {
              type: 'string',
              description: 'CC email addresses (comma separated)',
              default: ''
            },
            bcc: {
              type: 'string',
              description: 'BCC email addresses (comma separated)',
              default: ''
            },
            format: {
              type: 'string',
              enum: ['text', 'html'],
              description: 'Email format (text or html)',
              default: 'text'
            }
          },
          required: ['to', 'subject', 'body']
        }
      },
      {
        name: 'fetch_emails',
        description: 'Fetch emails from Gmail inbox or specific folder',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Gmail search query (supports Gmail search operators)',
              default: ''
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of emails to return',
              minimum: 1,
              maximum: 500,
              default: 10
            },
            labelIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Label IDs to filter by (optional)',
              default: []
            },
            includeSpamTrash: {
              type: 'boolean',
              description: 'Include spam and trash in results',
              default: false
            }
          },
          required: []
        }
      },
      {
        name: 'fetch_message_by_id',
        description: 'Fetch a specific email message by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'Gmail message ID to fetch'
            },
            format: {
              type: 'string',
              enum: ['minimal', 'full', 'raw', 'metadata'],
              description: 'Message format to return',
              default: 'full'
            }
          },
          required: ['messageId']
        }
      },
      {
        name: 'reply_to_email',
        description: 'Reply to an existing email thread',
        inputSchema: {
          type: 'object',
          properties: {
            threadId: {
              type: 'string',
              description: 'Thread ID to reply to'
            },
            body: {
              type: 'string',
              description: 'Reply message body'
            },
            subject: {
              type: 'string',
              description: 'Reply subject (optional, will use Re: prefix)',
              default: ''
            },
            format: {
              type: 'string',
              enum: ['text', 'html'],
              description: 'Reply format (text or html)',
              default: 'text'
            }
          },
          required: ['threadId', 'body']
        }
      },
      {
        name: 'create_draft',
        description: 'Create an email draft',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address'
            },
            subject: {
              type: 'string',
              description: 'Email subject line'
            },
            body: {
              type: 'string',
              description: 'Email body content'
            },
            cc: {
              type: 'string',
              description: 'CC email addresses (comma separated)',
              default: ''
            },
            bcc: {
              type: 'string',
              description: 'BCC email addresses (comma separated)',
              default: ''
            },
            format: {
              type: 'string',
              enum: ['text', 'html'],
              description: 'Email format (text or html)',
              default: 'text'
            }
          },
          required: ['to', 'subject', 'body']
        }
      },
      {
        name: 'send_draft',
        description: 'Send an existing draft email',
        inputSchema: {
          type: 'object',
          properties: {
            draftId: {
              type: 'string',
              description: 'Draft ID to send'
            }
          },
          required: ['draftId']
        }
      },
      {
        name: 'list_drafts',
        description: 'List all email drafts',
        inputSchema: {
          type: 'object',
          properties: {
            maxResults: {
              type: 'number',
              description: 'Maximum number of drafts to return',
              minimum: 1,
              maximum: 500,
              default: 100
            },
            query: {
              type: 'string',
              description: 'Search query for drafts',
              default: ''
            }
          },
          required: []
        }
      },
      {
        name: 'delete_message',
        description: 'Permanently delete a message',
        inputSchema: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'Message ID to delete permanently'
            }
          },
          required: ['messageId']
        }
      },
      {
        name: 'move_to_trash',
        description: 'Move a message to trash',
        inputSchema: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'Message ID to move to trash'
            }
          },
          required: ['messageId']
        }
      },
      {
        name: 'list_labels',
        description: 'List all Gmail labels',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'create_label',
        description: 'Create a new Gmail label',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Label name'
            },
            messageListVisibility: {
              type: 'string',
              enum: ['show', 'hide'],
              description: 'Whether to show label in message list',
              default: 'show'
            },
            labelListVisibility: {
              type: 'string',
              enum: ['labelShow', 'labelHide'],
              description: 'Whether to show label in label list',
              default: 'labelShow'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'modify_labels',
        description: 'Add or remove labels from a message',
        inputSchema: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'Message ID to modify'
            },
            addLabelIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Label IDs to add to the message',
              default: []
            },
            removeLabelIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Label IDs to remove from the message',
              default: []
            }
          },
          required: ['messageId']
        }
      },
      {
        name: 'search_emails',
        description: 'Advanced email search with Gmail operators',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Gmail search query using search operators (from:, to:, subject:, has:attachment, etc.)'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return',
              minimum: 1,
              maximum: 500,
              default: 50
            },
            newerThan: {
              type: 'string',
              description: 'Only return emails newer than this date (YYYY-MM-DD format)',
              default: ''
            },
            olderThan: {
              type: 'string',
              description: 'Only return emails older than this date (YYYY-MM-DD format)',
              default: ''
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_thread',
        description: 'Get an entire email thread/conversation',
        inputSchema: {
          type: 'object',
          properties: {
            threadId: {
              type: 'string',
              description: 'Thread ID to retrieve'
            },
            format: {
              type: 'string',
              enum: ['minimal', 'full', 'metadata'],
              description: 'Format for messages in thread',
              default: 'full'
            }
          },
          required: ['threadId']
        }
      },
      {
        name: 'mark_as_read',
        description: 'Mark message(s) as read',
        inputSchema: {
          type: 'object',
          properties: {
            messageIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of message IDs to mark as read'
            }
          },
          required: ['messageIds']
        }
      },
      {
        name: 'mark_as_unread',
        description: 'Mark message(s) as unread',
        inputSchema: {
          type: 'object',
          properties: {
            messageIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of message IDs to mark as unread'
            }
          },
          required: ['messageIds']
        }
      },
      {
        name: 'download_attachment',
        description: 'Download an attachment from a Gmail message',
        inputSchema: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'Gmail message ID containing the attachment'
            },
            attachmentId: {
              type: 'string',
              description: 'Attachment ID to download'
            }
          },
          required: ['messageId', 'attachmentId']
        }
      },
      {
        name: 'send_email_with_attachments',
        description: 'Send an email with file attachments',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address'
            },
            subject: {
              type: 'string',
              description: 'Email subject line'
            },
            body: {
              type: 'string',
              description: 'Email body content (supports HTML)'
            },
            cc: {
              type: 'string',
              description: 'CC email addresses (comma separated)',
              default: ''
            },
            bcc: {
              type: 'string',
              description: 'BCC email addresses (comma separated)',
              default: ''
            },
            format: {
              type: 'string',
              enum: ['text', 'html'],
              description: 'Email format (text or html)',
              default: 'text'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: {
                    type: 'string',
                    description: 'Filename of the attachment'
                  },
                  mimeType: {
                    type: 'string',
                    description: 'MIME type of the attachment (e.g., application/pdf, image/jpeg)'
                  },
                  data: {
                    type: 'string',
                    description: 'Base64 encoded attachment data'
                  }
                },
                required: ['filename', 'mimeType', 'data']
              },
              description: 'Array of attachment objects',
              default: []
            }
          },
          required: ['to', 'subject', 'body']
        }
      },
      {
        name: 'delete_label',
        description: 'Delete a Gmail label',
        inputSchema: {
          type: 'object',
          properties: {
            labelId: {
              type: 'string',
              description: 'Label ID to delete'
            }
          },
          required: ['labelId']
        }
      }
    ]
  };
}