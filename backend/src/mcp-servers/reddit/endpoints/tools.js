/**
 * Reddit MCP Tools Definition
 * Defines all available tools for Reddit API integration
 */

/**
 * Get available Reddit tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
export function getTools() {
  return {
    tools: [
      {
        name: 'get_subreddit_info',
        description: 'Get detailed information about a specific subreddit',
        inputSchema: {
          type: 'object',
          properties: {
            subreddit: {
              type: 'string',
              description: 'Subreddit name (without r/ prefix)'
            }
          },
          required: ['subreddit']
        }
      },
      {
        name: 'get_subreddit_posts',
        description: 'Get posts from a subreddit with various sorting options',
        inputSchema: {
          type: 'object',
          properties: {
            subreddit: {
              type: 'string',
              description: 'Subreddit name (without r/ prefix)'
            },
            sort: {
              type: 'string',
              enum: ['hot', 'new', 'rising', 'top'],
              description: 'Sort order for posts',
              default: 'hot'
            },
            time: {
              type: 'string',
              enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
              description: 'Time period for top posts (only applies to top sort)',
              default: 'day'
            },
            limit: {
              type: 'number',
              description: 'Number of posts to retrieve (max 100)',
              minimum: 1,
              maximum: 100,
              default: 25
            }
          },
          required: ['subreddit']
        }
      },
      {
        name: 'get_post_by_id',
        description: 'Get detailed information about a specific post',
        inputSchema: {
          type: 'object',
          properties: {
            postId: {
              type: 'string',
              description: 'Reddit post ID (e.g., abc123)'
            }
          },
          required: ['postId']
        }
      },
      {
        name: 'get_post_comments',
        description: 'Get comments for a specific post',
        inputSchema: {
          type: 'object',
          properties: {
            postId: {
              type: 'string',
              description: 'Reddit post ID'
            },
            sort: {
              type: 'string',
              enum: ['confidence', 'top', 'new', 'controversial', 'old', 'random', 'qa'],
              description: 'Comment sorting method',
              default: 'confidence'
            },
            limit: {
              type: 'number',
              description: 'Number of comments to retrieve (max 500)',
              minimum: 1,
              maximum: 500,
              default: 50
            }
          },
          required: ['postId']
        }
      },
      {
        name: 'submit_post',
        description: 'Submit a new post to a subreddit',
        inputSchema: {
          type: 'object',
          properties: {
            subreddit: {
              type: 'string',
              description: 'Subreddit name (without r/ prefix)'
            },
            title: {
              type: 'string',
              description: 'Post title'
            },
            text: {
              type: 'string',
              description: 'Post text content (for text posts)',
              default: ''
            },
            url: {
              type: 'string',
              description: 'URL for link posts',
              default: ''
            },
            kind: {
              type: 'string',
              enum: ['self', 'link'],
              description: 'Post type: self (text) or link',
              default: 'self'
            },
            nsfw: {
              type: 'boolean',
              description: 'Mark post as NSFW',
              default: false
            },
            spoiler: {
              type: 'boolean',
              description: 'Mark post as spoiler',
              default: false
            }
          },
          required: ['subreddit', 'title']
        }
      },
      {
        name: 'submit_comment',
        description: 'Submit a comment to a post or reply to another comment',
        inputSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'string',
              description: 'Parent post ID (t3_postid) or comment ID (t1_commentid)'
            },
            text: {
              type: 'string',
              description: 'Comment text content'
            }
          },
          required: ['parent', 'text']
        }
      },
      {
        name: 'vote_on_post',
        description: 'Vote on a post (upvote, downvote, or remove vote)',
        inputSchema: {
          type: 'object',
          properties: {
            postId: {
              type: 'string',
              description: 'Reddit post ID'
            },
            direction: {
              type: 'number',
              enum: [1, 0, -1],
              description: 'Vote direction: 1 (upvote), 0 (no vote), -1 (downvote)'
            }
          },
          required: ['postId', 'direction']
        }
      },
      {
        name: 'vote_on_comment',
        description: 'Vote on a comment (upvote, downvote, or remove vote)',
        inputSchema: {
          type: 'object',
          properties: {
            commentId: {
              type: 'string',
              description: 'Reddit comment ID'
            },
            direction: {
              type: 'number',
              enum: [1, 0, -1],
              description: 'Vote direction: 1 (upvote), 0 (no vote), -1 (downvote)'
            }
          },
          required: ['commentId', 'direction']
        }
      },
      {
        name: 'get_user_info',
        description: 'Get information about a Reddit user',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Reddit username (without u/ prefix)'
            }
          },
          required: ['username']
        }
      },
      {
        name: 'get_user_posts',
        description: 'Get posts submitted by a specific user',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Reddit username (without u/ prefix)'
            },
            sort: {
              type: 'string',
              enum: ['hot', 'new', 'top'],
              description: 'Sort order for posts',
              default: 'new'
            },
            time: {
              type: 'string',
              enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
              description: 'Time period for top posts',
              default: 'all'
            },
            limit: {
              type: 'number',
              description: 'Number of posts to retrieve (max 100)',
              minimum: 1,
              maximum: 100,
              default: 25
            }
          },
          required: ['username']
        }
      },
      {
        name: 'get_user_comments',
        description: 'Get comments made by a specific user',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Reddit username (without u/ prefix)'
            },
            sort: {
              type: 'string',
              enum: ['hot', 'new', 'top'],
              description: 'Sort order for comments',
              default: 'new'
            },
            time: {
              type: 'string',
              enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
              description: 'Time period for top comments',
              default: 'all'
            },
            limit: {
              type: 'number',
              description: 'Number of comments to retrieve (max 100)',
              minimum: 1,
              maximum: 100,
              default: 25
            }
          },
          required: ['username']
        }
      },
      {
        name: 'get_inbox_messages',
        description: 'Get messages from user inbox',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              enum: ['all', 'unread', 'messages', 'comments', 'selfreply', 'mentions'],
              description: 'Filter type for inbox messages',
              default: 'all'
            },
            limit: {
              type: 'number',
              description: 'Number of messages to retrieve (max 100)',
              minimum: 1,
              maximum: 100,
              default: 25
            }
          },
          required: []
        }
      },
      {
        name: 'send_message',
        description: 'Send a private message to another user',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient username (without u/ prefix)'
            },
            subject: {
              type: 'string',
              description: 'Message subject'
            },
            text: {
              type: 'string',
              description: 'Message text content'
            }
          },
          required: ['to', 'subject', 'text']
        }
      },
      {
        name: 'mark_as_read',
        description: 'Mark inbox messages as read',
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
        name: 'search_subreddits',
        description: 'Search for subreddits by name or description',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for subreddits'
            },
            limit: {
              type: 'number',
              description: 'Number of subreddits to return (max 100)',
              minimum: 1,
              maximum: 100,
              default: 25
            }
          },
          required: ['query']
        }
      },
      {
        name: 'search_posts',
        description: 'Search for posts across Reddit or within a specific subreddit',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for posts'
            },
            subreddit: {
              type: 'string',
              description: 'Limit search to specific subreddit (optional)',
              default: ''
            },
            sort: {
              type: 'string',
              enum: ['relevance', 'hot', 'top', 'new', 'comments'],
              description: 'Sort order for search results',
              default: 'relevance'
            },
            time: {
              type: 'string',
              enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
              description: 'Time period for search',
              default: 'all'
            },
            limit: {
              type: 'number',
              description: 'Number of posts to return (max 100)',
              minimum: 1,
              maximum: 100,
              default: 25
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_subscriptions',
        description: 'Get list of subreddits the user is subscribed to',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of subscriptions to return (max 100)',
              minimum: 1,
              maximum: 100,
              default: 100
            }
          },
          required: []
        }
      },
      {
        name: 'subscribe_to_subreddit',
        description: 'Subscribe to a subreddit',
        inputSchema: {
          type: 'object',
          properties: {
            subreddit: {
              type: 'string',
              description: 'Subreddit name (without r/ prefix)'
            }
          },
          required: ['subreddit']
        }
      },
      {
        name: 'unsubscribe_from_subreddit',
        description: 'Unsubscribe from a subreddit',
        inputSchema: {
          type: 'object',
          properties: {
            subreddit: {
              type: 'string',
              description: 'Subreddit name (without r/ prefix)'
            }
          },
          required: ['subreddit']
        }
      }
    ]
  };
}