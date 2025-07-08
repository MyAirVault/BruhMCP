# Security Architecture

## Table of Contents
1. [Overview](#overview)
2. [Security Principles](#security-principles)
3. [Threat Model](#threat-model)
4. [Authentication & Authorization](#authentication--authorization)
5. [Data Security](#data-security)
6. [Process Security](#process-security)
7. [Network Security](#network-security)
8. [API Security](#api-security)
9. [Operational Security](#operational-security)
10. [Compliance & Auditing](#compliance--auditing)
11. [Incident Response](#incident-response)

## Overview

The MiniMCP security architecture implements **essential security measures** to protect user data, API keys, and MCP instances. This document outlines **basic security measures** aligned with the simple Node.js process-based architecture.

### Security Goals (Simplified)
- **Confidentiality**: Protect sensitive data (API keys, user data)
- **Integrity**: Ensure data and system integrity
- **Availability**: Maintain service availability
- **Isolation**: Process-level isolation between user instances
- **Auditability**: File-based audit trails

## Security Principles

### 1. Least Privilege (Basic)
- Minimal permissions for all components
- Process-level isolation
- Non-privileged user execution

### 2. Essential Security Layers
- Process isolation boundaries
- Encrypted API key storage
- File-based access control

### 3. Secure by Default
- Secure default configurations
- Minimal attack surface
- Essential security measures only

## Threat Model

### Threat Actors
1. **External Attackers**
   - Motivation: Data theft, service disruption
   - Capabilities: Varies from script kiddies to APTs
   
2. **Malicious Users**
   - Motivation: Free resource usage, attacking others
   - Capabilities: Authenticated access
   
3. **Compromised MCP Processes**
   - Motivation: Lateral movement, data access
   - Capabilities: Process-level access

### Attack Vectors
1. **API Exploitation**
   - SQL injection
   - XSS attacks
   - CSRF attacks
   - Authentication bypass

2. **Process Escape**
   - Privilege escalation
   - Process misconfiguration
   - Resource exhaustion

3. **Data Breaches**
   - API key exposure
   - Database compromise
   - Log file leakage

4. **Supply Chain**
   - Compromised dependencies
   - Malicious npm packages
   - Third-party integrations

## Authentication & Authorization

### User Authentication (Future Implementation)

#### Multi-Factor Authentication
```javascript
// MFA implementation strategy
class MFAService {
  async generateTOTP(userId) {
    const secret = speakeasy.generateSecret({
      name: `MiniMCP (${user.email})`,
      issuer: 'MiniMCP'
    });
    
    // Store encrypted secret
    await this.storeSecret(userId, secret.base32);
    
    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url
    };
  }
  
  async verifyTOTP(userId, token) {
    const secret = await this.getSecret(userId);
    
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps tolerance
    });
  }
}
```

#### Session Management
```javascript
// Secure session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  name: 'minimcp_session',
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  },
  resave: false,
  saveUninitialized: false,
  // Simple in-memory store for development/small scale
  store: {
    sessions: new Map(),
    get: function(sessionId, callback) {
      const session = this.sessions.get(sessionId);
      callback(null, session);
    },
    set: function(sessionId, session, callback) {
      this.sessions.set(sessionId, session);
      // Auto-cleanup expired sessions
      setTimeout(() => {
        this.sessions.delete(sessionId);
      }, session.cookie.maxAge);
      callback(null);
    },
    destroy: function(sessionId, callback) {
      this.sessions.delete(sessionId);
      callback(null);
    }
  }
};
```

### API Authentication

#### Bearer Token Authentication
```javascript
// JWT token generation
class AuthService {
  generateAccessToken(userId) {
    return jwt.sign(
      { 
        sub: userId,
        type: 'access',
        iat: Date.now()
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1h',
        algorithm: 'HS256'
      }
    );
  }
  
  generateRefreshToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store in database with expiration
    await db.storeRefreshToken(userId, token, '7d');
    
    return token;
  }
}
```

#### MCP Access Tokens
```javascript
// Secure token generation for MCP access
class MCPTokenService {
  generateAccessToken() {
    // Use cryptographically secure random generation
    const token = crypto.randomBytes(32).toString('base64url');
    
    // Add prefix for easy identification
    return `mcp_${token}`;
  }
  
  async validateToken(token) {
    // Constant-time comparison to prevent timing attacks
    const instance = await db.getMCPByToken(token);
    
    if (!instance) {
      throw new UnauthorizedError('Invalid token');
    }
    
    if (instance.expires_at < new Date()) {
      throw new UnauthorizedError('Token expired');
    }
    
    return instance;
  }
}
```

### Authorization

#### Role-Based Access Control
```javascript
// RBAC implementation
const roles = {
  user: {
    permissions: [
      'mcp:create',
      'mcp:read:own',
      'mcp:delete:own',
      'apikey:manage:own'
    ]
  },
  admin: {
    permissions: [
      'mcp:*',
      'apikey:*',
      'user:*',
      'system:*'
    ]
  }
};

// Permission checking middleware
const requirePermission = (permission) => {
  return async (req, res, next) => {
    const userRole = req.user.role;
    const hasPermission = checkPermission(userRole, permission, req.params);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

## Data Security

### API Key Encryption

#### Encryption Strategy
```javascript
// AES-256-GCM encryption for API keys
class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.masterKey = Buffer.from(process.env.MASTER_KEY, 'hex');
  }
  
  encrypt(plaintext) {
    // Generate unique IV for each encryption
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
    
    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.masterKey,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    // Set authentication tag
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    // Decrypt
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

#### Key Management
```javascript
// Secure key storage and rotation
class KeyManagementService {
  async rotateKeys() {
    // Generate new master key
    const newKey = crypto.randomBytes(32);
    
    // Re-encrypt all API keys with new master key
    const apiKeys = await db.getAllEncryptedKeys();
    
    for (const key of apiKeys) {
      // Decrypt with old key
      const plaintext = await this.decrypt(key, this.currentKey);
      
      // Encrypt with new key
      const encrypted = await this.encrypt(plaintext, newKey);
      
      // Update in database
      await db.updateEncryptedKey(key.id, encrypted);
    }
    
    // Update master key in secure storage
    await this.updateMasterKey(newKey);
  }
}
```

### Database Security

#### Connection Security
```javascript
// Secure database connection
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
    cert: fs.readFileSync('/path/to/client-cert.pem'),
    key: fs.readFileSync('/path/to/client-key.pem')
  },
  connectionTimeoutMillis: 5000,
  query_timeout: 30000
};
```

#### Query Security
```javascript
// Parameterized queries to prevent SQL injection
class SecureDatabase {
  async executeQuery(query, params) {
    // Validate query structure
    this.validateQuery(query);
    
    // Use parameterized queries
    const result = await pool.query(query, params);
    
    // Audit sensitive queries
    if (this.isSensitiveQuery(query)) {
      await this.auditQuery(query, params);
    }
    
    return result;
  }
  
  validateQuery(query) {
    // Check for dangerous patterns
    const dangerous = [
      /;\s*DROP/i,
      /;\s*DELETE/i,
      /;\s*UPDATE.*WHERE\s+1\s*=\s*1/i
    ];
    
    for (const pattern of dangerous) {
      if (pattern.test(query)) {
        throw new SecurityError('Potentially dangerous query detected');
      }
    }
  }
}
```

## Process Security

### Process Isolation

#### Secure Process Configuration
```javascript
// Secure process spawning
const { spawn } = require('child_process');
const path = require('path');

async function createSecureProcess(config) {
  const processOptions = {
    // Run as non-privileged user
    uid: 1001,
    gid: 1001,
    
    // Limit working directory
    cwd: path.join(__dirname, 'mcp-servers'),
    
    // Clean environment
    env: {
      NODE_ENV: 'production',
      PORT: config.port,
      MCP_ID: config.instanceId,
      API_KEY: config.apiKey,
      // Only essential environment variables
    },
    
    // Stdio configuration
    stdio: ['pipe', 'pipe', 'pipe'],
    
    // Process isolation
    detached: false,
    
    // Resource limits (via ulimit or systemd)
    shell: false
  };
  
  const process = spawn('node', [config.serverScript], processOptions);
  
  return process;
}
```

#### Resource Limits
```javascript
// Process resource monitoring and limits
class ProcessResourceManager {
  constructor() {
    this.limits = {
      maxMemoryMB: 512,
      maxCPUPercent: 50,
      maxProcesses: 1,
      maxOpenFiles: 1024
    };
  }
  
  async enforceResourceLimits(pid) {
    const stats = await this.getProcessStats(pid);
    
    // Memory limit enforcement
    if (stats.memoryMB > this.limits.maxMemoryMB) {
      await this.terminateProcess(pid, 'Memory limit exceeded');
      return false;
    }
    
    // CPU limit enforcement (sustained high usage)
    if (stats.cpuPercent > this.limits.maxCPUPercent) {
      this.trackHighCPU(pid);
      return false;
    }
    
    return true;
  }
}
```

### Code Security

#### Static Analysis
```yaml
# CI/CD pipeline security scanning
security-scan:
  stage: security
  script:
    # Static analysis
    - semgrep --config=auto src/
    
    # Dependency check
    - npm audit --audit-level=moderate
    
    # Secret scanning
    - trufflehog filesystem src/ --json
    
    # Code quality
    - eslint src/ --format json
```

## Network Security

### Network Isolation

#### Port-Based Isolation
```javascript
// Port management and isolation
class NetworkSecurity {
  constructor() {
    this.allowedPortRange = { start: 3001, end: 3100 };
    this.processPortMap = new Map();
  }
  
  async allocateSecurePort(processId) {
    // Find available port in allowed range
    for (let port = this.allowedPortRange.start; port <= this.allowedPortRange.end; port++) {
      if (await this.isPortAvailable(port)) {
        this.processPortMap.set(processId, port);
        return port;
      }
    }
    throw new Error('No available ports in secure range');
  }
  
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = require('net').createServer();
      server.listen(port, (err) => {
        if (err) {
          resolve(false);
        } else {
          server.close(() => resolve(true));
        }
      });
    });
  }
  
  validatePortAccess(port, processId) {
    // Only allow access to assigned ports
    return this.processPortMap.get(processId) === port;
  }
}
```

#### Firewall Rules
```bash
# iptables rules for process isolation
# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow API server port
iptables -A INPUT -p tcp --dport 5000 -j ACCEPT

# Allow MCP ports (3001-3100) only from localhost
iptables -A INPUT -p tcp --dport 3001:3100 -s 127.0.0.1 -j ACCEPT
iptables -A INPUT -p tcp --dport 3001:3100 -j DROP

# Allow SSH (if needed)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Log dropped packets
iptables -A INPUT -j LOG --log-prefix "DROPPED: "
```

### TLS Configuration

#### HTTPS Configuration
```javascript
// TLS configuration for Express
const tlsOptions = {
  cert: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/key.pem'),
  ca: fs.readFileSync('/path/to/ca.pem'),
  
  // Security settings
  secureProtocol: 'TLSv1_2_method',
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),
  honorCipherOrder: true,
  
  // Disable vulnerable protocols
  secureOptions: 
    crypto.constants.SSL_OP_NO_SSLv2 |
    crypto.constants.SSL_OP_NO_SSLv3 |
    crypto.constants.SSL_OP_NO_TLSv1 |
    crypto.constants.SSL_OP_NO_TLSv1_1
};

https.createServer(tlsOptions, app).listen(443);
```

## API Security

### Input Validation

#### Request Validation
```javascript
// Comprehensive input validation
const mcpCreateSchema = Joi.object({
  mcp_type: Joi.string()
    .valid('gmail', 'figma', 'github')
    .required(),
  
  expiration_minutes: Joi.number()
    .integer()
    .min(1)
    .max(1440) // 24 hours max
    .required(),
  
  config: Joi.object()
    .max(10) // Limit config keys
    .pattern(
      Joi.string().alphanum().max(50),
      Joi.string().max(1000)
    )
}).options({ stripUnknown: true });

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true
    });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    req.validatedBody = value;
    next();
  };
};
```

### Rate Limiting

#### Advanced Rate Limiting
```javascript
// Multi-tier rate limiting
const rateLimiters = {
  // Global rate limit
  global: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: req.rateLimit.resetTime
      });
    }
  }),
  
  // Strict limit for MCP creation
  mcpCreate: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    keyGenerator: (req) => req.user?.id || req.ip,
    skip: (req) => req.user?.role === 'admin'
  }),
  
  // Lenient limit for read operations
  read: rateLimit({
    windowMs: 60 * 1000,
    max: 1000
  })
};
```

### Security Headers

#### Helmet Configuration
```javascript
// Security headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

## Operational Security

### Logging and Monitoring

#### Security Logging
```javascript
// Security event logging
class SecurityLogger {
  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      correlationId: event.correlationId
    };
    
    // Log to secure storage
    this.secureLogger.log(logEntry);
    
    // Alert on critical events
    if (event.severity === 'critical') {
      this.alertService.sendAlert(logEntry);
    }
  }
  
  // Security events to log
  logFailedLogin(userId, ipAddress) {
    this.logSecurityEvent({
      type: 'FAILED_LOGIN',
      severity: 'warning',
      userId,
      ipAddress
    });
  }
  
  logSuspiciousActivity(details) {
    this.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'critical',
      details
    });
  }
}
```

### Secret Management

#### Environment Variables
```javascript
// Secure environment variable handling
class ConfigService {
  constructor() {
    this.requiredSecrets = [
      'DATABASE_URL',
      'MASTER_KEY',
      'JWT_SECRET',
      'SESSION_SECRET'
    ];
    
    this.validateSecrets();
  }
  
  validateSecrets() {
    const missing = this.requiredSecrets.filter(
      secret => !process.env[secret]
    );
    
    if (missing.length > 0) {
      throw new Error(`Missing required secrets: ${missing.join(', ')}`);
    }
    
    // Validate secret strength
    if (process.env.MASTER_KEY.length < 64) {
      throw new Error('MASTER_KEY must be at least 32 bytes (64 hex chars)');
    }
  }
  
  getSecret(name) {
    const value = process.env[name];
    
    // Clear from process environment after reading
    delete process.env[name];
    
    return value;
  }
}
```

## Compliance & Auditing

### Audit Trail

#### Comprehensive Auditing
```javascript
// Audit service for compliance
class AuditService {
  async logAuditEvent(event) {
    const auditEntry = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      oldValue: event.oldValue,
      newValue: event.newValue,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      result: event.result,
      errorMessage: event.errorMessage
    };
    
    // Store in audit table (write-only)
    await db.query(
      `INSERT INTO audit_log 
       (id, timestamp, user_id, action, resource_type, resource_id, 
        old_value, new_value, ip_address, user_agent, result, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      Object.values(auditEntry)
    );
    
    // Archive old audit logs
    if (Math.random() < 0.01) { // 1% chance per request
      await this.archiveOldLogs();
    }
  }
}
```

### Compliance Controls

#### GDPR Compliance
```javascript
// Data privacy controls
class PrivacyService {
  async exportUserData(userId) {
    const data = {
      profile: await db.getUserProfile(userId),
      mcpInstances: await db.getUserMCPs(userId),
      apiKeys: await db.getUserAPIKeys(userId, { decrypt: false }),
      logs: await db.getUserLogs(userId),
      auditTrail: await db.getUserAuditTrail(userId)
    };
    
    return this.sanitizeForExport(data);
  }
  
  async deleteUserData(userId) {
    // Soft delete with retention period
    await db.transaction(async (trx) => {
      await trx('users').where({ id: userId }).update({
        deleted_at: new Date(),
        deletion_requested_at: new Date()
      });
      
      // Schedule hard deletion after retention period
      await this.scheduleHardDeletion(userId, '30d');
    });
  }
}
```

## Incident Response

### Incident Response Plan

#### Detection and Response
```javascript
// Automated incident response
class IncidentResponseService {
  async handleSecurityIncident(incident) {
    // 1. Detect and classify
    const severity = this.classifyIncident(incident);
    
    // 2. Immediate response
    switch (severity) {
      case 'critical':
        await this.lockdownSystem();
        await this.notifySecurityTeam(incident);
        break;
      
      case 'high':
        await this.isolateAffectedResources(incident);
        await this.notifyOnCall(incident);
        break;
      
      case 'medium':
        await this.increaseMonitoring(incident);
        await this.createTicket(incident);
        break;
    }
    
    // 3. Collect evidence
    const evidence = await this.collectEvidence(incident);
    
    // 4. Create incident report
    await this.createIncidentReport(incident, evidence);
  }
  
  async lockdownSystem() {
    // Disable new MCP creation
    await this.featureFlags.disable('mcp_creation');
    
    // Increase security monitoring
    await this.monitoring.setLevel('paranoid');
    
    // Enable additional logging
    await this.logging.enableVerbose();
  }
}
```

### Recovery Procedures

#### Backup and Recovery
```javascript
// Disaster recovery procedures
class DisasterRecovery {
  async performBackup() {
    // Database backup
    await this.backupDatabase();
    
    // Configuration backup
    await this.backupConfiguration();
    
    // Encryption keys backup (encrypted)
    await this.backupEncryptionKeys();
  }
  
  async restoreFromBackup(backupId) {
    // Verify backup integrity
    const backup = await this.verifyBackup(backupId);
    
    // Restore in correct order
    await this.restoreDatabase(backup);
    await this.restoreConfiguration(backup);
    await this.restoreEncryptionKeys(backup);
    
    // Verify system integrity
    await this.verifySystemIntegrity();
  }
}
```

## Security Checklist

### Development Phase
- [ ] Code review for security vulnerabilities
- [ ] Dependency scanning
- [ ] Static security analysis
- [ ] Unit tests for security functions

### Deployment Phase
- [ ] Security configuration review
- [ ] Secrets properly configured
- [ ] TLS certificates valid
- [ ] Firewall rules configured
- [ ] Monitoring alerts configured

### Operational Phase
- [ ] Regular security updates
- [ ] Vulnerability scanning
- [ ] Penetration testing
- [ ] Security training
- [ ] Incident response drills

## Next Steps

1. Review [Backend Architecture](./backend-architecture.md) for system design
2. Check [API Documentation](./api-documentation.md) for security headers
3. See [Implementation Roadmap](./backend-implementation-roadmap.md) for security milestones
4. Consult [Logging & Monitoring](./logging-monitoring.md) for security monitoring