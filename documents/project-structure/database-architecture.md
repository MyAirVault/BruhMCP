# Database Architecture

## Summary
This document outlines the actual PostgreSQL database architecture for the MCP platform based on existing migration scripts, including tables, relationships, and the multi-tenant data isolation strategy implemented in the codebase.

## Flow Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │───▶│  user_plans     │───▶│ user_billing_   │
│   (auth)        │    │   (limits)      │    │   details       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       
         ▼                       
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   mcp_table     │───▶│mcp_service_table│───▶│ mcp_credentials │
│ (service types) │    │ (user instances)│    │  (auth tokens)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │token_audit_log  │
                       │  (security)     │
                       └─────────────────┘
```

## Database Tables (Based on Actual Migration Scripts)

### Users and Authentication

#### `users` Table
**Migration**: `backend/src/db/migrations/002_separate_credentials_table.sql:23-29`
- **Purpose**: User accounts with magic link authentication (no passwords)
- **Key Fields**:
  - `id` (UUID): Primary key, generated with `gen_random_uuid()`
  - `email` (VARCHAR(255)): Unique user email address
  - `name` (VARCHAR(255)): Optional user display name
  - `created_at` / `updated_at` (TIMESTAMP): Audit timestamps

#### `token_audit_log` Table  
**Migration**: `backend/src/db/migrations/003_token_audit_log.sql:4-15`
- **Purpose**: Tracks OAuth token operations for security monitoring
- **Key Fields**:
  - `audit_id` (SERIAL): Primary key
  - `instance_id` (UUID): References `mcp_service_table.instance_id`
  - `user_id` (UUID): User performing operation
  - `operation` (VARCHAR(50)): Type of operation (refresh, revoke, validate)
  - `status` (VARCHAR(20)): Result status (success, failure, pending)
  - `method` (VARCHAR(50)): Authentication method used
  - `error_type` / `error_message`: Error details for failed operations
  - `metadata` (JSONB): Additional operation context
- **Cleanup Function**: `cleanup_old_token_audit_logs()` removes entries older than 90 days

### Service Registry

#### `mcp_table` Table
**Migration**: `backend/src/db/migrations/002_separate_credentials_table.sql:36-49`
- **Purpose**: Central registry of available MCP service types
- **Key Fields**:
  - `mcp_service_id` (UUID): Primary service identifier
  - `mcp_service_name` (VARCHAR(50)): Unique service name (gmail, github, etc.)
  - `display_name` (VARCHAR(100)): Human-readable service name
  - `description` (TEXT): Service description
  - `icon_url_path` (VARCHAR(500)): Path to service icon
  - `port` (INTEGER): Unique port number for service
  - `type` (VARCHAR(20)): Authentication type ('api_key' or 'oauth')
  - `is_active` (BOOLEAN): Global service availability control
  - `total_instances_created` / `active_instances_count` (INTEGER): Usage statistics

#### `mcp_service_table` Table  
**Migration**: `backend/src/db/migrations/002_separate_credentials_table.sql:56-71`
- **Purpose**: User-specific MCP service instances (multi-tenant isolation)
- **Key Fields**:
  - `instance_id` (UUID): Primary instance identifier
  - `user_id` (UUID): Foreign key to users table (tenant isolation)
  - `mcp_service_id` (UUID): Foreign key to mcp_table
  - `oauth_status` (VARCHAR(20)): OAuth flow status (pending, completed, failed)
  - `status` (VARCHAR(20)): Instance status (active, inactive, expired)
  - `expires_at` (TIMESTAMP): Instance expiration time
  - `last_used_at` / `usage_count`: Usage tracking
  - `custom_name` (VARCHAR(255)): User-defined instance name
  - `renewed_count` / `last_renewed_at`: Renewal tracking
  - `credentials_updated_at`: Last credential update time

### Credentials and Security

#### `mcp_credentials` Table
**Migration**: `backend/src/db/migrations/002_separate_credentials_table.sql:78-121`
- **Purpose**: Encrypted storage of authentication credentials per instance
- **Key Fields**:
  - `credential_id` (UUID): Primary key
  - `instance_id` (UUID): Foreign key to mcp_service_table (one-to-one relationship)
  - **API Key Authentication**:
    - `api_key` (VARCHAR(500)): Encrypted API key
  - **OAuth Authentication**: 
    - `client_id` / `client_secret` (VARCHAR(500)): OAuth app credentials
    - `access_token` (VARCHAR(1000)) / `refresh_token` (VARCHAR(500)): OAuth tokens
    - `token_expires_at` (TIMESTAMP): Token expiration time
    - `token_scope` (TEXT): Granted OAuth scopes
  - **OAuth Flow Tracking**:
    - `oauth_status` (VARCHAR(20)): Flow status (pending, completed, failed, expired)
    - `oauth_completed_at` (TIMESTAMP): Completion timestamp
    - `oauth_authorization_url` (TEXT): Authorization URL for pending flows
    - `oauth_state` (VARCHAR(100)): OAuth state parameter for security
- **Constraints**:
  - Ensures proper credential types (either API key OR OAuth)
  - Validates OAuth token consistency
  - Enforces OAuth status consistency

### Billing and Plans

#### `user_plans` Table
**Migration**: `backend/src/db/migrations/005_add_user_plans_with_active_limits.sql:8-26`
- **Purpose**: User subscription plans with instance limits
- **Key Fields**:
  - `plan_id` (UUID): Primary key
  - `user_id` (UUID): Foreign key to users (unique constraint - one plan per user)
  - `plan_type` (VARCHAR(20)): Plan type ('free' or 'pro')
  - `max_instances` (INTEGER): Maximum active instances (1 for free, NULL for unlimited pro)
  - `features` (JSONB): Plan-specific features and metadata
  - `expires_at` (TIMESTAMP): Plan expiration date (NULL = never expires)
- **Auto-Assignment**: Trigger automatically assigns free plan to new users
- **Validation**: Constraint ensures max_instances matches plan_type

#### `user_billing_details` Table
**Migration**: `backend/src/db/migrations/007_add_user_billing_details.sql`
- **Purpose**: Razorpay billing integration and payment method storage
- **Integration**: Used by billing system at `backend/src/billing/services/paymentGateway.js`

## Database Indexes and Performance

### Performance Indexes
From migration `002_separate_credentials_table.sql:136-149`:
- **Users**: Email lookup optimization
- **MCP Table**: Service name, port, and active status lookups
- **MCP Service Table**: User ID, instance ID, service ID, status, and expiration lookups
- **Credentials**: Instance ID (unique), OAuth status, token expiration, and state lookups

### Audit Trail Indexes
From migration `003_token_audit_log.sql:18-22`:
- **Token Audit**: Instance ID, operation type, status, and timestamp lookups
- **Composite**: Instance ID + timestamp for efficient querying

## Triggers and Automation

### Timestamp Triggers
All tables have `update_updated_at_column()` triggers that automatically update the `updated_at` field on row modifications.

### User Plan Auto-Assignment
Migration `005_add_user_plans_with_active_limits.sql:43-61`:
- **Function**: `assign_default_plan()` automatically creates free plan for new users
- **Trigger**: `auto_assign_free_plan` executes after user insertion
- **Backfill**: Existing users without plans are automatically assigned free plan

### Audit Log Maintenance
Migration `003_token_audit_log.sql:36-51`:
- **Function**: `cleanup_old_token_audit_logs()` removes logs older than 90 days
- **View**: `token_audit_summary` provides 30-day operation statistics

## Multi-Tenant Data Isolation

### User-Level Isolation
All user data is isolated through foreign key relationships to the `users` table:
- `mcp_service_table.user_id` ensures instances belong to specific users
- `user_plans.user_id` links subscription plans to users
- `token_audit_log.user_id` tracks security events per user

### Instance-Level Security
- `mcp_credentials.instance_id` provides one-to-one credential mapping
- Instance ownership validated through `mcp_service_table.user_id`
- OAuth state parameters prevent cross-site request forgery

### Plan Enforcement
Plan limits enforced at application level using data from:
- `user_plans.max_instances` for instance creation limits
- `user_plans.expires_at` for subscription expiration
- `mcp_service_table.status` for instance lifecycle management

## Views and Reporting

### Token Audit Summary View
Migration `003_token_audit_log.sql:54-72`:
Provides aggregated statistics for token operations including:
- Operation counts and success rates per instance
- Method-specific performance metrics  
- 30-day rolling window analysis
- First and last operation timestamps

## Database Configuration and Connections

### Connection Management
**File**: `backend/src/db/config.js`
- PostgreSQL connection pooling configuration
- Environment variable management
- Connection health monitoring

### Migration System
**File**: `backend/src/db/scripts/migrate.js`
- Sequential migration execution
- Migration history tracking
- Rollback capability support