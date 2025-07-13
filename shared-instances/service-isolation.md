# Service Isolation Patterns

## Overview
This document describes the security and isolation patterns used in the shared instances architecture to ensure complete user data separation while maintaining resource efficiency.

## Core Isolation Principles

### 1. Instance-Based Authentication
Every user request is authenticated through a unique instance identifier that maps to their service credentials and context.

### 2. Request-Level Context Injection
User context is injected into each request at the middleware level, ensuring service handlers always operate with the correct user credentials.

### 3. Data Boundary Enforcement
Strict enforcement of user data boundaries at the application level, with no shared data structures between users.

### 4. Credential Isolation
Each user's API credentials are encrypted and stored separately, with no cross-user access possible.

## Isolation Architecture

### Request Flow with Isolation
```
User LLM Request
↓
Instance URL: /fig_user_a_abc123/figma/get-file/12345
↓
Instance Middleware: Extract instance_id = "fig_user_a_abc123"
↓
Context Resolution: Map to user_id = "user_a_uuid"
↓
Credential Injection: Load User A's Figma API key
↓
Service Processing: Execute with User A's context only
↓
Response Isolation: Return data tagged with user context
```

### Multi-User Scenario
```
User A: /fig_user_a_abc123/figma/* → User A's API key → User A's data
User B: /fig_user_b_def456/figma/* → User B's API key → User B's data
User C: /fig_user_c_ghi789/figma/* → User C's API key → User C's data

All processed by same Figma service, completely isolated
```

## Implementation Patterns

### 1. Instance Middleware Pattern

```javascript
/**
 * Core isolation middleware - extracts and validates user context
 */
async function instanceIsolationMiddleware(req, res, next) {
  const instanceId = req.params.instanceId;
  
  try {
    // 1. Parse instance ID to extract user context
    const context = await parseInstanceId(instanceId);
    
    // 2. Validate instance belongs to authenticated user
    await validateInstanceOwnership(context.userId, req.user?.id);
    
    // 3. Load user's service credentials
    const credentials = await loadUserCredentials(context.userId, context.serviceType);
    
    // 4. Inject isolated context into request
    req.isolatedContext = {
      userId: context.userId,
      serviceType: context.serviceType,
      instanceId: instanceId,
      credentials: credentials,
      timestamp: Date.now()
    };
    
    // 5. Set up request tracking for audit
    req.requestId = generateRequestId(instanceId);
    
    next();
  } catch (error) {
    // Isolation failure - deny access
    return res.status(403).json({ 
      error: 'Access denied - invalid instance context',
      requestId: req.requestId 
    });
  }
}
```

### 2. Credential Injection Pattern

```javascript
/**
 * Service-specific credential injection
 */
class FigmaServiceHandler {
  async handleRequest(req, res) {
    // Extract isolated context from middleware
    const { credentials, userId } = req.isolatedContext;
    
    // Create service client with user's credentials
    const figmaClient = new FigmaAPI({
      apiKey: credentials.apiKey,
      // Ensure all requests are tagged with user context
      userContext: userId,
      requestId: req.requestId
    });
    
    try {
      // Execute request with user's isolated context
      const result = await figmaClient.getFile(req.params.fileId);
      
      // Log usage for this specific user
      await logServiceUsage({
        userId,
        serviceType: 'figma',
        instanceId: req.isolatedContext.instanceId,
        endpoint: `/get-file/${req.params.fileId}`,
        status: 'success'
      });
      
      // Return response with user context for audit
      res.json({
        data: result,
        meta: {
          userId: userId,
          requestId: req.requestId,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      // Handle service errors with user context
      await logServiceError({
        userId,
        serviceType: 'figma',
        instanceId: req.isolatedContext.instanceId,
        error: error.message
      });
      
      res.status(500).json({
        error: 'Service request failed',
        requestId: req.requestId
      });
    }
  }
}
```

### 3. Data Boundary Enforcement

```javascript
/**
 * Data access control layer
 */
class DataBoundaryEnforcer {
  /**
   * Ensure user can only access their own service data
   */
  async enforceUserDataBoundary(requestContext, dataQuery) {
    // Validate that all data queries include user context
    if (!dataQuery.userId || dataQuery.userId !== requestContext.userId) {
      throw new SecurityError('Cross-user data access attempted');
    }
    
    // Validate service type matches
    if (dataQuery.serviceType !== requestContext.serviceType) {
      throw new SecurityError('Cross-service data access attempted');
    }
    
    // Validate instance ownership
    if (dataQuery.instanceId !== requestContext.instanceId) {
      throw new SecurityError('Instance ownership violation');
    }
    
    return true;
  }
  
  /**
   * Filter responses to ensure no cross-user data leakage
   */
  filterResponseData(data, userContext) {
    // Remove any system-level information
    const filtered = {
      ...data,
      // Remove internal system fields
      systemInfo: undefined,
      internalMetadata: undefined
    };
    
    // Add user context to response for audit
    filtered._userContext = {
      userId: userContext.userId,
      serviceType: userContext.serviceType,
      instanceId: userContext.instanceId
    };
    
    return filtered;
  }
}
```

## Security Patterns

### 1. Instance ID Security

```javascript
/**
 * Secure instance ID generation and validation
 */
class InstanceSecurityManager {
  /**
   * Generate cryptographically secure instance ID
   */
  generateSecureInstanceId(userId, serviceType) {
    // Service prefix for easy identification
    const prefix = this.getServicePrefix(serviceType);
    
    // User identifier (hashed for privacy)
    const userHash = crypto
      .createHash('sha256')
      .update(userId + process.env.INSTANCE_SALT)
      .digest('hex')
      .substring(0, 12);
    
    // Random component for uniqueness
    const random = crypto.randomBytes(8).toString('hex');
    
    // Timestamp component for ordering
    const timestamp = Date.now().toString(36);
    
    return `${prefix}_${userHash}_${timestamp}_${random}`;
  }
  
  /**
   * Validate instance ID structure and ownership
   */
  async validateInstanceId(instanceId, authenticatedUserId) {
    // Parse instance ID components
    const parts = instanceId.split('_');
    if (parts.length !== 4) {
      throw new SecurityError('Invalid instance ID format');
    }
    
    const [prefix, userHash, timestamp, random] = parts;
    
    // Validate service prefix
    const serviceType = this.getServiceTypeFromPrefix(prefix);
    if (!serviceType) {
      throw new SecurityError('Invalid service prefix');
    }
    
    // Validate user ownership
    const expectedHash = crypto
      .createHash('sha256')
      .update(authenticatedUserId + process.env.INSTANCE_SALT)
      .digest('hex')
      .substring(0, 12);
    
    if (userHash !== expectedHash) {
      throw new SecurityError('Instance ownership violation');
    }
    
    return {
      serviceType,
      userId: authenticatedUserId,
      timestamp: parseInt(timestamp, 36),
      random
    };
  }
}
```

### 2. Credential Security

```javascript
/**
 * Secure credential management with isolation
 */
class SecureCredentialManager {
  /**
   * Encrypt and store user credentials with isolation
   */
  async storeUserCredentials(userId, serviceType, credentials) {
    // Generate user-specific encryption key
    const userKey = this.deriveUserKey(userId, serviceType);
    
    // Encrypt credentials with user-specific key
    const encrypted = this.encrypt(JSON.stringify(credentials), userKey);
    
    // Store with user and service context
    await db.query(`
      INSERT INTO user_service_instances (
        instance_id, user_id, service_type, encrypted_api_key
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, service_type)
      DO UPDATE SET 
        encrypted_api_key = $4,
        updated_at = NOW()
    `, [
      await this.generateInstanceId(userId, serviceType),
      userId,
      serviceType,
      encrypted
    ]);
  }
  
  /**
   * Retrieve and decrypt user credentials with validation
   */
  async getUserCredentials(userId, serviceType, requestContext) {
    // Validate request context matches user
    if (requestContext.userId !== userId) {
      throw new SecurityError('User context mismatch');
    }
    
    // Retrieve encrypted credentials
    const result = await db.query(`
      SELECT encrypted_api_key, instance_id
      FROM user_service_instances
      WHERE user_id = $1 AND service_type = $2 AND is_active = true
    `, [userId, serviceType]);
    
    if (!result.rows[0]) {
      throw new SecurityError('No credentials found for user');
    }
    
    // Derive user-specific decryption key
    const userKey = this.deriveUserKey(userId, serviceType);
    
    // Decrypt and return credentials
    const decrypted = this.decrypt(result.rows[0].encrypted_api_key, userKey);
    
    return {
      credentials: JSON.parse(decrypted),
      instanceId: result.rows[0].instance_id
    };
  }
  
  /**
   * Generate user-specific encryption key
   */
  deriveUserKey(userId, serviceType) {
    return crypto
      .createHmac('sha256', process.env.MASTER_KEY)
      .update(`${userId}:${serviceType}:${process.env.KEY_SALT}`)
      .digest();
  }
}
```

### 3. Request Isolation Audit

```javascript
/**
 * Comprehensive audit logging for isolation validation
 */
class IsolationAuditLogger {
  /**
   * Log all requests with isolation context
   */
  async logRequest(req, res, next) {
    const requestLog = {
      requestId: req.requestId,
      userId: req.isolatedContext?.userId,
      serviceType: req.isolatedContext?.serviceType,
      instanceId: req.isolatedContext?.instanceId,
      endpoint: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      timestamp: new Date(),
      headers: this.sanitizeHeaders(req.headers)
    };
    
    // Store request log
    await this.storeAuditLog('request', requestLog);
    
    // Monitor for isolation violations
    this.monitorIsolationViolations(requestLog);
    
    next();
  }
  
  /**
   * Monitor for potential isolation violations
   */
  monitorIsolationViolations(requestLog) {
    // Check for suspicious patterns
    const violations = [];
    
    // Multiple users from same IP in short time
    if (this.detectUserSwitching(requestLog)) {
      violations.push('potential_user_switching');
    }
    
    // Cross-service access attempts
    if (this.detectCrossServiceAccess(requestLog)) {
      violations.push('cross_service_access');
    }
    
    // Unusual request patterns
    if (this.detectAnomalousPatterns(requestLog)) {
      violations.push('anomalous_patterns');
    }
    
    if (violations.length > 0) {
      this.alertSecurityTeam({
        violations,
        requestLog,
        severity: 'medium'
      });
    }
  }
}
```

## Isolation Testing Patterns

### 1. Unit Tests for Isolation

```javascript
/**
 * Test cases for user isolation
 */
describe('Service Isolation', () => {
  describe('Instance Middleware', () => {
    it('should isolate user contexts completely', async () => {
      // Create two different users
      const userA = await createTestUser('user-a');
      const userB = await createTestUser('user-b');
      
      // Create instances for both users
      const instanceA = await createServiceInstance(userA.id, 'figma');
      const instanceB = await createServiceInstance(userB.id, 'figma');
      
      // Test that User A cannot access User B's instance
      const response = await request(app)
        .get(`/${instanceB.instanceId}/figma/files`)
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(403);
      
      expect(response.body.error).toContain('Access denied');
    });
    
    it('should prevent cross-service access', async () => {
      const user = await createTestUser('test-user');
      const figmaInstance = await createServiceInstance(user.id, 'figma');
      
      // Attempt to access GitHub endpoint with Figma instance
      const response = await request(app)
        .get(`/${figmaInstance.instanceId}/github/repos`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(403);
      
      expect(response.body.error).toContain('Service type mismatch');
    });
  });
  
  describe('Credential Isolation', () => {
    it('should never leak credentials between users', async () => {
      const userA = await createTestUser('user-a');
      const userB = await createTestUser('user-b');
      
      // Store different API keys for both users
      await storeCredentials(userA.id, 'figma', { apiKey: 'key-a' });
      await storeCredentials(userB.id, 'figma', { apiKey: 'key-b' });
      
      // Verify User A gets their own key
      const credsA = await getCredentials(userA.id, 'figma');
      expect(credsA.apiKey).toBe('key-a');
      
      // Verify User B gets their own key
      const credsB = await getCredentials(userB.id, 'figma');
      expect(credsB.apiKey).toBe('key-b');
      
      // Verify no cross-contamination
      expect(credsA.apiKey).not.toBe(credsB.apiKey);
    });
  });
});
```

### 2. Integration Tests for Multi-User Scenarios

```javascript
/**
 * Integration tests for shared service usage
 */
describe('Multi-User Service Access', () => {
  it('should handle concurrent requests from different users', async () => {
    // Create multiple users
    const users = await Promise.all([
      createTestUser('user-1'),
      createTestUser('user-2'),
      createTestUser('user-3')
    ]);
    
    // Create instances for all users
    const instances = await Promise.all(
      users.map(user => createServiceInstance(user.id, 'figma'))
    );
    
    // Make concurrent requests
    const promises = instances.map((instance, index) =>
      request(app)
        .get(`/${instance.instanceId}/figma/files`)
        .set('Authorization', `Bearer ${users[index].token}`)
        .expect(200)
    );
    
    const responses = await Promise.all(promises);
    
    // Verify each user got their own data
    responses.forEach((response, index) => {
      expect(response.body.meta.userId).toBe(users[index].id);
      expect(response.body.data).toBeDefined();
    });
  });
  
  it('should maintain isolation under load', async () => {
    // Stress test with many concurrent users
    const userCount = 100;
    const requestsPerUser = 10;
    
    const users = await Promise.all(
      Array.from({ length: userCount }, (_, i) => createTestUser(`user-${i}`))
    );
    
    const instances = await Promise.all(
      users.map(user => createServiceInstance(user.id, 'figma'))
    );
    
    // Generate load
    const allPromises = [];
    for (let i = 0; i < userCount; i++) {
      for (let j = 0; j < requestsPerUser; j++) {
        allPromises.push(
          request(app)
            .get(`/${instances[i].instanceId}/figma/files`)
            .set('Authorization', `Bearer ${users[i].token}`)
        );
      }
    }
    
    const results = await Promise.allSettled(allPromises);
    
    // Verify no isolation violations
    const successful = results.filter(r => r.status === 'fulfilled');
    expect(successful.length).toBe(userCount * requestsPerUser);
    
    // Check audit logs for violations
    const violations = await getIsolationViolations();
    expect(violations.length).toBe(0);
  });
});
```

## Monitoring and Alerting

### 1. Isolation Monitoring Dashboard

```javascript
/**
 * Real-time monitoring for isolation violations
 */
class IsolationMonitor {
  /**
   * Monitor cross-user access attempts
   */
  async monitorCrossUserAccess() {
    const violations = await db.query(`
      SELECT 
        request_id,
        user_id,
        instance_id,
        attempted_user_id,
        timestamp
      FROM isolation_violation_logs
      WHERE violation_type = 'cross_user_access'
        AND timestamp > NOW() - INTERVAL '1 hour'
    `);
    
    if (violations.rows.length > 0) {
      await this.alertSecurityTeam({
        type: 'cross_user_access',
        count: violations.rows.length,
        violations: violations.rows
      });
    }
  }
  
  /**
   * Monitor for credential leakage
   */
  async monitorCredentialLeakage() {
    // Check for API keys appearing in logs or responses
    const suspiciousLogs = await db.query(`
      SELECT *
      FROM service_usage_analytics
      WHERE error_message LIKE '%key%'
        AND timestamp > NOW() - INTERVAL '15 minutes'
    `);
    
    if (suspiciousLogs.rows.length > 0) {
      await this.alertSecurityTeam({
        type: 'potential_credential_leakage',
        logs: suspiciousLogs.rows
      });
    }
  }
}
```

### 2. Isolation Health Metrics

```javascript
/**
 * Health metrics for isolation system
 */
const isolationMetrics = {
  // Total requests with proper isolation
  isolated_requests_total: new Counter({
    name: 'isolated_requests_total',
    help: 'Total requests processed with user isolation',
    labelNames: ['user_id', 'service_type', 'status']
  }),
  
  // Isolation violations detected
  isolation_violations_total: new Counter({
    name: 'isolation_violations_total',
    help: 'Total isolation violations detected',
    labelNames: ['violation_type', 'severity']
  }),
  
  // Request processing time with isolation
  isolation_request_duration: new Histogram({
    name: 'isolation_request_duration_seconds',
    help: 'Request processing time with isolation overhead',
    labelNames: ['service_type'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  })
};
```

## Best Practices

### 1. Development Guidelines
- Always validate user context in middleware
- Never pass raw user data between requests
- Encrypt all stored credentials
- Log all security-relevant events
- Test isolation boundaries regularly

### 2. Security Checklist
- [ ] Instance IDs are cryptographically secure
- [ ] User credentials are properly encrypted
- [ ] Cross-user access is prevented
- [ ] Audit logging captures all requests
- [ ] Security monitoring is active
- [ ] Isolation violations trigger alerts

### 3. Performance Considerations
- Cache credential lookups within request scope
- Use connection pooling for database access
- Implement request-level caching where safe
- Monitor isolation overhead
- Optimize middleware performance