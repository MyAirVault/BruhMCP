# Database Redesign Flow: Static Service Architecture

## Overview

This document outlines the complete flow for the new database design that supports static MCP services with user-specific instances and proper authentication management.

## Database Architecture

### Core Tables Structure

#### 1. Users Table (Existing)

**Purpose**: Store user authentication and profile information

-   **User ID**: UUID primary key
-   **Email**: Unique user identifier (used for magic link authentication)
-   **Name**: User display name
-   **Timestamps**: Created/updated tracking

_Note: No password field - authentication handled via magic link system_

#### 2. MCP Table (Service Registry) - NEW

**Purpose**: Master catalog of all available MCP services with their authentication requirements

-   **MCP Service ID**: UUID primary key (unique identifier for each service type)
-   **MCP Service Name**: VARCHAR (service name: figma, github, slack, etc.)
-   **Display Name**: Human-readable service name (Figma, GitHub, Slack)
-   **Description**: Service description for users
-   **Icon URL Path**: Path to service icon for UI display
-   **Port**: Static port number for nginx routing (49160, 49294, etc.)
-   **Type**: Authentication method ("api_key" or "oauth")
-   **Is Active**: BOOLEAN (global service enable/disable control)
-   **Total Instances Created**: INTEGER (total number of instances ever created for this service across all users)
-   **Active Instances Count**: INTEGER (current number of active instances for this service across all users)
-   **Created At**: Service registration timestamp
-   **Updated At**: Last modification timestamp

#### 3. MCP Service Table (User Instances) - NEW

**Purpose**: Store individual user service instances with their specific credentials

-   **Instance ID**: UUID primary key (appears in user URLs after service name)
-   **User ID**: UUID foreign key (references Users table, cascade delete)
-   **MCP Service ID**: UUID foreign key (references MCP Service ID in MCP table)
-   **API Key**: VARCHAR (populated only for api_key type services)
-   **Client ID**: VARCHAR (populated only for oauth type services)
-   **Client Secret**: VARCHAR (populated only for oauth type services)
-   **Status**: VARCHAR (instance status: 'active', 'inactive', 'expired')
-   **Expires At**: TIMESTAMP (when instance expires, NULL = never expires)
-   **Last Used At**: TIMESTAMP (last time instance was accessed via API)
-   **Usage Count**: INTEGER (total number of API calls made through instance)
-   **Custom Name**: VARCHAR (user-defined name like "Work Figma", "Personal GitHub")
-   **Renewed Count**: INTEGER (number of times instance has been renewed)
-   **Last Renewed At**: TIMESTAMP (last time instance was renewed from expired status)
-   **Credentials Updated At**: TIMESTAMP (last time credentials were edited)
-   **Created At**: Instance creation timestamp
-   **Updated At**: Last modification timestamp

### Table Relationships

```
Users (1) ←→ (Many) MCP Service Table (Many) ←→ (1) MCP Table
```

-   **One user** can have **multiple service instances**
-   **Multiple users** can use the **same MCP service type**
-   **Each service instance** references **one MCP service definition**

## Authentication Flow Design

### Service Type Determination

1. **MCP Table defines authentication contract** for each service
2. **Global service availability** controlled by is_active flag
3. **Service instances follow the predefined contract**
4. **Frontend dynamically generates forms** based on service type
5. **Backend validates credentials** according to service requirements

### API Key Services Flow

```
Service Type: "api_key"
User Input: API Key only
Storage: api_key field populated, oauth fields NULL
Validation: Ensure API key provided, reject oauth credentials
```

### OAuth Services Flow

```
Service Type: "oauth"
User Input: Client ID + Client Secret
Storage: client_id and client_secret populated, api_key field NULL
Validation: Ensure both oauth fields provided, reject api_key
```

## User Service Creation Flow

### Step 1: Service Selection

1. **User browses available services** from MCP Table (where is_active = true)
2. **Frontend displays service information** (name, description, icon)
3. **System determines authentication requirements** from service type
4. **Frontend shows appropriate credential form** (API key vs OAuth)
5. **User enters custom name** for the instance (e.g., "Work Figma")
6. **User selects expiration time** (never, 1h, 6h, 1day, 30days)

### Step 2: Credential Entry

1. **User enters credentials** based on service type
2. **Frontend validates input format** (non-empty fields, etc.)
3. **System performs credential validation** against external service API
4. **Credentials accepted** → proceed to instance creation

### Step 3: Instance Creation

1. **Generate unique Instance ID** (UUID for user URLs)
2. **Calculate expiration timestamp** based on user selection
3. **Store credentials in MCP Service Table** following authentication contract
4. **Set custom name** provided by user
5. **Set initial status** to 'active'
6. **Initialize usage tracking** (usage_count = 0, last_used_at = NULL)
7. **Initialize management fields** (renewed_count = 0, credentials_updated_at = NOW())
8. **Link instance to user** via User ID foreign key
9. **Link instance to service type** via MCP Service ID foreign key
10. **Return instance URL** to user: `<domain>/<mcp-service-name>/<instance-id>`

### Step 4: Service Access

1. **User receives unique URL** for their service instance
2. **LLM or external client** can access service via this URL
3. **Nginx routes request** based on service name to correct port
4. **Service validates instance status** (must be 'active' and not expired)
5. **Service resolves Instance ID** to user credentials
6. **Service processes requests** using user's specific credentials
7. **Service updates usage tracking** (increment usage_count, update last_used_at)
8. **Complete isolation** between different users of same service

### Step 5: Automatic Expiration Management

1. **Expiration monitor** runs every 60 seconds
2. **Checks all instances** where expires_at < NOW()
3. **Updates expired instances** status to 'expired'
4. **Expired instances** return 403 Forbidden on access attempts
5. **Users can renew** expired instances through UI

## Instance Management Operations

### Edit Instance Credentials

1. **User selects edit** for an active or inactive instance
2. **Frontend loads current values** (credentials, custom name, expiration)
3. **User updates credentials** and/or custom name and/or expiration
4. **System validates new credentials** against external service API
5. **Update database fields**:
    - Credentials (api_key, client_id, client_secret)
    - Custom name if changed
    - Expires_at if expiration changed
    - credentials_updated_at = NOW()
    - updated_at = NOW() (automatic trigger)
6. **Maintain usage tracking** (preserve usage_count and last_used_at)

### Toggle Instance Status (Active ↔ Inactive)

1. **User clicks pause/resume** for active or inactive instance
2. **System validates action** (only active ↔ inactive transitions allowed)
3. **Update status field**:
    - active → inactive (user pauses instance)
    - inactive → active (user resumes instance)
4. **Re-validate credentials** when reactivating from inactive
5. **Update updated_at** timestamp (automatic trigger)
6. **Preserve all other fields** (expiration, usage, credentials)

### Renew Expired Instance

1. **User selects renew** for expired instance
2. **Frontend shows renewal form** with:
    - Current credentials (for editing if needed)
    - New expiration time selector
    - Custom name editing option
3. **User optionally updates** credentials and/or custom name
4. **User selects new expiration time** (never, 1h, 6h, 1day, 30days)
5. **System validates credentials** (current or updated ones)
6. **Update database fields**:
    - status = 'active'
    - expires_at = new calculated timestamp
    - renewed_count = renewed_count + 1
    - last_renewed_at = NOW()
    - credentials_updated_at = NOW() (if credentials changed)
    - updated_at = NOW() (automatic trigger)
7. **Preserve usage tracking** unless user chooses to reset

## URL Structure and Routing

### URL Pattern

```
https://domain.com/<mcp-service-id>/<instance-id>/<endpoint>
```

### Examples

```
https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/files/abc123
https://myapp.com/github/7c4a8d09-6f91-4c87-b9e2-3f2d4e5a6b7c/repos
https://myapp.com/slack/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/channels
```

## Request Flow Architecture

### Step 1: Client Request

```
Client → https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/files/abc123
```

### Step 2: Nginx Routing

```
nginx sees "/figma/" → forwards to localhost:49160
Request becomes: localhost:49160/550e8400-e29b-41d4-a716-446655440000/files/abc123
```

### Step 3: Service Processing

```
Figma service receives: /550e8400-e29b-41d4-a716-446655440000/files/abc123
- Extracts instance-id: 550e8400-e29b-41d4-a716-446655440000
- Looks up user credentials from database
- Validates user access
- Makes Figma API call with user's credentials
- Returns isolated response
```

### Step 4: Response Path

```
Figma service → nginx → Client
Complete request isolation and proper response handling
```

### Request Processing Flow

1. **Nginx routes based on service name** (/figma/ → localhost:49160)
2. **Extract Instance ID** from URL path at service level
3. **Look up Instance ID** in MCP Service Table
4. **Retrieve user credentials** and validate access
5. **Process request** using user's specific credentials
6. **Return isolated response** specific to that user

### URL Components

-   **mcp-service-id**: Service identifier (figma, github, slack) - determines routing
-   **instance-id**: User instance UUID - identifies specific user credentials
-   **endpoint**: Service-specific API endpoint

## Architecture Benefits

### 1. Clean Separation of Concerns

-   **Service identification** (figma) → nginx routing decision
-   **Instance identification** (UUID) → user credential lookup
-   **Endpoint routing** (/files/abc123) → service-specific handling

### 2. Scalable Nginx Routing

-   **Pattern-based routing** using service names
-   **Port mapping** from service name to static port
-   **Load balancing** possible per service type
-   **Service-specific configurations** (timeouts, rate limits)

### 3. Service Isolation

-   **Each service runs on dedicated port** (figma:49160, github:49294)
-   **nginx forwards based on service name** to correct port
-   **Services handle instance-based authentication** internally
-   **Complete user isolation** within each service

## Service Registry Population

### Current Implementation

-   **Manual service registration** during development
-   **Static service definitions** in database
-   **Service metadata** populated by developers

### Future Automation (Planned)

-   **Scan mcp-ports directory** for service configurations
-   **Auto-populate MCP Table** from folder structure
-   **Extract service metadata** from config.json files
-   **Detect authentication requirements** from service configs
-   **Maintain service registry** automatically

## Data Validation and Integrity

### Database Constraints

1. **Authentication Contract Enforcement**

    - API Key services: api_key NOT NULL, oauth fields NULL
    - OAuth services: client_id AND client_secret NOT NULL, api_key NULL

2. **Foreign Key Integrity**

    - Service instances must reference valid users
    - Service instances must reference valid MCP services
    - Cascade delete when users are removed

3. **Unique Constraints**

    - Instance IDs must be globally unique
    - User emails must be unique
    - MCP Service IDs must be unique
    - MCP Service Names must be unique
    - Port numbers must be unique per service

4. **Status and Expiration Constraints**
    - Status must be one of: 'active', 'inactive', 'expired'
    - Only active services (is_active = true) can have new instances created
    - Expired instances (status = 'expired') should deny access

### Application-Level Validation

1. **Credential Format Validation**

    - API keys follow expected patterns
    - OAuth credentials are properly formatted
    - External service validation before storage (live API testing)

2. **Business Logic Validation**

    - Service instances must have valid credentials
    - URLs must resolve to active and non-expired service instances
    - Expiration times must be valid future dates
    - Status transitions must be logical (active ↔ inactive ↔ expired)

3. **Usage Tracking Validation**
    - Usage count should only increment (never decrease)
    - Last used timestamp should be updated on successful API calls
    - Expired instances should not process requests

## Security Considerations

### Current Phase (Plain Text Storage)

-   **Credentials stored as plain text** for initial implementation
-   **Magic link authentication** for user login (no passwords)
-   **UUID-based access control** through instance IDs
-   **Nginx routing** for service isolation
-   **User-specific credential storage** prevents cross-contamination
-   **Live credential validation** against external services before storage
-   **Automatic expiration management** for security
-   **Status-based access control** (active/inactive/expired)

### Future Security Enhancements

-   **Credential encryption** at rest
-   **API key rotation** capabilities
-   **OAuth token refresh** automation
-   **Enhanced audit trails** (currently have comprehensive logging)
-   **Rate limiting** per user per service
-   **Anomaly detection** based on usage patterns

## Migration Strategy

### Phase 1: Database Schema Creation

1. **Create MCP Table** with service registry structure (including is_active, port fields)
2. **Create MCP Service Table** with user instance tracking (including status, expiration, usage fields)
3. **Establish foreign key relationships** between tables
4. **Add database constraints** for data integrity
5. **Create indexes** for performance on status, expiration, and usage fields
6. **Add timestamp triggers** for automatic updated_at handling

### Phase 2: Service Registration

1. **Manually populate MCP Table** with core services
2. **Define authentication requirements** for each service
3. **Set up service metadata** (names, descriptions, icons)
4. **Validate service registry** completeness

### Phase 3: Application Integration

1. **Update frontend** to use new service selection flow with expiration options
2. **Implement dynamic form generation** based on service types
3. **Modify backend** to use new database structure
4. **Update URL routing** to handle nginx-based service routing
5. **Integrate expiration monitor** with new database schema
6. **Add usage tracking** to service request handlers

### Phase 4: User Migration

1. **Migrate existing user data** to new structure
2. **Generate Service IDs** for existing instances
3. **Update user URLs** to new format
4. **Validate data migration** completeness

## Benefits of New Architecture

### 1. Data Integrity

-   **Clear authentication contracts** prevent invalid credential storage
-   **Proper foreign key relationships** ensure referential integrity
-   **Database constraints** enforce business rules at data level

### 2. User Experience

-   **Dynamic form generation** shows only relevant credential fields
-   **Clear service catalog** with descriptions and icons
-   **Predictable URL structure** for external integrations

### 3. Developer Experience

-   **Clean data model** with clear responsibilities
-   **Type-safe credential handling** reduces errors
-   **Extensible design** for new authentication methods

### 4. Operational Benefits

-   **Service isolation** through unique URLs and nginx routing
-   **Scalable architecture** supports many users per service
-   **Automatic expiration management** reduces security risks
-   **Usage analytics** for optimization and monitoring
-   **Global service control** for maintenance and deployment
-   **Future-ready design** for service registry automation

## Implementation Priorities

### Immediate (Phase 1)

1. Create database schema with new tables
2. Establish relationships and constraints
3. Populate initial service registry

### Short Term (Phase 2-3)

1. Update application to use new database structure
2. Implement dynamic credential forms
3. Update URL routing and request handling

### Long Term (Phase 4+)

1. Automate service registry from mcp-ports
2. Add credential encryption
3. Implement advanced security features
4. Add service monitoring and analytics
