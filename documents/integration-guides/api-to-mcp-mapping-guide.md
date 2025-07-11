# API to MCP Mapping Guide

This comprehensive guide explains how to map any REST API to MCP (Model Context Protocol) tools and resources, enabling GET, POST, PUT, DELETE, and other HTTP operations through the MCP interface.

## Understanding MCP Components

### Tools vs Resources
- **Tools**: Actions you can perform (GET, POST, PUT, DELETE operations)
- **Resources**: Data you can read (GET operations only, for data browsing)

### MCP Protocol Structure
```json
{
  "tools": [
    {
      "name": "action_name",
      "description": "What this action does",
      "inputSchema": {
        "type": "object",
        "properties": { /* parameters */ },
        "required": [ /* required fields */ ]
      }
    }
  ],
  "resources": [
    {
      "name": "data_name",
      "uri": "service://path/to/data",
      "description": "What data this provides",
      "mimeType": "application/json"
    }
  ]
}
```

## Step-by-Step API Mapping Process

### Step 1: Analyze Your API Documentation

From your API docs, identify:

**Authentication:**
- Method (API key, Bearer token, OAuth, Basic auth)
- Header format
- Required credentials

**Endpoints:**
- Base URL
- Available paths
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Required parameters
- Optional parameters
- Request body structure (for POST/PUT)
- Response structure

**Rate Limits:**
- Requests per time period
- Any special limitations

### Step 2: Categorize API Endpoints

Group your endpoints by operation type:

#### Read Operations (GET)
Map these to both **Tools** (for actions) and **Resources** (for browsing):

**Example API Endpoints:**
```
GET /users/me          → User profile
GET /projects          → List projects  
GET /projects/{id}     → Project details
GET /tasks             → List tasks
GET /files             → List files
```

#### Write Operations (POST, PUT, PATCH, DELETE)
Map these to **Tools** only:

**Example API Endpoints:**
```
POST /projects         → Create project
PUT /projects/{id}     → Update project
DELETE /projects/{id}  → Delete project
POST /tasks            → Create task
PATCH /tasks/{id}      → Update task
```

### Step 3: Define Tools Configuration

For each API endpoint, create a tool definition:

#### GET Endpoint Tool Example
```javascript
{
  name: 'get_user_info',
  description: 'Get current user information',
  endpoint: 'me',  // Maps to endpoints.me
  parameters: {}
}
```

#### GET with Parameters Tool Example  
```javascript
{
  name: 'list_projects',
  description: 'List projects with optional filtering',
  handler: 'listProjects',  // Custom handler name
  parameters: {
    limit: {
      type: 'integer',
      description: 'Maximum number of projects to return',
      required: false,
      default: 50
    },
    status: {
      type: 'string',
      description: 'Filter by project status',
      required: false,
      enum: ['active', 'completed', 'archived']
    }
  }
}
```

#### POST Endpoint Tool Example
```javascript
{
  name: 'create_project',
  description: 'Create a new project',
  handler: 'createProject',
  parameters: {
    name: {
      type: 'string',
      description: 'Project name',
      required: true
    },
    description: {
      type: 'string', 
      description: 'Project description',
      required: false
    },
    priority: {
      type: 'string',
      description: 'Project priority level',
      required: false,
      enum: ['low', 'medium', 'high']
    }
  }
}
```

#### PUT/PATCH Endpoint Tool Example
```javascript
{
  name: 'update_project',
  description: 'Update an existing project',
  handler: 'updateProject',
  parameters: {
    projectId: {
      type: 'string',
      description: 'ID of the project to update',
      required: true
    },
    name: {
      type: 'string',
      description: 'New project name',
      required: false
    },
    status: {
      type: 'string',
      description: 'New project status',
      required: false,
      enum: ['active', 'completed', 'archived']
    }
  }
}
```

#### DELETE Endpoint Tool Example
```javascript
{
  name: 'delete_project',
  description: 'Delete a project',
  handler: 'deleteProject',
  parameters: {
    projectId: {
      type: 'string',
      description: 'ID of the project to delete',
      required: true
    },
    confirm: {
      type: 'boolean',
      description: 'Confirmation flag to prevent accidental deletion',
      required: true
    }
  }
}
```

### Step 4: Define Resources Configuration

Resources are for browsing data (GET operations only):

```javascript
resources: [
  {
    name: 'user_profile',
    uri: 'service://user/profile',
    description: 'Current user profile information',
    endpoint: 'me'  // Maps to simple GET endpoint
  },
  {
    name: 'projects_list',
    uri: 'service://projects/list',
    description: 'List of all projects',
    handler: 'listProjects'  // Maps to custom handler
  },
  {
    name: 'tasks_list',
    uri: 'service://tasks/list',
    description: 'List of all tasks',
    handler: 'listTasks'
  }
]
```

### Step 5: Create Custom Handlers

For each tool/resource that needs more than a simple GET, create a custom handler:

**IMPORTANT: All handlers must include comprehensive logging for access and errors.**

#### Simple GET Handler
```javascript
customHandlers: {
  // Maps to: GET /projects?limit=X&status=Y
  listProjects: async (config, token, options = {}) => {
    const { limit = 50, status = '' } = options;
    let url = `${config.api.baseURL}/projects?limit=${limit}`;
    if (status) url += `&status=${status}`;
    
    // Log access attempt
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: GET ${url}`, 'access', {
          action: 'list_projects',
          limit,
          status
        });
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Log API error
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `API Error: GET /projects failed - ${response.status} ${response.statusText}`, 'error', {
              action: 'list_projects',
              statusCode: response.status,
              url
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log successful access
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Projects listed successfully: ${data.projects?.length || data.length || 0} items`, 'access', {
            action: 'list_projects',
            count: data.projects?.length || data.length || 0
          });
      }
      
      return {
        projects: data.projects || data,
        total: data.total || data.length,
        limit: limit
      };
    } catch (error) {
      // Log unexpected errors
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `List projects failed: ${error.message}`, 'error', {
            action: 'list_projects',
            error: error.message,
            options
          });
      }
      throw error;
    }
  }
}
```

#### POST Handler
```javascript
customHandlers: {
  // Maps to: POST /projects
  createProject: async (config, token, projectData) => {
    // Log access attempt
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: POST ${config.api.baseURL}/projects`, 'access', {
          action: 'create_project',
          projectName: projectData.name
        });
    }

    try {
      const response = await fetch(`${config.api.baseURL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        // Log error
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `API Error: POST /projects failed - ${response.status} ${response.statusText}`, 'error', {
              action: 'create_project',
              statusCode: response.status,
              projectData
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const newProject = await response.json();
      
      // Log successful creation
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Project created successfully: ${newProject.name}`, 'access', {
            action: 'create_project',
            projectId: newProject.id,
            projectName: newProject.name
          });
      }
      
      return {
        success: true,
        project: newProject,
        message: `Project "${newProject.name}" created successfully`
      };
    } catch (error) {
      // Log unexpected errors
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Project creation failed: ${error.message}`, 'error', {
            action: 'create_project',
            error: error.message,
            projectData
          });
      }
      throw error;
    }
  }
}
```

#### PUT/PATCH Handler
```javascript
customHandlers: {
  // Maps to: PUT /projects/{id}
  updateProject: async (config, token, projectId, updateData) => {
    const response = await fetch(`${config.api.baseURL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const updatedProject = await response.json();
    return {
      success: true,
      project: updatedProject,
      message: `Project updated successfully`
    };
  }
}
```

#### DELETE Handler
```javascript
customHandlers: {
  // Maps to: DELETE /projects/{id}
  deleteProject: async (config, token, projectId, confirm) => {
    if (!confirm) {
      throw new Error('Deletion not confirmed. Set confirm parameter to true.');
    }
    
    const response = await fetch(`${config.api.baseURL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return {
      success: true,
      message: `Project ${projectId} deleted successfully`
    };
  }
}
```

### Step 6: Complete Service Configuration Template

Here's a complete example mapping a project management API:

```javascript
export default {
  name: 'projectmanager',
  displayName: 'Project Manager',
  description: 'Project management tool with tasks and collaboration',
  category: 'productivity',
  iconUrl: 'https://example.com/icon.svg',
  
  api: {
    baseURL: 'https://api.projectmanager.com/v1',
    version: 'v1',
    rateLimit: { requests: 1000, period: 'hour' },
    documentation: 'https://docs.projectmanager.com/api'
  },
  
  auth: {
    type: 'bearer_token',
    field: 'access_token',
    header: 'Authorization',
    headerFormat: token => `Bearer ${token}`,
    validation: {
      format: /^[A-Za-z0-9_-]+$/,
      endpoint: '/me'
    }
  },
  
  endpoints: {
    me: '/me',
    projects: '/projects',
    tasks: '/tasks',
    projectDetails: id => `/projects/${id}`,
    taskDetails: id => `/tasks/${id}`
  },
  
  customHandlers: {
    // GET operations
    listProjects: async (config, token, options = {}) => { /* ... */ },
    listTasks: async (config, token, options = {}) => { /* ... */ },
    getProjectDetails: async (config, token, projectId) => { /* ... */ },
    
    // POST operations  
    createProject: async (config, token, projectData) => { /* ... */ },
    createTask: async (config, token, taskData) => { /* ... */ },
    
    // PUT operations
    updateProject: async (config, token, projectId, updateData) => { /* ... */ },
    updateTask: async (config, token, taskId, updateData) => { /* ... */ },
    
    // DELETE operations
    deleteProject: async (config, token, projectId, confirm) => { /* ... */ },
    deleteTask: async (config, token, taskId, confirm) => { /* ... */ }
  },
  
  tools: [
    // READ TOOLS
    {
      name: 'get_user_info',
      description: 'Get current user information',
      endpoint: 'me',
      parameters: {}
    },
    {
      name: 'list_projects',
      description: 'List projects with optional filtering',
      handler: 'listProjects',
      parameters: {
        limit: { type: 'integer', required: false, default: 50 },
        status: { type: 'string', required: false }
      }
    },
    {
      name: 'get_project_details',
      description: 'Get detailed information about a specific project',
      handler: 'getProjectDetails',
      parameters: {
        projectId: { type: 'string', required: true }
      }
    },
    
    // WRITE TOOLS
    {
      name: 'create_project',
      description: 'Create a new project',
      handler: 'createProject',
      parameters: {
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
        priority: { type: 'string', required: false, enum: ['low', 'medium', 'high'] }
      }
    },
    {
      name: 'update_project',
      description: 'Update an existing project',
      handler: 'updateProject',
      parameters: {
        projectId: { type: 'string', required: true },
        name: { type: 'string', required: false },
        status: { type: 'string', required: false }
      }
    },
    {
      name: 'delete_project',
      description: 'Delete a project',
      handler: 'deleteProject',
      parameters: {
        projectId: { type: 'string', required: true },
        confirm: { type: 'boolean', required: true }
      }
    }
  ],
  
  resources: [
    {
      name: 'user_profile',
      uri: 'projectmanager://user/profile',
      description: 'Current user profile information',
      endpoint: 'me'
    },
    {
      name: 'projects_list',
      uri: 'projectmanager://projects/list',
      description: 'List of all projects',
      handler: 'listProjects'
    },
    {
      name: 'tasks_list',
      uri: 'projectmanager://tasks/list', 
      description: 'List of all tasks',
      handler: 'listTasks'
    }
  ],
  
  validation: {
    credentials: async (config, credentials) => {
      // Validate access token format and test against API
      // ... validation logic
    }
  }
};
```

## Logging Requirements

### Mandatory Logging in All Handlers

Every custom handler MUST implement logging for:

1. **Access Logging** (goes to `access.log`):
   - All API requests (before making the call)
   - Successful operations (after completion)
   - Include action name, parameters, and results summary

2. **Error Logging** (goes to `error.log`):
   - API errors (4xx, 5xx responses)
   - Network errors
   - Validation errors
   - Include full error details and context

### Logging Pattern Template
```javascript
// At the start of every handler:
if (global.logFileManager && global.mcpId) {
  global.logFileManager.writeLog(global.mcpId, 'info', 
    `API Access: ${method} ${url}`, 'access', {
      action: 'handler_name',
      parameters: { /* relevant params */ }
    });
}

// For successful operations:
if (global.logFileManager && global.mcpId) {
  global.logFileManager.writeLog(global.mcpId, 'info', 
    `Operation completed successfully`, 'access', {
      action: 'handler_name',
      results: { /* summary of results */ }
    });
}

// For errors:
if (global.logFileManager && global.mcpId) {
  global.logFileManager.writeLog(global.mcpId, 'error', 
    `Operation failed: ${error.message}`, 'error', {
      action: 'handler_name',
      error: error.message,
      context: { /* relevant context */ }
    });
}
```

## Advanced Mapping Patterns

### Pagination Handling
```javascript
customHandlers: {
  listItemsPaginated: async (config, token, options = {}) => {
    const { page = 1, limit = 50, cursor = null } = options;
    
    let url = `${config.api.baseURL}/items?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    } else {
      url += `&page=${page}`;
    }
    
    // Log access attempt
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: GET ${url}`, 'access', {
          action: 'list_items_paginated',
          page, limit, cursor
        });
    }

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `Pagination API error: ${response.status}`, 'error', {
              action: 'list_items_paginated',
              statusCode: response.status,
              url
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log successful pagination
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Paginated list retrieved: ${data.items?.length || 0} items`, 'access', {
            action: 'list_items_paginated',
            itemCount: data.items?.length || 0,
            hasMore: data.has_more
          });
      }
      
      return {
        items: data.items,
        pagination: {
          current_page: data.page,
          total_pages: data.total_pages,
          next_cursor: data.next_cursor,
          has_more: data.has_more
        }
      };
    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Pagination failed: ${error.message}`, 'error', {
            action: 'list_items_paginated',
            error: error.message,
            options
          });
      }
      throw error;
    }
  }
}
```

### Bulk Operations
```javascript
tools: [
  {
    name: 'bulk_create_tasks',
    description: 'Create multiple tasks at once',
    handler: 'bulkCreateTasks',
    parameters: {
      tasks: {
        type: 'array',
        description: 'Array of task objects to create',
        required: true,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      }
    }
  }
]
```

### File Upload Operations
```javascript
customHandlers: {
  uploadFile: async (config, token, fileData, fileName) => {
    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('name', fileName);
    
    const response = await fetch(`${config.api.baseURL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return await response.json();
  }
}
```

### Error Handling Patterns
```javascript
customHandlers: {
  safeApiCall: async (config, token, endpoint, options = {}) => {
    try {
      const response = await fetch(`${config.api.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      // Handle different status codes
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or expired token');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Insufficient permissions');
      } else if (response.status === 404) {
        throw new Error('Not found: Resource does not exist');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded: Please try again later');
      } else if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}
```

## Testing Your MCP Integration

### 1. Tool Testing via JSON-RPC
```bash
# Test a read operation
curl -X POST http://localhost:PORT/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_projects",
      "arguments": {"limit": 10, "status": "active"}
    }
  }'

# Test a write operation  
curl -X POST http://localhost:PORT/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_project",
      "arguments": {
        "name": "Test Project",
        "description": "A test project",
        "priority": "medium"
      }
    }
  }'
```

### 2. Resource Testing
```bash
# List available resources
curl -X POST http://localhost:PORT/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/list"
  }'

# Read a resource
curl -X POST http://localhost:PORT/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "resources/read",
    "params": {
      "uri": "service://projects/list"
    }
  }'
```

## Best Practices

### 1. Tool Naming
- Use descriptive action verbs: `get_`, `list_`, `create_`, `update_`, `delete_`
- Be consistent across your service
- Include the object type: `get_project_details`, `list_user_tasks`

### 2. Parameter Design
- Mark required vs optional parameters clearly
- Provide sensible defaults
- Use enums for limited choice fields
- Include detailed descriptions

### 3. Response Handling
- Return consistent data structures
- Include success/error indicators
- Provide helpful error messages
- Add metadata like counts, pagination info

### 4. Security Considerations
- Always validate input parameters
- Implement confirmation flags for destructive operations
- Never log credentials
- Respect API rate limits

### 5. Error Messages
- Be specific about what went wrong
- Include error codes when available
- Provide suggestions for fixing issues
- Handle different HTTP status codes appropriately

This comprehensive mapping approach allows you to expose your entire REST API through the MCP protocol, enabling users to perform all CRUD operations via tools and browse data via resources.