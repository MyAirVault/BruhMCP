# Logging Implementation Examples for MCP Services

This document provides comprehensive examples of how to implement proper logging in your MCP service integrations. All API access must be logged to `access.log` and all errors must be logged to `error.log`.

## Logging Architecture

### Log File Structure
```
logs/
└── users/
    └── user_{userId}/
        └── mcp_{instanceId}/
            ├── access.log    # All API requests and successful operations
            ├── error.log     # All errors and failures
            └── app.log       # General application logs
```

### Log Entry Format
```json
{
  "timestamp": "2025-07-11T10:30:45.123Z",
  "level": "info",
  "message": "API Access: GET https://api.service.com/projects",
  "metadata": {
    "type": "access",
    "instanceId": "abc123",
    "action": "list_projects",
    "parameters": {"limit": 50, "status": "active"}
  }
}
```

## Basic Logging Pattern

### Template for All Handlers
```javascript
// Standard logging pattern for any custom handler
async function exampleHandler(config, token, parameters = {}) {
  const actionName = 'example_action';
  const url = `${config.api.baseURL}/endpoint`;

  // 1. Log access attempt (REQUIRED)
  if (global.logFileManager && global.mcpId) {
    global.logFileManager.writeLog(global.mcpId, 'info', 
      `API Access: GET ${url}`, 'access', {
        action: actionName,
        parameters: parameters
      });
  }

  try {
    // 2. Make API request
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Handle API errors (REQUIRED)
    if (!response.ok) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `API Error: ${response.status} ${response.statusText}`, 'error', {
            action: actionName,
            statusCode: response.status,
            url: url,
            parameters: parameters
          });
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 4. Process successful response
    const data = await response.json();

    // 5. Log successful completion (REQUIRED)
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `Operation completed successfully`, 'access', {
          action: actionName,
          resultCount: data.length || 1,
          summary: 'Brief description of what was accomplished'
        });
    }

    return data;

  } catch (error) {
    // 6. Log unexpected errors (REQUIRED)
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'error', 
        `${actionName} failed: ${error.message}`, 'error', {
          action: actionName,
          error: error.message,
          parameters: parameters,
          stackTrace: error.stack
        });
    }
    throw error;
  }
}
```

## HTTP Method Examples

### GET Request Logging
```javascript
customHandlers: {
  listProjects: async (config, token, options = {}) => {
    const { limit = 50, status = '', page = 1 } = options;
    const url = `${config.api.baseURL}/projects?limit=${limit}&status=${status}&page=${page}`;

    // Log GET request
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: GET ${url}`, 'access', {
          action: 'list_projects',
          parameters: { limit, status, page }
        });
    }

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `GET /projects failed: ${response.status} ${response.statusText}`, 'error', {
              action: 'list_projects',
              statusCode: response.status,
              statusText: response.statusText,
              url: url
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Log successful GET
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Projects retrieved: ${data.projects?.length || 0} items`, 'access', {
            action: 'list_projects',
            projectCount: data.projects?.length || 0,
            totalPages: data.totalPages,
            currentPage: page
          });
      }

      return {
        projects: data.projects || [],
        total: data.total || 0,
        page: page,
        totalPages: data.totalPages || 1
      };

    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `List projects failed: ${error.message}`, 'error', {
            action: 'list_projects',
            error: error.message,
            parameters: options
          });
      }
      throw error;
    }
  }
}
```

### POST Request Logging
```javascript
customHandlers: {
  createProject: async (config, token, projectData) => {
    const url = `${config.api.baseURL}/projects`;

    // Log POST attempt (don't log sensitive data)
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: POST ${url}`, 'access', {
          action: 'create_project',
          projectName: projectData.name,
          projectType: projectData.type
          // Note: Don't log full projectData if it contains sensitive info
        });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `POST /projects failed: ${response.status} ${response.statusText}`, 'error', {
              action: 'create_project',
              statusCode: response.status,
              statusText: response.statusText,
              projectName: projectData.name
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
            projectName: newProject.name,
            projectStatus: newProject.status
          });
      }

      return {
        success: true,
        project: newProject,
        message: `Project "${newProject.name}" created successfully`
      };

    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Create project failed: ${error.message}`, 'error', {
            action: 'create_project',
            error: error.message,
            projectName: projectData.name,
            stackTrace: error.stack
          });
      }
      throw error;
    }
  }
}
```

### PUT Request Logging
```javascript
customHandlers: {
  updateProject: async (config, token, projectId, updateData) => {
    const url = `${config.api.baseURL}/projects/${projectId}`;

    // Log PUT attempt
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: PUT ${url}`, 'access', {
          action: 'update_project',
          projectId: projectId,
          updateFields: Object.keys(updateData)
        });
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `PUT /projects/${projectId} failed: ${response.status} ${response.statusText}`, 'error', {
              action: 'update_project',
              statusCode: response.status,
              statusText: response.statusText,
              projectId: projectId,
              updateFields: Object.keys(updateData)
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedProject = await response.json();

      // Log successful update
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Project updated successfully: ${updatedProject.name}`, 'access', {
            action: 'update_project',
            projectId: projectId,
            projectName: updatedProject.name,
            updatedFields: Object.keys(updateData)
          });
      }

      return {
        success: true,
        project: updatedProject,
        message: `Project updated successfully`
      };

    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Update project failed: ${error.message}`, 'error', {
            action: 'update_project',
            error: error.message,
            projectId: projectId,
            updateFields: Object.keys(updateData)
          });
      }
      throw error;
    }
  }
}
```

### DELETE Request Logging
```javascript
customHandlers: {
  deleteProject: async (config, token, projectId, confirm = false) => {
    const url = `${config.api.baseURL}/projects/${projectId}`;

    // Validate confirmation first
    if (!confirm) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Delete project attempted without confirmation`, 'error', {
            action: 'delete_project',
            projectId: projectId,
            reason: 'missing_confirmation'
          });
      }
      throw new Error('Delete operation requires confirmation. Set confirm parameter to true.');
    }

    // Log DELETE attempt
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: DELETE ${url}`, 'access', {
          action: 'delete_project',
          projectId: projectId,
          confirmed: confirm
        });
    }

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `DELETE /projects/${projectId} failed: ${response.status} ${response.statusText}`, 'error', {
              action: 'delete_project',
              statusCode: response.status,
              statusText: response.statusText,
              projectId: projectId
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Log successful deletion
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Project deleted successfully: ${projectId}`, 'access', {
            action: 'delete_project',
            projectId: projectId,
            deletedAt: new Date().toISOString()
          });
      }

      return {
        success: true,
        message: `Project ${projectId} deleted successfully`,
        deletedId: projectId
      };

    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Delete project failed: ${error.message}`, 'error', {
            action: 'delete_project',
            error: error.message,
            projectId: projectId
          });
      }
      throw error;
    }
  }
}
```

## Advanced Logging Scenarios

### Pagination Logging
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

    // Log paginated request
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: GET ${url} (Paginated)`, 'access', {
          action: 'list_items_paginated',
          page: page,
          limit: limit,
          cursor: cursor,
          paginationType: cursor ? 'cursor' : 'page'
        });
    }

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `Paginated GET failed: ${response.status}`, 'error', {
              action: 'list_items_paginated',
              statusCode: response.status,
              page: page,
              limit: limit,
              url: url
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Log pagination results
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Paginated items retrieved: ${data.items?.length || 0} items (Page ${page})`, 'access', {
            action: 'list_items_paginated',
            itemCount: data.items?.length || 0,
            currentPage: page,
            totalPages: data.totalPages,
            hasMore: data.hasMore,
            nextCursor: data.nextCursor
          });
      }

      return {
        items: data.items || [],
        pagination: {
          currentPage: page,
          totalPages: data.totalPages,
          hasMore: data.hasMore,
          nextCursor: data.nextCursor,
          itemCount: data.items?.length || 0
        }
      };

    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Paginated list failed: ${error.message}`, 'error', {
            action: 'list_items_paginated',
            error: error.message,
            page: page,
            limit: limit
          });
      }
      throw error;
    }
  }
}
```

### Bulk Operations Logging
```javascript
customHandlers: {
  bulkCreateItems: async (config, token, itemsArray) => {
    const url = `${config.api.baseURL}/items/bulk`;
    const itemCount = itemsArray.length;

    // Log bulk operation start
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: POST ${url} (Bulk Create)`, 'access', {
          action: 'bulk_create_items',
          itemCount: itemCount,
          bulkOperation: true
        });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: itemsArray })
      });

      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `Bulk create failed: ${response.status}`, 'error', {
              action: 'bulk_create_items',
              statusCode: response.status,
              itemCount: itemCount,
              bulkOperation: true
            });
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Log bulk operation results
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `Bulk create completed: ${result.created?.length || 0} created, ${result.failed?.length || 0} failed`, 'access', {
            action: 'bulk_create_items',
            requested: itemCount,
            created: result.created?.length || 0,
            failed: result.failed?.length || 0,
            successRate: `${Math.round(((result.created?.length || 0) / itemCount) * 100)}%`
          });
      }

      return {
        success: true,
        created: result.created || [],
        failed: result.failed || [],
        summary: {
          total: itemCount,
          created: result.created?.length || 0,
          failed: result.failed?.length || 0
        }
      };

    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `Bulk create items failed: ${error.message}`, 'error', {
            action: 'bulk_create_items',
            error: error.message,
            itemCount: itemCount,
            bulkOperation: true
          });
      }
      throw error;
    }
  }
}
```

### File Upload Logging
```javascript
customHandlers: {
  uploadFile: async (config, token, fileData, fileName, fileSize) => {
    const url = `${config.api.baseURL}/files`;

    // Log file upload attempt
    if (global.logFileManager && global.mcpId) {
      global.logFileManager.writeLog(global.mcpId, 'info', 
        `API Access: POST ${url} (File Upload)`, 'access', {
          action: 'upload_file',
          fileName: fileName,
          fileSize: fileSize,
          uploadType: 'multipart'
        });
    }

    try {
      const formData = new FormData();
      formData.append('file', fileData);
      formData.append('name', fileName);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      if (!response.ok) {
        if (global.logFileManager && global.mcpId) {
          global.logFileManager.writeLog(global.mcpId, 'error', 
            `File upload failed: ${response.status}`, 'error', {
              action: 'upload_file',
              statusCode: response.status,
              fileName: fileName,
              fileSize: fileSize
            });
        }
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const uploadResult = await response.json();

      // Log successful upload
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'info', 
          `File uploaded successfully: ${fileName}`, 'access', {
            action: 'upload_file',
            fileName: fileName,
            fileSize: fileSize,
            fileId: uploadResult.id,
            uploadUrl: uploadResult.url
          });
      }

      return {
        success: true,
        file: uploadResult,
        message: `File "${fileName}" uploaded successfully`
      };

    } catch (error) {
      if (global.logFileManager && global.mcpId) {
        global.logFileManager.writeLog(global.mcpId, 'error', 
          `File upload failed: ${error.message}`, 'error', {
            action: 'upload_file',
            error: error.message,
            fileName: fileName,
            fileSize: fileSize
          });
      }
      throw error;
    }
  }
}
```

## Security Considerations

### Safe Logging Practices
```javascript
// ✅ GOOD - Log action and parameters but not sensitive data
if (global.logFileManager && global.mcpId) {
  global.logFileManager.writeLog(global.mcpId, 'info', 
    `User authentication successful`, 'access', {
      action: 'authenticate_user',
      userId: user.id,
      email: user.email  // OK - email is not sensitive credential
      // DON'T log: password, token, api_key, etc.
    });
}

// ❌ BAD - Logging sensitive credentials
if (global.logFileManager && global.mcpId) {
  global.logFileManager.writeLog(global.mcpId, 'info', 
    `API Access with token: ${token}`, 'access', {  // BAD!
      action: 'authenticate_user',
      token: token,  // BAD!
      password: userData.password  // BAD!
    });
}

// ✅ GOOD - Log errors without exposing sensitive data
if (global.logFileManager && global.mcpId) {
  global.logFileManager.writeLog(global.mcpId, 'error', 
    `Authentication failed: Invalid credentials`, 'error', {
      action: 'authenticate_user',
      reason: 'invalid_credentials',
      attemptCount: attempts
      // DON'T log the actual invalid credentials
    });
}
```

### Data Sanitization
```javascript
function sanitizeForLogging(data) {
  const sensitiveFields = ['password', 'token', 'api_key', 'secret', 'auth', 'credential'];
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Usage in logging
if (global.logFileManager && global.mcpId) {
  global.logFileManager.writeLog(global.mcpId, 'info', 
    `User data updated`, 'access', {
      action: 'update_user',
      userData: sanitizeForLogging(userData)  // Safe to log
    });
}
```

## Testing Your Logging

### Log Verification Checklist

1. **Access Log Verification**:
   ```bash
   # Check that all API requests are logged
   tail -f logs/users/user_*/mcp_*/access.log | grep "API Access"
   
   # Verify successful operations are logged
   tail -f logs/users/user_*/mcp_*/access.log | grep "completed successfully"
   ```

2. **Error Log Verification**:
   ```bash
   # Check that API errors are logged
   tail -f logs/users/user_*/mcp_*/error.log | grep "API Error"
   
   # Verify application errors are logged
   tail -f logs/users/user_*/mcp_*/error.log | grep "failed:"
   ```

3. **Log Content Validation**:
   - Ensure no sensitive data (tokens, passwords) appears in logs
   - Verify timestamps are present and accurate
   - Check that metadata contains relevant context
   - Confirm proper log level assignment (info vs error)

### Sample Log Outputs

**access.log entry:**
```json
{
  "timestamp": "2025-07-11T10:30:45.123Z",
  "level": "info",
  "message": "Project created successfully: My New Project",
  "metadata": {
    "type": "access",
    "instanceId": "abc123",
    "action": "create_project",
    "projectId": "proj_456",
    "projectName": "My New Project"
  }
}
```

**error.log entry:**
```json
{
  "timestamp": "2025-07-11T10:35:22.456Z",
  "level": "error",
  "message": "API Error: POST /projects failed - 400 Bad Request",
  "metadata": {
    "type": "error",
    "instanceId": "abc123",
    "action": "create_project",
    "statusCode": 400,
    "statusText": "Bad Request",
    "projectName": "Invalid Project"
  }
}
```

This comprehensive logging ensures full traceability of all API operations and errors, enabling effective debugging and monitoring of your MCP services.