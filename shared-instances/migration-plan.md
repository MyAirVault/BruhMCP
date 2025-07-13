# Migration Plan: Dynamic to Shared Instances

## Overview
This document outlines the step-by-step migration from the current dynamic service architecture to the shared instances model.

## Pre-Migration Assessment

### Current State Analysis
- **Services**: 373+ MCP services with static port configs
- **Process Model**: Dynamic spawning via universal-mcp-server.js
- **Database**: mcp_instances table with process_id tracking
- **Port Management**: Removed in migration 007 (static ports only)
- **User Model**: Instance-based with toggle activation

### Migration Complexity
- **Low Risk**: Service configs already have static ports
- **Medium Risk**: Database schema changes
- **High Impact**: Process management overhaul

## Migration Phases

### Phase 1: Foundation (Week 1-2)

#### 1.1 Service Registry Creation
```bash
# Create centralized service registry
backend/src/services/serviceRegistry.js
```
- Consolidate all `mcp-ports/*/config.json` files
- Create service metadata structure
- Implement service discovery patterns
- Add service health tracking

#### 1.2 Database Schema Updates
```sql
-- New tables for shared instances
CREATE TABLE user_service_instances (
    instance_id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    UNIQUE(user_id, service_type)
);

CREATE INDEX idx_user_service_instances_user_id ON user_service_instances(user_id);
CREATE INDEX idx_user_service_instances_service_type ON user_service_instances(service_type);
```

#### 1.3 Instance Management System
```bash
# New instance management components
backend/src/services/instanceManager.js
backend/src/utils/instanceIdGenerator.js
backend/src/middleware/instanceAuth.js
```

### Phase 2: Service Infrastructure (Week 3-4)

#### 2.1 PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    // Main API server
    {
      name: 'main-api',
      script: 'src/index.js',
      env: { PORT: 3000 }
    },
    // Static MCP services
    {
      name: 'mcp-figma',
      script: 'src/mcp-servers/universal-mcp-server.js',
      env: {
        MCP_TYPE: 'figma',
        PORT: 49160,
        SERVICE_MODE: 'shared'
      }
    },
    // ... 372 more services
  ]
};
```

#### 2.2 Service Startup Scripts
```bash
# Service deployment automation
scripts/generate-pm2-config.js     # Generate ecosystem from service registry
scripts/start-all-services.sh     # Start all services via PM2
scripts/health-check-services.sh  # Verify all services are running
```

#### 2.3 Universal MCP Server Updates
- Add shared instance mode support
- Implement user context extraction
- Add credential management integration
- Update request routing patterns

### Phase 3: Authentication & Routing (Week 5-6)

#### 3.1 Authentication System
```bash
# Authentication components
backend/src/controllers/serviceAuth.js     # API key validation endpoints
backend/src/services/credentialManager.js # Encrypted storage management
backend/src/middleware/serviceAuth.js     # Request authentication
```

#### 3.2 Routing Updates
```bash
# Updated routing patterns
backend/src/routes/sharedInstances.js    # New instance-based routes
backend/src/middleware/instanceRouter.js # Instance URL parsing
```

#### 3.3 API Endpoints
```javascript
// New API endpoints
POST /api/v1/services/:serviceType/authenticate  // Store API key
GET  /api/v1/services/:serviceType/instance      // Get instance URL
DELETE /api/v1/services/:serviceType/instance    // Remove service access
GET  /api/v1/user/instances                      // List user instances
```

### Phase 4: Frontend Integration (Week 7)

#### 4.1 UI Updates
- Service authentication forms
- Instance URL display
- Service status indicators
- API key management interface

#### 4.2 Service Management
- Replace instance toggle with API key entry
- Show active service instances
- Provide instance URLs for LLM integration
- Add service usage tracking

### Phase 5: Migration & Testing (Week 8)

#### 5.1 Data Migration
```sql
-- Migrate existing data
INSERT INTO user_service_instances (
    instance_id,
    user_id,
    service_type,
    encrypted_api_key,
    is_active
)
SELECT 
    CONCAT(
        SUBSTRING(mt.name, 1, 3),
        '_user_',
        SUBSTRING(mi.user_id::text, 1, 8),
        '_',
        SUBSTRING(md5(mi.id::text), 1, 6)
    ) as instance_id,
    mi.user_id,
    mt.name as service_type,
    mi.encrypted_credentials,
    mi.is_active
FROM mcp_instances mi
JOIN mcp_types mt ON mi.mcp_type_id = mt.id
WHERE mi.is_active = true;
```

#### 5.2 Parallel Testing
- Run both systems in parallel
- Gradual user migration
- Performance comparison
- Rollback procedures

#### 5.3 Cutover Process
1. Maintenance window announcement
2. Stop dynamic process creation
3. Start all static services
4. Update routing configuration
5. Verify all services healthy
6. Enable new endpoints
7. Monitor for issues

## Migration Steps Detail

### Step 1: Service Registry Implementation
```bash
# Generate service registry from existing configs
node scripts/build-service-registry.js

# Output: backend/src/config/serviceRegistry.json
{
  "figma": {
    "name": "figma",
    "port": 49160,
    "config": { /* from mcp-ports/figma/config.json */ }
  },
  // ... all services
}
```

### Step 2: Database Schema Deployment
```bash
# Create migration file
backend/src/db/migrations/008_shared_instances.sql

# Run migration
npm run db:migrate
```

### Step 3: PM2 Configuration Generation
```bash
# Generate PM2 ecosystem
node scripts/generate-pm2-config.js

# Start all services
pm2 start ecosystem.config.js
pm2 save
```

### Step 4: Service Authentication Setup
```bash
# Deploy authentication endpoints
# Test API key validation
# Verify credential encryption
```

### Step 5: Routing Implementation
```bash
# Update main router
# Add instance middleware
# Test request routing
```

### Step 6: Frontend Updates
```bash
# Update service pages
# Add authentication forms
# Test instance URL generation
```

### Step 7: User Migration
```bash
# Migrate active instances
# Generate instance URLs
# Notify users of new URLs
```

## Rollback Plan

### Immediate Rollback (< 1 hour)
1. Stop PM2 services
2. Restart dynamic process manager
3. Revert routing changes
4. Restore original endpoints

### Data Rollback (< 4 hours)
1. Restore database from backup
2. Revert schema changes
3. Restart all services
4. Verify functionality

## Success Criteria

### Performance Metrics
- Service startup time: < 5 seconds for all services
- Request latency: < 100ms additional overhead
- Memory usage: 50% reduction vs dynamic model
- CPU usage: 30% reduction vs dynamic model

### Functional Requirements
- All 373+ services operational
- User isolation verified
- API key authentication working
- Instance URLs accessible
- Frontend integration complete

### Monitoring & Alerting
- PM2 service health monitoring
- Database performance tracking
- User authentication metrics
- Service usage analytics

## Timeline Summary

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1-2  | Foundation | Service registry, DB schema, instance management |
| 3-4  | Infrastructure | PM2 config, service startup, universal server updates |
| 5-6  | Auth & Routing | Authentication system, routing updates, API endpoints |
| 7    | Frontend | UI updates, service management interface |
| 8    | Migration | Data migration, testing, cutover |

## Risk Mitigation

### Technical Risks
- **Service startup failures**: Health checks and retry logic
- **Database migration issues**: Backup and rollback procedures
- **Performance degradation**: Load testing and optimization
- **User authentication problems**: Comprehensive testing and validation

### Business Risks
- **User disruption**: Gradual migration and communication
- **Service downtime**: Parallel testing and quick rollback
- **Data loss**: Multiple backup strategies
- **Feature regression**: Extensive testing coverage