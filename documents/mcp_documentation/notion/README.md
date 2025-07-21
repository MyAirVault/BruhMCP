# Notion MCP Service Documentation

## Overview

The Notion MCP (Model Context Protocol) service provides comprehensive integration with Notion workspaces through the Notion API. This service enables users to search, create, read, update, and delete pages, databases, and blocks through a standardized MCP interface.

## Service Configuration

- **Service Name**: `notion`
- **Display Name**: `Notion`
- **Port**: 49391
- **Authentication**: OAuth 2.0 Bearer Token
- **API Version**: 2022-06-28
- **Base URL**: `https://api.notion.com/v1`

## Available Tools

The Notion MCP service provides **13 comprehensive tools** for workspace management and content operations.

### Search and Discovery Tools

#### 1. `search`
Search for pages and databases in Notion workspace.

**Parameters:**
- `query` (string, required): Search query (1-1000 characters)
- `page_size` (number, optional): Number of results (1-100, default: 10)
- `start_cursor` (string, optional): Pagination cursor
- `sort` (object, optional): Sort configuration
  - `direction` (enum): 'ascending' | 'descending'
  - `timestamp` (enum): 'created_time' | 'last_edited_time'
- `filter` (object, optional): Filter configuration
  - `value` (enum): 'page' | 'database'
  - `property` (string): Filter property

**Example:**
```json
{
  "name": "search",
  "arguments": {
    "query": "project meeting notes",
    "page_size": 20,
    "sort": {
      "direction": "descending",
      "timestamp": "last_edited_time"
    },
    "filter": {
      "value": "page"
    }
  }
}
```

### Page Management Tools

#### 2. `get_page`
Get detailed information about a specific page.

**Parameters:**
- `page_id` (string, required): Page ID in UUID format

**Example:**
```json
{
  "name": "get_page",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### 3. `get_page_blocks`
Get blocks/content of a page with pagination support.

**Parameters:**
- `page_id` (string, required): Page ID in UUID format
- `start_cursor` (string, optional): Pagination cursor
- `page_size` (number, optional): Number of blocks (1-100, default: 100)

**Example:**
```json
{
  "name": "get_page_blocks",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000",
    "page_size": 50
  }
}
```

#### 4. `create_page`
Create a new page in workspace or database.

**Parameters:**
- `parent` (object, required): Parent configuration
  - `type` (enum): 'page_id' | 'database_id'
  - `page_id` (string, conditional): Parent page ID (if type is 'page_id')
  - `database_id` (string, conditional): Parent database ID (if type is 'database_id')
- `properties` (object, optional): Page properties
- `children` (array, optional): Page content blocks

**Example:**
```json
{
  "name": "create_page",
  "arguments": {
    "parent": {
      "type": "page_id",
      "page_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "properties": {
      "title": {
        "title": [
          {
            "text": {
              "content": "New Project Page"
            }
          }
        ]
      }
    },
    "children": [
      {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "This is the project overview."
              }
            }
          ]
        }
      }
    ]
  }
}
```

#### 5. `update_page`
Update page properties and archive status.

**Parameters:**
- `page_id` (string, required): Page ID to update
- `properties` (object, optional): Properties to update
- `archived` (boolean, optional): Archive status

**Example:**
```json
{
  "name": "update_page",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000",
    "properties": {
      "title": {
        "title": [
          {
            "text": {
              "content": "Updated Project Page"
            }
          }
        ]
      }
    },
    "archived": false
  }
}
```

### Database Management Tools

#### 6. `get_database`
Get database schema and metadata.

**Parameters:**
- `database_id` (string, required): Database ID in UUID format

**Example:**
```json
{
  "name": "get_database",
  "arguments": {
    "database_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### 7. `query_database`
Query database entries with filtering and sorting.

**Parameters:**
- `database_id` (string, required): Database ID to query
- `filter` (any, optional): Filter criteria (Notion filter format)
- `sorts` (array, optional): Sort criteria array
- `start_cursor` (string, optional): Pagination cursor
- `page_size` (number, optional): Number of results (1-100, default: 100)

**Example:**
```json
{
  "name": "query_database",
  "arguments": {
    "database_id": "550e8400-e29b-41d4-a716-446655440000",
    "filter": {
      "property": "Status",
      "select": {
        "equals": "In Progress"
      }
    },
    "sorts": [
      {
        "property": "Created",
        "direction": "descending"
      }
    ],
    "page_size": 25
  }
}
```

#### 8. `create_database`
Create a new database with schema definition.

**Parameters:**
- `parent` (object, required): Parent configuration
  - `type` (literal): Must be 'page_id'
  - `page_id` (string, required): Parent page ID
- `title` (array, required): Database title (rich text array)
- `properties` (object, required): Database properties schema

**Example:**
```json
{
  "name": "create_database",
  "arguments": {
    "parent": {
      "type": "page_id",
      "page_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "title": [
      {
        "type": "text",
        "text": {
          "content": "Project Tasks"
        }
      }
    ],
    "properties": {
      "Name": {
        "title": {}
      },
      "Status": {
        "select": {
          "options": [
            {
              "name": "To Do",
              "color": "red"
            },
            {
              "name": "In Progress",
              "color": "yellow"
            },
            {
              "name": "Done",
              "color": "green"
            }
          ]
        }
      },
      "Due Date": {
        "date": {}
      }
    }
  }
}
```

#### 9. `update_database`
Update database title and properties schema.

**Parameters:**
- `database_id` (string, required): Database ID to update
- `title` (array, optional): Database title (rich text array)
- `properties` (object, optional): Database properties schema

**Example:**
```json
{
  "name": "update_database",
  "arguments": {
    "database_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": [
      {
        "type": "text",
        "text": {
          "content": "Updated Project Tasks"
        }
      }
    ],
    "properties": {
      "Priority": {
        "select": {
          "options": [
            {
              "name": "High",
              "color": "red"
            },
            {
              "name": "Medium",
              "color": "yellow"
            },
            {
              "name": "Low",
              "color": "green"
            }
          ]
        }
      }
    }
  }
}
```

### Block Management Tools

#### 10. `append_blocks`
Append blocks to a page.

**Parameters:**
- `page_id` (string, required): Page ID to append blocks to
- `children` (array, required): Blocks to append (minimum 1 block)

**Example:**
```json
{
  "name": "append_blocks",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000",
    "children": [
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Project Overview"
              }
            }
          ]
        }
      },
      {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "This section contains the project details."
              }
            }
          ]
        }
      }
    ]
  }
}
```

#### 11. `delete_block`
Delete a specific block.

**Parameters:**
- `block_id` (string, required): Block ID to delete

**Example:**
```json
{
  "name": "delete_block",
  "arguments": {
    "block_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### User Management Tools

#### 12. `get_current_user`
Get current user information.

**Parameters:** None

**Example:**
```json
{
  "name": "get_current_user",
  "arguments": {}
}
```

#### 13. `list_users`
List all users in the workspace.

**Parameters:**
- `start_cursor` (string, optional): Pagination cursor
- `page_size` (number, optional): Number of users (1-100, default: 100)

**Example:**
```json
{
  "name": "list_users",
  "arguments": {
    "page_size": 50
  }
}
```

## Authentication

The Notion MCP service uses OAuth 2.0 authentication with the following flow:

1. **Instance Creation**: Each user gets a unique instance ID
2. **OAuth Authorization**: User authorizes the application with required scopes
3. **Token Management**: Bearer tokens are cached and automatically refreshed
4. **API Access**: All tools use the authenticated user's Bearer token

### Required Scopes
- Read access to workspace content
- Write access for content creation and updates
- User information access

## Session Management

The service implements advanced session management features:

- **Persistent Handler Sessions**: Each instance maintains a persistent handler
- **Token Refresh**: Automatic API key updates in existing sessions
- **Session Cleanup**: Automatic cleanup of expired sessions (30-minute timeout)
- **Multi-tenant Support**: Isolated sessions per instance

## Error Handling

The service includes comprehensive error handling for:
- **Authentication Errors**: Invalid tokens, expired credentials
- **Notion API Errors**: Rate limiting, permission errors, invalid requests
- **Network Errors**: Connection issues, timeouts
- **Validation Errors**: Invalid parameters, malformed requests

## Rate Limiting

The service implements automatic retry logic with exponential backoff for:
- Rate limit responses (HTTP 429)
- Server errors (HTTP 5xx)
- Network connectivity issues

## Security Features

- **OAuth 2.0 Compliance**: Secure token-based authentication
- **Input Validation**: Comprehensive parameter validation using Zod schemas
- **Input Sanitization**: All user inputs are sanitized before processing
- **Session Security**: Secure token management with automatic refresh
- **Multi-tenant Isolation**: Instance-based credential separation

## Usage Examples

### Basic Content Operations
```json
// Search for pages
{
  "name": "search",
  "arguments": {
    "query": "meeting notes",
    "page_size": 10
  }
}

// Get page content
{
  "name": "get_page",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}

// Create new page
{
  "name": "create_page",
  "arguments": {
    "parent": {
      "type": "page_id",
      "page_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "properties": {
      "title": {
        "title": [{"text": {"content": "New Meeting Notes"}}]
      }
    }
  }
}
```

### Database Operations
```json
// Query database
{
  "name": "query_database",
  "arguments": {
    "database_id": "550e8400-e29b-41d4-a716-446655440000",
    "filter": {
      "property": "Status",
      "select": {"equals": "Active"}
    },
    "sorts": [{"property": "Created", "direction": "descending"}]
  }
}

// Create database
{
  "name": "create_database",
  "arguments": {
    "parent": {
      "type": "page_id",
      "page_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "title": [{"text": {"content": "Task Database"}}],
    "properties": {
      "Name": {"title": {}},
      "Status": {"select": {"options": [{"name": "Active", "color": "green"}]}}
    }
  }
}
```

### Advanced Content Management
```json
// Append rich content blocks
{
  "name": "append_blocks",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000",
    "children": [
      {
        "object": "block",
        "type": "heading_1",
        "heading_1": {
          "rich_text": [{"text": {"content": "Project Status"}}]
        }
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{"text": {"content": "Task 1: Complete design mockups"}}]
        }
      }
    ]
  }
}
```

## Implementation Status

✅ **Current Implementation Strengths:**
- Complete OAuth 2.0 authentication flow
- Comprehensive tool coverage (13 tools)
- Advanced session management with token refresh
- Robust error handling and validation
- Multi-tenant architecture support
- Proper pagination and filtering support

⚠️ **Areas for Enhancement:**
- Missing bulk operations for efficiency
- No template management functionality
- Limited workspace management features
- No advanced search operators
- Missing collaboration tools

The Notion MCP implementation provides a solid, secure, and comprehensive interface for interacting with Notion workspaces through the MCP protocol.