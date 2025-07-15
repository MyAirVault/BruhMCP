# Figma MCP Server - Available Endpoints & Actions

Your Figma MCP server provides comprehensive access to the Figma API through 31 different tools/endpoints:

## 📄 **File Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_file` | Get file details including document structure and metadata | `fileKey` |
| `get_figma_file_meta` | Get file metadata only | `fileKey` |
| `get_figma_file_versions` | Get version history of a file | `fileKey` |
| `get_figma_file_with_version` | Get file at a specific version | `fileKey`, `versionId` |

## 🎨 **Design System & Components**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_components` | Get published components from a file | `fileKey` |
| `get_figma_component_sets` | Get component sets from a file | `fileKey` |
| `get_figma_component_info` | Get information about a specific component | `componentKey` |
| `get_figma_component_set_info` | Get information about a specific component set | `componentSetKey` |
| `get_figma_styles` | Get published styles from a file | `fileKey` |
| `get_figma_team_components` | Get components from a team | `teamId` |

## 🌐 **Nodes & Structure**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_nodes` | Get specific nodes by their IDs | `fileKey`, `nodeIds` |

## 🖼️ **Image Export**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_images` | Render nodes as images (PNG, JPG, SVG, PDF) | `fileKey`, `nodeIds` |
| `get_figma_image_fills` | Get download links for image fills | `fileKey` |

## 💬 **Comments & Collaboration**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_comments` | Get comments from a file | `fileKey` |
| `post_figma_comment` | Add a comment to a file | `fileKey`, `message` |
| `delete_figma_comment` | Delete a comment | `fileKey`, `commentId` |

## 👥 **Team & Project Management**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_user` | Get current user information | None |
| `get_figma_team_projects` | Get projects for a team | `teamId` |
| `get_figma_project_files` | Get files in a project | `projectId` |

## 🔄 **Variables (Enterprise Only)**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_local_variables` | Get local variables from a file | `fileKey` |
| `get_figma_published_variables` | Get published variables from a file | `fileKey` |
| `post_figma_variables` | Create variables in a file | `fileKey`, `variableData` |
| `put_figma_variables` | Update variables in a file | `fileKey`, `variableData` |
| `delete_figma_variables` | Delete variables from a file | `fileKey`, `variableData` |

## 🔗 **Webhooks (V2 API)**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_figma_webhooks` | Get webhooks | None (optional: `teamId`) |
| `post_figma_webhook` | Create a webhook | `webhookData` |
| `put_figma_webhook` | Update a webhook | `webhookId`, `webhookData` |
| `delete_figma_webhook` | Delete a webhook | `webhookId` |

## 🔐 **Authentication**
Your Figma MCP server uses **API token authentication**:
- Requires Figma API key starting with `figd_`
- No OAuth flow - simpler than Gmail implementation
- API key passed via `X-Figma-Token` header

## 🚀 **Common Use Cases**

### **Design System Management**
```javascript
// Get all components from a design system file
get_figma_components({ fileKey: "ABC123" })

// Get specific component details
get_figma_component_info({ componentKey: "XYZ789" })

// Export component as image
get_figma_images({ 
  fileKey: "ABC123", 
  nodeIds: ["1:2"], 
  format: "svg" 
})
```

### **File Analysis**
```javascript
// Get full file structure
get_figma_file({ fileKey: "ABC123" })

// Get specific nodes
get_figma_nodes({ 
  fileKey: "ABC123", 
  nodeIds: ["1:2", "1:3"] 
})

// Check file versions
get_figma_file_versions({ fileKey: "ABC123" })
```

### **Team Collaboration**
```javascript
// Get team projects
get_figma_team_projects({ teamId: "team123" })

// Get files in project
get_figma_project_files({ projectId: "proj456" })

// Add comment to file
post_figma_comment({ 
  fileKey: "ABC123", 
  message: "Please review this design",
  position: { x: 100, y: 200 }
})
```

## 📊 **API Coverage**
Your implementation covers **most major Figma API endpoints**:
- ✅ Files API (complete)
- ✅ Comments API (complete) 
- ✅ Images API (complete)
- ✅ Projects API (complete)
- ✅ Components API (complete)
- ✅ Variables API (Enterprise)
- ✅ Webhooks V2 API (complete)
- ❌ Dev Mode API (not implemented)
- ❌ Plugins API (not implemented)

## 🔧 **Technical Implementation Details**

### **Error Handling**
All endpoints include comprehensive error handling:
- **401**: Invalid Figma API key
- **403**: Insufficient permissions (Variables/Webhooks)
- **404**: Resource not found or not accessible
- **General**: Network and parsing errors

### **Validation**
Input validation includes:
- File key format validation (`/^[a-zA-Z0-9_-]+$/`)
- API key format validation (`figd_` prefix)
- URL parsing for file key extraction
- Input sanitization for logging

### **Rate Limiting**
- No built-in rate limiting (relies on Figma API limits)
- Error responses include Figma's rate limit information
- Recommended: Implement exponential backoff for production

## 🔄 **Integration Examples**

### **Frontend Integration**
```typescript
// Example usage in your frontend
const figmaService = {
  async getFileComponents(fileKey: string) {
    return await apiCall('get_figma_components', { fileKey });
  },
  
  async exportAsImage(fileKey: string, nodeIds: string[]) {
    return await apiCall('get_figma_images', { 
      fileKey, 
      nodeIds, 
      format: 'png',
      scale: 2 
    });
  }
};
```

### **Webhook Setup**
```javascript
// Create webhook for file changes
const webhook = await post_figma_webhook({
  webhookData: {
    event_type: 'FILE_UPDATE',
    team_id: 'team123',
    endpoint: 'https://yourapp.com/figma-webhook',
    passcode: 'your-secret-key'
  }
});
```

The server provides comprehensive access to Figma's core functionality for design system management, file operations, and team collaboration.