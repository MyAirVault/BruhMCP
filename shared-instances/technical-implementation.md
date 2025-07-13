# Technical Implementation Details

## Core Components

### 1. Service Registry (`backend/src/services/serviceRegistry.js`)

```javascript
/**
 * Central registry for all MCP services
 * Consolidates service configurations and metadata
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.loadServices();
  }

  /**
   * Load all service configurations from mcp-ports
   */
  loadServices() {
    // Read all mcp-ports/*/config.json files
    // Populate this.services with service metadata
  }

  /**
   * Get service configuration by type
   */
  getService(serviceType) {
    return this.services.get(serviceType);
  }

  /**
   * Get all available services
   */
  getAllServices() {
    return Array.from(this.services.values());
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(serviceType) {
    return this.services.has(serviceType) && this.isServiceHealthy(serviceType);
  }
}
```

### 2. Instance Manager (`backend/src/services/instanceManager.js`)

```javascript
/**
 * Manages user service instances and authentication
 */
class InstanceManager {
  /**
   * Create new service instance for user
   */
  async createInstance(userId, serviceType, apiKey) {
    // 1. Validate API key with external service
    // 2. Generate unique instance ID
    // 3. Encrypt and store credentials
    // 4. Return instance URL
  }

  /**
   * Generate unique instance identifier
   */
  generateInstanceId(userId, serviceType) {
    const prefix = this.getServicePrefix(serviceType);
    const userHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 8);
    const random = crypto.randomBytes(3).toString('hex');
    return `${prefix}_user_${userHash}_${random}`;
  }

  /**
   * Resolve instance to user context
   */
  async resolveInstance(instanceId) {
    // Query database for instance details
    // Return user ID and service credentials
  }

  /**
   * Validate user has access to instance
   */
  async validateAccess(instanceId, userId) {
    // Verify instance belongs to user
    // Check if instance is active
  }
}
```

### 3. Universal MCP Server Updates (`backend/src/mcp-servers/universal-mcp-server.js`)

```javascript
/**
 * Updated universal server for shared instance mode
 */
class UniversalMCPServer {
  constructor() {
    this.serviceType = process.env.MCP_TYPE;
    this.port = process.env.PORT;
    this.mode = process.env.SERVICE_MODE; // 'shared' or 'dynamic'
    this.instanceManager = new InstanceManager();
  }

  /**
   * Initialize server in shared mode
   */
  async initializeSharedMode() {
    // Set up routes for instance-based requests
    this.app.use('/:instanceId/*', this.instanceMiddleware.bind(this));
    this.app.use('/:instanceId/*', this.loadServiceRoutes.bind(this));
  }

  /**
   * Middleware to extract and validate instance context
   */
  async instanceMiddleware(req, res, next) {
    const { instanceId } = req.params;
    
    try {
      // Resolve instance to user context
      const context = await this.instanceManager.resolveInstance(instanceId);
      
      // Inject user context into request
      req.userContext = context;
      req.serviceCredentials = context.credentials;
      
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid instance' });
    }
  }

  /**
   * Load service-specific routes with user context
   */
  loadServiceRoutes(req, res, next) {
    // Load service routes with injected credentials
    // Pass user context to service handlers
  }
}
```

### 4. Instance Authentication Middleware (`backend/src/middleware/instanceAuth.js`)

```javascript
/**
 * Authentication middleware for instance-based requests
 */
const instanceAuth = async (req, res, next) => {
  const instanceId = req.params.instanceId;
  
  if (!instanceId) {
    return res.status(400).json({ error: 'Instance ID required' });
  }

  try {
    // Extract user from JWT token or session
    const userId = req.user?.id;
    
    // Validate instance access
    const hasAccess = await instanceManager.validateAccess(instanceId, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Resolve instance context
    const context = await instanceManager.resolveInstance(instanceId);
    req.instanceContext = context;
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};
```

### 5. Credential Manager (`backend/src/services/credentialManager.js`)

```javascript
/**
 * Manages encrypted storage of user service credentials
 */
class CredentialManager {
  /**
   * Encrypt and store API credentials
   */
  async storeCredentials(userId, serviceType, credentials) {
    const encrypted = this.encrypt(JSON.stringify(credentials));
    
    await db.query(`
      INSERT INTO user_service_instances (user_id, service_type, encrypted_api_key)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, service_type) 
      DO UPDATE SET encrypted_api_key = $3, updated_at = NOW()
    `, [userId, serviceType, encrypted]);
  }

  /**
   * Retrieve and decrypt credentials
   */
  async getCredentials(userId, serviceType) {
    const result = await db.query(`
      SELECT encrypted_api_key FROM user_service_instances
      WHERE user_id = $1 AND service_type = $2 AND is_active = true
    `, [userId, serviceType]);

    if (!result.rows[0]) {
      throw new Error('No credentials found');
    }

    const decrypted = this.decrypt(result.rows[0].encrypted_api_key);
    return JSON.parse(decrypted);
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedText) {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

## API Endpoints

### 1. Service Authentication (`backend/src/routes/serviceAuth.js`)

```javascript
/**
 * POST /api/v1/services/:serviceType/authenticate
 * Store user's API key for a service
 */
router.post('/:serviceType/authenticate', async (req, res) => {
  const { serviceType } = req.params;
  const { apiKey, additionalCredentials } = req.body;
  const userId = req.user.id;

  try {
    // Validate API key with external service
    const isValid = await serviceValidator.validate(serviceType, apiKey);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid API key' });
    }

    // Create service instance
    const instance = await instanceManager.createInstance(
      userId, 
      serviceType, 
      { apiKey, ...additionalCredentials }
    );

    res.json({
      instanceId: instance.instanceId,
      instanceUrl: `${process.env.BASE_URL}/${instance.instanceId}/${serviceType}`,
      message: 'Service authenticated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * GET /api/v1/services/:serviceType/instance
 * Get user's instance URL for a service
 */
router.get('/:serviceType/instance', async (req, res) => {
  const { serviceType } = req.params;
  const userId = req.user.id;

  try {
    const instance = await instanceManager.getUserInstance(userId, serviceType);
    
    if (!instance) {
      return res.status(404).json({ error: 'No instance found' });
    }

    res.json({
      instanceId: instance.instanceId,
      instanceUrl: `${process.env.BASE_URL}/${instance.instanceId}/${serviceType}`,
      isActive: instance.isActive,
      lastUsed: instance.lastUsedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve instance' });
  }
});
```

### 2. Instance Management (`backend/src/routes/instances.js`)

```javascript
/**
 * GET /api/v1/user/instances
 * List all user's service instances
 */
router.get('/instances', async (req, res) => {
  const userId = req.user.id;

  try {
    const instances = await instanceManager.getUserInstances(userId);
    
    const response = instances.map(instance => ({
      serviceType: instance.serviceType,
      instanceId: instance.instanceId,
      instanceUrl: `${process.env.BASE_URL}/${instance.instanceId}/${instance.serviceType}`,
      isActive: instance.isActive,
      createdAt: instance.createdAt,
      lastUsedAt: instance.lastUsedAt
    }));

    res.json({ instances: response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve instances' });
  }
});

/**
 * DELETE /api/v1/services/:serviceType/instance
 * Remove user's access to a service
 */
router.delete('/:serviceType/instance', async (req, res) => {
  const { serviceType } = req.params;
  const userId = req.user.id;

  try {
    await instanceManager.removeInstance(userId, serviceType);
    res.json({ message: 'Service access removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove service access' });
  }
});
```

## PM2 Configuration Generation

### Script: `scripts/generate-pm2-config.js`

```javascript
/**
 * Generate PM2 ecosystem configuration from service registry
 */
const fs = require('fs');
const path = require('path');
const ServiceRegistry = require('../backend/src/services/serviceRegistry');

async function generatePM2Config() {
  const registry = new ServiceRegistry();
  const services = registry.getAllServices();

  const ecosystem = {
    apps: [
      // Main API server
      {
        name: 'main-api',
        script: 'backend/src/index.js',
        env: {
          NODE_ENV: 'production',
          PORT: 3000
        }
      }
    ]
  };

  // Add MCP services
  services.forEach(service => {
    ecosystem.apps.push({
      name: `mcp-${service.name}`,
      script: 'backend/src/mcp-servers/universal-mcp-server.js',
      env: {
        MCP_TYPE: service.name,
        PORT: service.port,
        SERVICE_MODE: 'shared',
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 5
    });
  });

  // Write ecosystem file
  const configPath = path.join(__dirname, '..', 'ecosystem.config.js');
  const configContent = `module.exports = ${JSON.stringify(ecosystem, null, 2)};`;
  
  fs.writeFileSync(configPath, configContent);
  console.log(`Generated PM2 config with ${services.length} services`);
}

generatePM2Config().catch(console.error);
```

## Service Health Monitoring

### Health Check System (`backend/src/services/healthMonitor.js`)

```javascript
/**
 * Monitor health of all static services
 */
class HealthMonitor {
  constructor() {
    this.serviceRegistry = new ServiceRegistry();
    this.healthInterval = 30000; // 30 seconds
    this.healthChecks = new Map();
  }

  /**
   * Start monitoring all services
   */
  startMonitoring() {
    const services = this.serviceRegistry.getAllServices();
    
    services.forEach(service => {
      this.scheduleHealthCheck(service);
    });
  }

  /**
   * Check if service is responding
   */
  async checkServiceHealth(service) {
    try {
      const response = await fetch(`http://localhost:${service.port}/health`);
      const isHealthy = response.ok;
      
      this.healthChecks.set(service.name, {
        isHealthy,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime
      });

      return isHealthy;
    } catch (error) {
      this.healthChecks.set(service.name, {
        isHealthy: false,
        lastCheck: new Date(),
        error: error.message
      });
      
      return false;
    }
  }

  /**
   * Get health status for all services
   */
  getHealthStatus() {
    return Object.fromEntries(this.healthChecks);
  }
}
```

## Request Flow Example

### Figma Service Request Processing

```javascript
// 1. User request comes in
GET /fig_user_a_abc123/figma/get-file/12345

// 2. Instance middleware extracts context
const instanceId = 'fig_user_a_abc123';
const context = await instanceManager.resolveInstance(instanceId);
// context = { userId: 'user_a_uuid', serviceType: 'figma', credentials: {...} }

// 3. Service processes request with user credentials
const figmaAPI = new FigmaAPI(context.credentials.apiKey);
const fileData = await figmaAPI.getFile('12345');

// 4. Response returned with user isolation
return {
  status: 'success',
  data: fileData,
  userId: context.userId // for audit logging
};
```

## Error Handling

### Service Error Patterns

```javascript
/**
 * Standardized error handling for shared services
 */
class ServiceErrorHandler {
  static handleInstanceError(error, instanceId) {
    switch (error.type) {
      case 'INVALID_INSTANCE':
        return { status: 401, message: 'Invalid instance ID' };
      
      case 'EXPIRED_CREDENTIALS':
        return { status: 401, message: 'API credentials expired' };
      
      case 'SERVICE_UNAVAILABLE':
        return { status: 503, message: 'Service temporarily unavailable' };
      
      case 'RATE_LIMIT_EXCEEDED':
        return { status: 429, message: 'Rate limit exceeded for this service' };
      
      default:
        return { status: 500, message: 'Internal service error' };
    }
  }
}
```

## Performance Optimizations

### Connection Pooling

```javascript
/**
 * Shared connection pools for external APIs
 */
class ConnectionPoolManager {
  constructor() {
    this.pools = new Map();
  }

  /**
   * Get or create connection pool for service
   */
  getPool(serviceType) {
    if (!this.pools.has(serviceType)) {
      this.pools.set(serviceType, this.createPool(serviceType));
    }
    return this.pools.get(serviceType);
  }

  createPool(serviceType) {
    const service = serviceRegistry.getService(serviceType);
    return new ConnectionPool({
      baseURL: service.api.baseURL,
      maxConnections: 50,
      timeout: 30000
    });
  }
}
```

### Caching Strategy

```javascript
/**
 * Service-specific caching for frequently accessed data
 */
class ServiceCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 300000; // 5 minutes
  }

  /**
   * Cache service response with user isolation
   */
  set(userId, serviceType, key, data) {
    const cacheKey = `${userId}:${serviceType}:${key}`;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached data with TTL check
   */
  get(userId, serviceType, key) {
    const cacheKey = `${userId}:${serviceType}:${key}`;
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }
}
```