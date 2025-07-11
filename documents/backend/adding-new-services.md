# Adding New Services to MCP

This guide explains how to easily add new services (like Slack, Notion, Discord, etc.) to the MCP system using the modular service configuration framework.

## Quick Start

### Service Creation Process

1. Choose a template based on API type
2. Create service directory and configuration
3. Test the configuration
4. Update the database

## Service Templates

### REST API Template
For services with REST APIs (most common):
- **Config Template**: `/src/mcp-servers/templates/rest-api.js`
- **Routes Template**: `/src/mcp-servers/templates/routes.js`
- **Handlers**: Copy from `/src/mcp-servers/handlers/`
- **Examples**: Figma, GitHub, Slack, Notion

### GraphQL API Template  
For services with GraphQL APIs:
- **Config Template**: `/src/mcp-servers/templates/graphql.js`
- **Routes Template**: `/src/mcp-servers/templates/routes.js`
- **Handlers**: Copy from `/src/mcp-servers/handlers/`
- **Examples**: GitHub (v4), Shopify, Contentful

## Service Structure

Each service now has its own isolated directory structure:

```
services/
├── service-name/
│   ├── config.js          # Service configuration
│   ├── routes.js          # Service-specific routes
│   └── handlers/          # Service-specific handlers
│       ├── endpoint-handlers.js
│       ├── jsonrpc-handler.js
│       ├── resource-handlers.js
│       └── tool-handlers.js
```

## Configuration Structure

Each service configuration includes:

```javascript
export default {
  // Basic Information
  name: 'service-name',           // Technical identifier
  displayName: 'Service Name',    // Human-readable name
  description: 'Service description',
  category: 'communication',      // Service category
  iconUrl: 'https://...',        // Service icon URL
  
  // API Configuration
  api: {
    baseURL: 'https://api.service.com/v1',
    version: 'v1',
    rateLimit: { requests: 1000, period: 'hour' },
    documentation: 'https://docs.service.com'
  },
  
  // Authentication
  auth: {
    type: 'bearer_token',         // auth type
    field: 'access_token',        // credential field name
    header: 'Authorization',      // HTTP header
    headerFormat: token => `Bearer ${token}`,
    validation: {
      format: /^token_regex$/,    // token format validation
      endpoint: '/me'             // validation endpoint
    }
  },
  
  // API Endpoints
  endpoints: { ... },
  
  // Custom Handlers
  customHandlers: { ... },
  
  // Available Tools
  tools: [ ... ],
  
  // Available Resources
  resources: [ ... ],
  
  // Validation Rules
  validation: { ... }
}
```

## Step-by-Step Example: Adding Trello

### 1. Create Service Directory Structure

```bash
# Create service directory
mkdir -p src/mcp-servers/services/trello/handlers

# Copy templates
cp src/mcp-servers/templates/rest-api.js src/mcp-servers/services/trello/config.js
cp src/mcp-servers/templates/routes.js src/mcp-servers/services/trello/routes.js
cp src/mcp-servers/handlers/* src/mcp-servers/services/trello/handlers/
```

### 2. Customize Configuration

```javascript
// src/mcp-servers/services/trello/config.js
export default {
  name: 'trello',
  displayName: 'Trello',
  description: 'Project management and collaboration tool with boards and cards',
  category: 'productivity',
  iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg',
  
  api: {
    baseURL: 'https://api.trello.com/1',
    version: '1',
    rateLimit: { requests: 300, period: 'minute' },
    documentation: 'https://developer.atlassian.com/cloud/trello/rest/'
  },
  
  auth: {
    type: 'api_key',
    field: 'api_key',
    header: 'Authorization',
    headerFormat: (key, token) => `OAuth oauth_consumer_key="${key}", oauth_token="${token}"`,
    validation: {
      format: /^[a-f0-9]{32}$/,
      endpoint: '/members/me'
    }
  },
  
  endpoints: {
    me: '/members/me',
    boards: '/members/me/boards',
    cards: '/members/me/cards',
    boardDetails: boardId => `/boards/${boardId}`,
    boardCards: boardId => `/boards/${boardId}/cards`
  },
  
  customHandlers: {
    boards: async (config, credentials) => {
      const { api_key, token } = credentials;
      const response = await fetch(`${config.api.baseURL}/members/me/boards?key=${api_key}&token=${token}`);
      
      if (response.ok) {
        const boards = await response.json();
        return {
          boards: boards.map(board => ({
            id: board.id,
            name: board.name,
            description: board.desc,
            url: board.url,
            closed: board.closed,
            lists: board.lists?.length || 0
          })),
          total: boards.length
        };
      } else {
        throw new Error(`Trello API error: ${response.status}`);
      }
    }
  },
  
  tools: [
    {
      name: 'get_user_info',
      description: 'Get current user information from Trello',
      endpoint: 'me',
      parameters: {}
    },
    {
      name: 'list_boards',
      description: 'List user boards from Trello',
      handler: 'boards',
      parameters: {}
    }
  ],
  
  resources: [
    {
      name: 'user_info',
      uri: 'user/info',
      description: 'Trello user information',
      endpoint: 'me'
    },
    {
      name: 'boards_list',
      uri: 'boards/list',
      description: 'List of Trello boards',
      handler: 'boards'
    }
  ],
  
  validation: {
    credentials: async (config, credentials) => {
      if (!credentials.api_key || !credentials.token) {
        throw new Error('API key and token are required for Trello');
      }
      
      // Test credentials
      const response = await fetch(
        `${config.api.baseURL}/members/me?key=${credentials.api_key}&token=${credentials.token}`
      );
      
      if (response.ok) {
        const user = await response.json();
        return { valid: true, user };
      } else {
        throw new Error(`Invalid Trello credentials: ${response.status}`);
      }
    }
  }
};
```

### 3. Update Database

Add the new service to the database:

```sql
INSERT INTO mcp_types (name, display_name, description, icon_url) 
VALUES (
  'trello', 
  'Trello', 
  'Project management and collaboration tool with boards and cards',
  'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg'
);
```

### 4. Test the Service

```bash
# The service will be automatically discovered and loaded
# Test with a new MCP instance using Trello credentials
```

## Authentication Types

### API Key Authentication
```javascript
auth: {
  type: 'api_key',
  field: 'api_key',
  header: 'X-API-Key',
  headerFormat: key => key
}
```

### Bearer Token Authentication  
```javascript
auth: {
  type: 'bearer_token',
  field: 'access_token',
  header: 'Authorization',
  headerFormat: token => `Bearer ${token}`
}
```

### OAuth Authentication
```javascript
auth: {
  type: 'oauth',
  field: 'access_token',
  header: 'Authorization',
  headerFormat: token => `Bearer ${token}`
}
```

### Basic Authentication
```javascript
auth: {
  type: 'basic_auth',
  field: 'credentials',
  header: 'Authorization',
  headerFormat: creds => `Basic ${Buffer.from(creds).toString('base64')}`
}
```

## Common Patterns

### Pagination Handling
```javascript
customHandlers: {
  listItems: async (config, token, options = {}) => {
    const { page = 1, limit = 50 } = options;
    const response = await fetch(
      `${config.api.baseURL}/items?page=${page}&limit=${limit}`,
      { headers: config.auth.headerFormat ? 
          { [config.auth.header]: config.auth.headerFormat(token) } :
          { [config.auth.header]: token }
      }
    );
    
    const data = await response.json();
    return {
      items: data.items,
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        hasNext: data.hasNext
      }
    };
  }
}
```

### Error Handling
```javascript
customHandlers: {
  safeRequest: async (config, token, endpoint, options = {}) => {
    try {
      const response = await fetch(`${config.api.baseURL}${endpoint}`, {
        headers: {
          ...(config.auth.headerFormat ? 
            { [config.auth.header]: config.auth.headerFormat(token) } :
            { [config.auth.header]: token }),
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
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

### Rate Limiting
```javascript
api: {
  baseURL: 'https://api.service.com',
  rateLimit: {
    requests: 100,        // Number of requests
    period: 'minute',     // Time period
    strategy: 'sliding'   // sliding or fixed window
  }
}
```

## Service Categories

Organize services by category:

- **communication**: Slack, Discord, Teams, Telegram
- **productivity**: Notion, Trello, Asana, Todoist  
- **development**: GitHub, GitLab, Jira, Jenkins
- **design**: Figma, Sketch, Adobe Creative Cloud
- **marketing**: HubSpot, Mailchimp, Google Analytics
- **finance**: Stripe, PayPal, QuickBooks
- **storage**: Google Drive, Dropbox, AWS S3
- **social**: Twitter, LinkedIn, Facebook

## Testing Your Service

### 1. Automatic Discovery
Services are automatically discovered when the server starts.

### 2. Manual Testing
```bash
# Test service loading
node -e "
import { serviceRegistry } from './src/mcp-servers/config/service-registry.js';
await serviceRegistry.loadServices();
console.log('Loaded services:', serviceRegistry.getServiceNames());
"

# Test specific service
node -e "
import { serviceRegistry } from './src/mcp-servers/config/service-registry.js';
await serviceRegistry.loadServices();
const service = serviceRegistry.getService('trello');
console.log('Service config:', service);
"
```

### 3. Credential Validation
```bash
# Test credential validation
node -e "
import { serviceRegistry } from './src/mcp-servers/config/service-registry.js';
await serviceRegistry.loadServices();
const result = await serviceRegistry.validateCredentials('trello', {
  api_key: 'your-api-key',
  token: 'your-token'
});
console.log('Validation result:', result);
"
```

## Best Practices

### 1. Error Handling
- Always handle API errors gracefully
- Provide meaningful error messages
- Include error codes when available

### 2. Rate Limiting
- Respect service rate limits
- Implement backoff strategies
- Cache responses when appropriate

### 3. Security
- Never log credentials
- Validate input parameters
- Use HTTPS for all API calls

### 4. Documentation
- Document all endpoints and parameters
- Provide usage examples
- Include rate limit information

### 5. Testing
- Test with real API credentials
- Handle edge cases and errors
- Validate response formats

## Troubleshooting

### Service Not Loading
```bash
# Check for syntax errors
node --check src/mcp-servers/services/your-service/config.js

# Check registry logs
node -e "
import { serviceRegistry } from './src/mcp-servers/config/service-registry.js';
await serviceRegistry.loadServices();
"
```

### Authentication Issues
- Verify token format and validation regex
- Test credentials manually with the service API
- Check required scopes and permissions

### API Errors
- Verify endpoint URLs and parameters
- Check API documentation for changes
- Test with API debugging tools (Postman, curl)

## Advanced Features

### Custom Tool Generation
```javascript
tools: [
  // Static tool definition
  {
    name: 'get_user_info',
    description: 'Get user information',
    endpoint: 'me'
  },
  
  // Dynamic tool generation
  ...generateCRUDTools(['projects', 'tasks', 'comments'])
]
```

### Resource Streaming
```javascript
resources: [
  {
    name: 'live_updates',
    uri: 'updates/live',
    description: 'Live updates stream',
    streaming: true,
    handler: 'streamUpdates'
  }
]
```

### Webhook Support
```javascript
webhooks: {
  enabled: true,
  events: ['create', 'update', 'delete'],
  handler: async (event, data) => {
    // Handle webhook events
  }
}
```

---

## Next Steps

1. **Start Simple**: Begin with basic user info and list operations
2. **Iterate**: Add more endpoints and features gradually  
3. **Test Thoroughly**: Validate with real credentials and data
4. **Document**: Update this guide with your learnings
5. **Share**: Contribute successful configurations back to the project

Happy coding! 🚀