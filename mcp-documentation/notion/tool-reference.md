# Notion MCP Service - Tool Reference

## Tool Categories

### 🔍 Search & Discovery (1 tool)
- [`search`](#search) - Search pages and databases

### 📄 Page Management (4 tools)
- [`get_page`](#get_page) - Get page information
- [`get_page_blocks`](#get_page_blocks) - Get page content blocks
- [`create_page`](#create_page) - Create new pages
- [`update_page`](#update_page) - Update page properties

### 🗄️ Database Management (4 tools)
- [`get_database`](#get_database) - Get database schema
- [`query_database`](#query_database) - Query database entries
- [`create_database`](#create_database) - Create new databases
- [`update_database`](#update_database) - Update database schema

### 🧱 Block Management (2 tools)
- [`append_blocks`](#append_blocks) - Add blocks to pages
- [`delete_block`](#delete_block) - Delete blocks

### 👥 User Management (2 tools)
- [`get_current_user`](#get_current_user) - Get current user info
- [`list_users`](#list_users) - List workspace users

---

## Tool Details

### `search`
**Description**: Search for pages and databases in Notion workspace with filtering and sorting capabilities.

**Parameters**:
- `query` (string, required): Search query (1-1000 characters)
- `page_size` (number, optional): Number of results to return (1-100, default: 10)
- `start_cursor` (string, optional): Pagination cursor for retrieving more results
- `sort` (object, optional): Sort configuration
  - `direction` (enum): 'ascending' | 'descending' - Sort direction
  - `timestamp` (enum): 'created_time' | 'last_edited_time' - Sort by timestamp
- `filter` (object, optional): Filter configuration
  - `value` (enum): 'page' | 'database' - Filter by object type
  - `property` (string): Filter by property name

**Notion API**: `POST /v1/search`

**Response**: Array of pages and databases matching the search criteria

**Example**:
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

**Response Format**:
```json
{
  "results": [
    {
      "id": "page-uuid",
      "type": "page",
      "title": "Project Meeting Notes",
      "url": "https://notion.so/...",
      "created_time": "2024-01-15T10:00:00.000Z",
      "last_edited_time": "2024-01-15T14:30:00.000Z",
      "parent": {
        "type": "workspace",
        "workspace": true
      }
    }
  ],
  "has_more": false,
  "next_cursor": null
}
```

---

### `get_page`
**Description**: Retrieve detailed information about a specific page including properties and metadata.

**Parameters**:
- `page_id` (string, required): Page ID in UUID format (32 hex characters)

**Notion API**: `GET /v1/pages/{page_id}`

**Response**: Complete page object with properties and metadata

**Example**:
```json
{
  "name": "get_page",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response Format**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Project Overview",
  "url": "https://notion.so/...",
  "created_time": "2024-01-15T10:00:00.000Z",
  "last_edited_time": "2024-01-15T14:30:00.000Z",
  "created_by": {
    "id": "user-uuid",
    "name": "John Doe"
  },
  "last_edited_by": {
    "id": "user-uuid",
    "name": "John Doe"
  },
  "parent": {
    "type": "workspace",
    "workspace": true
  },
  "properties": {
    "title": {
      "title": [
        {
          "text": {
            "content": "Project Overview"
          }
        }
      ]
    }
  },
  "archived": false
}
```

---

### `get_page_blocks`
**Description**: Retrieve all blocks (content) from a page with pagination support.

**Parameters**:
- `page_id` (string, required): Page ID in UUID format
- `start_cursor` (string, optional): Pagination cursor
- `page_size` (number, optional): Number of blocks to return (1-100, default: 100)

**Notion API**: `GET /v1/blocks/{block_id}/children`

**Response**: Array of block objects representing the page content

**Example**:
```json
{
  "name": "get_page_blocks",
  "arguments": {
    "page_id": "550e8400-e29b-41d4-a716-446655440000",
    "page_size": 50
  }
}
```

**Response Format**:
```json
{
  "blocks": [
    {
      "id": "block-uuid",
      "type": "paragraph",
      "content": "This is a paragraph block with text content.",
      "created_time": "2024-01-15T10:00:00.000Z",
      "last_edited_time": "2024-01-15T14:30:00.000Z",
      "has_children": false
    },
    {
      "id": "block-uuid-2",
      "type": "heading_2",
      "content": "Section Header",
      "created_time": "2024-01-15T10:05:00.000Z",
      "last_edited_time": "2024-01-15T14:30:00.000Z",
      "has_children": false
    }
  ],
  "has_more": false,
  "next_cursor": null
}
```

---

### `create_page`
**Description**: Create a new page in a workspace, parent page, or database.

**Parameters**:
- `parent` (object, required): Parent configuration
  - `type` (enum): 'page_id' | 'database_id' - Parent type
  - `page_id` (string, conditional): Parent page ID (required if type is 'page_id')
  - `database_id` (string, conditional): Parent database ID (required if type is 'database_id')
- `properties` (object, optional): Page properties (title, custom properties)
- `children` (array, optional): Initial page content blocks

**Notion API**: `POST /v1/pages`

**Response**: Created page object with metadata

**Example**:
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

---

### `update_page`
**Description**: Update page properties and archive status.

**Parameters**:
- `page_id` (string, required): Page ID to update
- `properties` (object, optional): Properties to update
- `archived` (boolean, optional): Archive status (true to archive, false to unarchive)

**Notion API**: `PATCH /v1/pages/{page_id}`

**Response**: Updated page object

**Example**:
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

---

### `get_database`
**Description**: Retrieve database schema, title, and metadata.

**Parameters**:
- `database_id` (string, required): Database ID in UUID format

**Notion API**: `GET /v1/databases/{database_id}`

**Response**: Database object with schema and metadata

**Example**:
```json
{
  "name": "get_database",
  "arguments": {
    "database_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response Format**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Project Tasks",
  "url": "https://notion.so/...",
  "created_time": "2024-01-15T10:00:00.000Z",
  "last_edited_time": "2024-01-15T14:30:00.000Z",
  "properties": {
    "Name": {
      "id": "title",
      "type": "title"
    },
    "Status": {
      "id": "status",
      "type": "select",
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
  "archived": false
}
```

---

### `query_database`
**Description**: Query database entries with advanced filtering, sorting, and pagination.

**Parameters**:
- `database_id` (string, required): Database ID to query
- `filter` (any, optional): Filter criteria in Notion filter format
- `sorts` (array, optional): Array of sort criteria
- `start_cursor` (string, optional): Pagination cursor
- `page_size` (number, optional): Number of results to return (1-100, default: 100)

**Notion API**: `POST /v1/databases/{database_id}/query`

**Response**: Array of database page entries matching the criteria

**Example**:
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

---

### `create_database`
**Description**: Create a new database with custom properties schema.

**Parameters**:
- `parent` (object, required): Parent configuration
  - `type` (literal): Must be 'page_id'
  - `page_id` (string, required): Parent page ID
- `title` (array, required): Database title as rich text array
- `properties` (object, required): Database properties schema definition

**Notion API**: `POST /v1/databases`

**Response**: Created database object with schema

**Example**:
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

---

### `update_database`
**Description**: Update database title and properties schema.

**Parameters**:
- `database_id` (string, required): Database ID to update
- `title` (array, optional): Database title as rich text array
- `properties` (object, optional): Database properties schema updates

**Notion API**: `PATCH /v1/databases/{database_id}`

**Response**: Updated database object

**Example**:
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

---

### `append_blocks`
**Description**: Append content blocks to a page.

**Parameters**:
- `page_id` (string, required): Page ID to append blocks to
- `children` (array, required): Array of block objects to append (minimum 1 block)

**Notion API**: `PATCH /v1/blocks/{block_id}/children`

**Response**: Array of appended block objects

**Example**:
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
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "First bullet point"
              }
            }
          ]
        }
      }
    ]
  }
}
```

---

### `delete_block`
**Description**: Delete a specific block from a page.

**Parameters**:
- `block_id` (string, required): Block ID to delete (UUID format)

**Notion API**: `DELETE /v1/blocks/{block_id}`

**Response**: Deleted block object

**Example**:
```json
{
  "name": "delete_block",
  "arguments": {
    "block_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### `get_current_user`
**Description**: Get information about the currently authenticated user.

**Parameters**: None

**Notion API**: `GET /v1/users/me`

**Response**: Current user object with profile information

**Example**:
```json
{
  "name": "get_current_user",
  "arguments": {}
}
```

**Response Format**:
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "avatar_url": "https://...",
  "type": "person",
  "person": {
    "email": "john.doe@example.com"
  }
}
```

---

### `list_users`
**Description**: List all users in the workspace with pagination support.

**Parameters**:
- `start_cursor` (string, optional): Pagination cursor
- `page_size` (number, optional): Number of users to return (1-100, default: 100)

**Notion API**: `GET /v1/users`

**Response**: Array of user objects

**Example**:
```json
{
  "name": "list_users",
  "arguments": {
    "page_size": 50
  }
}
```

**Response Format**:
```json
{
  "users": [
    {
      "id": "user-uuid-1",
      "name": "John Doe",
      "avatar_url": "https://...",
      "type": "person",
      "person": {
        "email": "john.doe@example.com"
      }
    },
    {
      "id": "user-uuid-2",
      "name": "Jane Smith",
      "avatar_url": "https://...",
      "type": "person",
      "person": {
        "email": "jane.smith@example.com"
      }
    }
  ],
  "has_more": false,
  "next_cursor": null
}
```

---

## Common Block Types

### Text Blocks
- `paragraph` - Regular paragraph text
- `heading_1` - Large heading
- `heading_2` - Medium heading
- `heading_3` - Small heading
- `quote` - Quoted text
- `callout` - Callout with icon

### List Blocks
- `bulleted_list_item` - Bullet point item
- `numbered_list_item` - Numbered list item
- `to_do` - Checkbox item

### Media Blocks
- `image` - Image block
- `video` - Video block
- `file` - File attachment
- `embed` - Embedded content

### Database Blocks
- `child_database` - Inline database
- `child_page` - Child page reference

### Advanced Blocks
- `code` - Code block with syntax highlighting
- `equation` - Mathematical equation
- `divider` - Horizontal divider
- `table_of_contents` - Auto-generated TOC

## Common Property Types

### Database Properties
- `title` - Title field (required for all databases)
- `rich_text` - Rich text with formatting
- `number` - Numeric values
- `select` - Single selection from options
- `multi_select` - Multiple selections from options
- `date` - Date and time values
- `checkbox` - Boolean checkbox
- `url` - URL links
- `email` - Email addresses
- `phone_number` - Phone numbers
- `formula` - Calculated values
- `relation` - References to other database entries
- `rollup` - Aggregated values from relations
- `people` - User references
- `files` - File attachments
- `created_time` - Auto-generated creation time
- `created_by` - Auto-generated creator
- `last_edited_time` - Auto-generated last edit time
- `last_edited_by` - Auto-generated last editor

## Error Handling

### Common Error Responses
```json
{
  "error": {
    "code": -32603,
    "message": "Notion API Error",
    "data": {
      "notion_code": "validation_error",
      "details": "The provided page_id is not a valid UUID format"
    }
  }
}
```

### Error Categories
- **Authentication Errors**: Invalid or expired tokens
- **Validation Errors**: Invalid parameters or formats
- **Permission Errors**: Insufficient access rights
- **Rate Limiting**: Too many requests
- **Resource Not Found**: Invalid IDs or deleted content

## Performance Tips

1. **Pagination**: Use `page_size` and `start_cursor` for large result sets
2. **Filtering**: Apply filters in `query_database` to reduce data transfer
3. **Sorting**: Use sorting to get most relevant results first
4. **Batch Operations**: Group multiple block operations when possible
5. **Caching**: Cache frequently accessed page/database metadata

## Authentication Requirements

All tools require:
- Valid OAuth 2.0 Bearer token
- Appropriate Notion integration permissions
- Active user session with workspace access

## Rate Limiting

- Notion API has rate limits (3 requests per second per integration)
- Service implements automatic retry with exponential backoff
- Use pagination to avoid hitting limits on large datasets
- Consider request timing for bulk operations