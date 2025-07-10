import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3001;
const mcpId = process.env.MCP_ID;
const userId = process.env.USER_ID;
const mcpType = process.env.MCP_TYPE;

// Parse credentials
let credentials = {};
try {
  credentials = JSON.parse(process.env.CREDENTIALS || '{}');
} catch (error) {
  console.error('Failed to parse credentials:', error);
  process.exit(1);
}

// Service configurations
const serviceConfigs = {
  figma: {
    name: 'Figma',
    baseURL: 'https://api.figma.com/v1',
    authHeader: (apiKey) => ({ 'X-Figma-Token': apiKey }),
    credentialField: 'api_key',
    endpoints: {
      me: '/me',
      files: '/me/files',
      teams: '/teams',
      fileDetails: (fileKey) => `/files/${fileKey}`,
      fileComments: (fileKey) => `/files/${fileKey}/comments`,
      teamProjects: (teamId) => `/teams/${teamId}/projects`,
      projectFiles: (projectId) => `/projects/${projectId}/files`
    },
    customHandlers: {
      files: async (config, apiKey) => {
        const results = {
          user_info: null,
          files: [],
          available_endpoints: [],
          errors: []
        };

        // Get user info
        try {
          const userResponse = await fetch(`${config.baseURL}/me`, {
            headers: config.authHeader(apiKey)
          });
          if (userResponse.ok) {
            results.user_info = await userResponse.json();
            results.available_endpoints.push('/me - ✅ Available');
          }
        } catch (error) {
          results.errors.push('Failed to get user info: ' + error.message);
        }

        // Try different file endpoints
        const endpoints = [
          { name: 'Recent Files', url: `${config.baseURL}/me/files` },
          { name: 'Teams', url: `${config.baseURL}/teams` }
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint.url, {
              headers: config.authHeader(apiKey)
            });
            
            if (response.ok) {
              const data = await response.json();
              results.available_endpoints.push(`${endpoint.name} - ✅ Available`);
              
              if (endpoint.name === 'Recent Files' && data.files) {
                results.files = results.files.concat(data.files);
              }
            } else {
              results.available_endpoints.push(`${endpoint.name} - ❌ ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            results.errors.push(`${endpoint.name}: ${error.message}`);
          }
        }

        return {
          ...results,
          totalFiles: results.files.length,
          note: results.files.length === 0 ? 
            'No files found. This might be due to API token permissions or account having no recent files.' : 
            undefined
        };
      }
    }
  },

  github: {
    name: 'GitHub',
    baseURL: 'https://api.github.com',
    authHeader: (token) => ({ 
      'Authorization': `token ${token}`,
      'User-Agent': 'MCP-Server'
    }),
    credentialField: 'personal_access_token',
    endpoints: {
      me: '/user',
      repos: '/user/repos',
      issues: '/issues',
      notifications: '/notifications',
      repoDetails: (owner, repo) => `/repos/${owner}/${repo}`,
      repoIssues: (owner, repo) => `/repos/${owner}/${repo}/issues`,
      repoPulls: (owner, repo) => `/repos/${owner}/${repo}/pulls`
    },
    customHandlers: {
      repos: async (config, token) => {
        const response = await fetch(`${config.baseURL}/user/repos?per_page=100`, {
          headers: config.authHeader(token)
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const repos = await response.json();
        return {
          repositories: repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            private: repo.private,
            url: repo.html_url,
            clone_url: repo.clone_url,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated_at: repo.updated_at
          })),
          totalCount: repos.length
        };
      }
    }
  },

  gmail: {
    name: 'Gmail',
    baseURL: 'https://gmail.googleapis.com/gmail/v1',
    authHeader: (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` }),
    credentialField: 'api_key',
    endpoints: {
      profile: '/users/me/profile',
      messages: '/users/me/messages',
      labels: '/users/me/labels',
      messageDetails: (messageId) => `/users/me/messages/${messageId}`
    },
    customHandlers: {
      messages: async (config, apiKey) => {
        // Gmail requires OAuth2, so this is a placeholder
        return {
          note: 'Gmail API requires OAuth2 authentication flow',
          oauth_required: true,
          setup_url: 'https://developers.google.com/gmail/api/quickstart'
        };
      }
    }
  }
};

// Validate service type and credentials
if (!mcpType || !serviceConfigs[mcpType]) {
  console.error(`Unsupported MCP type: ${mcpType}`);
  process.exit(1);
}

const serviceConfig = serviceConfigs[mcpType];
const apiKey = credentials[serviceConfig.credentialField];

if (!apiKey) {
  console.error(`No ${serviceConfig.credentialField} provided in credentials`);
  process.exit(1);
}

app.use(express.json());

// Create router for MCP endpoints with service-specific path
const mcpRouter = express.Router();

// MCP Protocol: Server info and capabilities discovery
mcpRouter.get('/info', (req, res) => {
  res.json({
    name: `${serviceConfig.name} MCP Server`,
    version: "1.0.0",
    description: `Model Context Protocol server for ${serviceConfig.name} API integration`,
    author: "MiniMCP System",
    license: "MIT",
    homepage: `http://localhost:${port}`,
    repository: {
      type: "mcp-server",
      service: mcpType
    }
  });
});

// MCP Protocol: List all available tools (actions)
mcpRouter.get('/tools', (req, res) => {
  const tools = [];
  
  // Generate tools based on service configuration
  Object.keys(serviceConfig.endpoints).forEach(endpoint => {
    switch (endpoint) {
      case 'me':
        tools.push({
          name: `get_${mcpType}_user_info`,
          description: `Get current user information from ${serviceConfig.name}`,
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        });
        break;
      case 'files':
        tools.push({
          name: `list_${mcpType}_files`,
          description: `List files from ${serviceConfig.name}`,
          inputSchema: {
            type: "object", 
            properties: {},
            required: []
          }
        });
        break;
      case 'repos':
        tools.push({
          name: `list_${mcpType}_repositories`,
          description: `List repositories from ${serviceConfig.name}`,
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        });
        break;
    }
  });

  res.json({ tools });
});

// MCP Protocol: List all available resources (data sources)
mcpRouter.get('/resources', (req, res) => {
  const resources = [];
  
  // Generate resources based on service configuration
  Object.keys(serviceConfig.endpoints).forEach(endpoint => {
    switch (endpoint) {
      case 'me':
        resources.push({
          uri: `${mcpType}://user/profile`,
          name: `${serviceConfig.name} User Profile`,
          description: `Current user's ${serviceConfig.name} profile information`,
          mimeType: "application/json"
        });
        break;
      case 'files':
        resources.push({
          uri: `${mcpType}://files/list`,
          name: `${serviceConfig.name} Files`,
          description: `List of files in ${serviceConfig.name}`,
          mimeType: "application/json"
        });
        break;
      case 'repos':
        resources.push({
          uri: `${mcpType}://repositories/list`,
          name: `${serviceConfig.name} Repositories`,
          description: `List of repositories in ${serviceConfig.name}`,
          mimeType: "application/json"
        });
        break;
    }
  });

  res.json({ resources });
});

// MCP Protocol: Execute tools
mcpRouter.post('/tools/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const { arguments: args = {} } = req.body;

    // Route tool calls to appropriate endpoints
    if (toolName === `get_${mcpType}_user_info`) {
      const userInfo = await fetch(`${serviceConfig.baseURL}${serviceConfig.endpoints.me}`, {
        headers: serviceConfig.authHeader(apiKey)
      });
      const data = await userInfo.json();
      return res.json({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });
    }

    if (toolName === `list_${mcpType}_files`) {
      if (serviceConfig.customHandlers && serviceConfig.customHandlers.files) {
        const result = await serviceConfig.customHandlers.files(serviceConfig, apiKey);
        return res.json({ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
      }
    }

    if (toolName === `list_${mcpType}_repositories`) {
      if (serviceConfig.customHandlers && serviceConfig.customHandlers.repos) {
        const result = await serviceConfig.customHandlers.repos(serviceConfig, apiKey);
        return res.json({ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
      }
    }

    res.status(404).json({ error: `Tool ${toolName} not found` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCP Protocol: Get resource content
mcpRouter.get('/resources/*', async (req, res) => {
  try {
    const resourcePath = req.params[0];
    
    if (resourcePath === `${mcpType}/user/profile`) {
      const userInfo = await fetch(`${serviceConfig.baseURL}${serviceConfig.endpoints.me}`, {
        headers: serviceConfig.authHeader(apiKey)
      });
      const data = await userInfo.json();
      return res.json({ contents: [{ uri: `${mcpType}://user/profile`, mimeType: "application/json", text: JSON.stringify(data, null, 2) }] });
    }

    res.status(404).json({ error: `Resource ${resourcePath} not found` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User info endpoint  
mcpRouter.get('/me', async (req, res) => {
  try {
    const response = await fetch(`${serviceConfig.baseURL}${serviceConfig.endpoints.me}`, {
      headers: serviceConfig.authHeader(apiKey)
    });

    if (!response.ok) {
      throw new Error(`${serviceConfig.name} API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info: ' + error.message });
  }
});

// Generic endpoint handler
mcpRouter.get('/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    
    // Check if there's a custom handler
    if (serviceConfig.customHandlers && serviceConfig.customHandlers[endpoint]) {
      const result = await serviceConfig.customHandlers[endpoint](serviceConfig, apiKey);
      return res.json(result);
    }

    // Check if endpoint exists in configuration
    if (!serviceConfig.endpoints[endpoint]) {
      return res.status(404).json({ 
        error: `Endpoint '${endpoint}' not supported for ${serviceConfig.name}`,
        available_endpoints: Object.keys(serviceConfig.endpoints)
      });
    }

    // Make API call
    const endpointPath = serviceConfig.endpoints[endpoint];
    const url = `${serviceConfig.baseURL}${endpointPath}`;
    
    const response = await fetch(url, {
      headers: serviceConfig.authHeader(apiKey)
    });

    if (!response.ok) {
      throw new Error(`${serviceConfig.name} API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error fetching ${req.params.endpoint}:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.endpoint}: ` + error.message });
  }
});

// Parameterized endpoints (e.g., /files/filekey, /repos/owner/repo)
mcpRouter.get('/:endpoint/*', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const pathParams = req.params[0].split('/');
    
    // Handle different parameterized endpoints
    let endpointPath;
    let url;

    switch (endpoint) {
      case 'files':
        if (mcpType === 'figma') {
          const fileKey = pathParams[0];
          if (pathParams[1] === 'comments') {
            endpointPath = serviceConfig.endpoints.fileComments(fileKey);
          } else {
            endpointPath = serviceConfig.endpoints.fileDetails(fileKey);
          }
          url = `${serviceConfig.baseURL}${endpointPath}`;
        }
        break;
        
      case 'repos':
        if (mcpType === 'github' && pathParams.length >= 2) {
          const [owner, repo, ...rest] = pathParams;
          if (rest.length === 0) {
            endpointPath = serviceConfig.endpoints.repoDetails(owner, repo);
          } else if (rest[0] === 'issues') {
            endpointPath = serviceConfig.endpoints.repoIssues(owner, repo);
          } else if (rest[0] === 'pulls') {
            endpointPath = serviceConfig.endpoints.repoPulls(owner, repo);
          }
          url = `${serviceConfig.baseURL}${endpointPath}`;
        }
        break;
        
      default:
        return res.status(404).json({ 
          error: `Parameterized endpoint '${endpoint}' not supported`,
          service: serviceConfig.name
        });
    }

    if (!url) {
      return res.status(400).json({ 
        error: `Invalid parameters for ${endpoint} endpoint`,
        service: serviceConfig.name
      });
    }

    const response = await fetch(url, {
      headers: serviceConfig.authHeader(apiKey)
    });

    if (!response.ok) {
      throw new Error(`${serviceConfig.name} API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error fetching ${req.params.endpoint}:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.endpoint}: ` + error.message });
  }
});

// Mount the MCP router with service-specific path
app.use(`/mcp/${mcpType}`, mcpRouter);

// Health check endpoint (outside the MCP router)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: serviceConfig.name,
    mcpId,
    mcpType,
    userId,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`${serviceConfig.name} MCP server running on port ${port}`);
  console.log(`MCP ID: ${mcpId}`);
  console.log(`User ID: ${userId}`);
  console.log(`Service: ${serviceConfig.name}`);
  console.log(`API Key configured: ${apiKey ? 'Yes' : 'No'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`Received SIGTERM, shutting down ${serviceConfig.name} MCP server gracefully`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`Received SIGINT, shutting down ${serviceConfig.name} MCP server`);
  process.exit(0);
});