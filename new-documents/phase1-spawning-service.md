# Phase 1: Multi-Tenant MCP Service Management and Startup Flow

## Overview

Phase 1 focuses on automatically starting all MCP services with multi-tenant architecture support. Each service runs independently with instance-based routing, allowing multiple users to access the same service with complete isolation. Services boot up without requiring database connections and dynamically handle user instances through database-driven authentication.

## Core Objectives

1. **Multi-Tenant Service Architecture**: Each service supports multiple users through instance-based routing
2. **Independent Service Startup**: Services start without database dependencies and handle instances dynamically
3. **Instance-Based Authentication**: Database-driven credential lookup per user instance
4. **Complete User Isolation**: Each user's requests use their specific credentials with full separation
5. **PM2 Process Management**: Each service runs as a separate PM2 process with multi-user support
6. **Service Health Monitoring**: Global and instance-specific health checks

## Architecture Overview

### Service Structure

All services are implemented in `backend/src/mcp-servers/` with this multi-tenant structure:

```
backend/src/mcp-servers/
├── figma/
│   ├── index.js               # Entry point - multi-tenant routing
│   ├── db/
│   │   └── service.sql        # Database service registration
│   ├── endpoints/             # MCP protocol endpoints
│   ├── api/                   # Service-specific API logic
│   ├── utils/                 # Helper functions
│   ├── services/
│   │   └── database.js        # Instance credential lookup
│   └── middleware/
│       └── instance-auth.js   # Instance authentication
├── github/
│   ├── index.js               # Entry point - multi-tenant routing
│   ├── db/
│   │   └── service.sql        # Database service registration
│   ├── endpoints/             # MCP protocol endpoints
│   ├── api/                   # Service-specific API logic
│   ├── utils/                 # Helper functions
│   ├── services/
│   │   └── database.js        # Instance credential lookup
│   └── middleware/
│       └── instance-auth.js   # Instance authentication
└── slack/
    ├── index.js               # Entry point - multi-tenant routing
    ├── db/
    │   └── service.sql        # Database service registration
    ├── endpoints/             # MCP protocol endpoints
    ├── api/                   # Service-specific API logic
    ├── utils/                 # Helper functions
    ├── services/
    │   └── database.js        # Instance credential lookup
    └── middleware/
        └── instance-auth.js   # Instance authentication
```

### How Each Multi-Tenant Service Works

1. **db/service.sql**: Database registration file that:

    - Defines service metadata (name, display name, description, icon)
    - Specifies port number (must match mcp-ports configuration)
    - Sets authentication type (api_key or oauth)
    - Automatically discovered and registered during `npm run db:migrate`

2. **index.js**: Main entry point that:

    - Contains service configuration (port, name, auth type) directly in the file
    - Sets up Express server with multi-tenant routing (`:instanceId` parameters)
    - Configures both global and instance-specific endpoints
    - Uses instance authentication middleware for protected endpoints
    - Starts listening for requests without database dependencies

3. **endpoints/** folder: Contains MCP protocol endpoints:

    - `health.js` - Health check handlers (global and instance-specific)
    - `tools.js` - Available tools endpoint with MCP compliance
    - `call.js` - Tool execution endpoint with user credential integration
    - Service-specific endpoint files

4. **api/** folder: Service-specific API logic:

    - External API integration code using user credentials
    - Data transformation functions
    - Service-specific business logic with user context

5. **services/** folder: Multi-tenant service layer:

    - `database.js` - Instance credential lookup and validation
    - Usage tracking and analytics per instance
    - Instance status management (active/inactive/expired)

6. **middleware/** folder: Authentication and routing:

    - `instance-auth.js` - Instance-based authentication middleware
    - UUID validation and database credential lookup
    - User isolation and request context management

7. **utils/** folder: Helper functions and utilities:
    - Common utility functions
    - Input validation and sanitization
    - Shared service utilities

### Multi-Tenant URL Structure

**Global Endpoints (Service-level):**
```
GET  /health                                    # Service health check
```

**Instance-Based Endpoints (User-specific):**
```
GET  /:instanceId/health                        # Instance health check
GET  /:instanceId/mcp/tools                     # MCP tools discovery
POST /:instanceId/mcp/call                      # MCP tool execution
GET  /:instanceId/api/files/:fileKey            # Direct API access
```

**Production URLs through Nginx:**
```
https://domain.com/figma/550e8400-e29b-41d4-a716-446655440000/mcp/call
https://domain.com/github/7c4a8d09-6f91-4c87-b9e2-3f2d4e5a6b7c/mcp/call
https://domain.com/slack/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/mcp/call
```

**Request Flow:**
1. Nginx routes `/figma/*` to `localhost:49280`
2. Service extracts `instanceId` from path
3. Database lookup for user credentials
4. Tool execution with user-specific API key
5. Complete user isolation and tracking

## Step-by-Step Implementation Process

### Step 1: Create Multi-Tenant Service Implementation

1. **Create service folder** in `backend/src/mcp-servers/servicename/`

2. **Create database registration** in `db/service.sql`:

    - Define service metadata (name, display name, description, icon)
    - Specify port number (must match mcp-ports configuration)
    - Set authentication type (api_key or oauth)
    - Ensure port consistency across all configuration files

3. **Implement index.js** entry point with multi-tenant routing:

    - Define service configuration directly in file (name, port, auth type)
    - Set up Express server with instance-based routing (`/:instanceId/*`)
    - Configure both global and instance-specific endpoints
    - Load instance authentication middleware
    - Start listening for requests without database dependencies

4. **Create endpoints/** folder with MCP handlers:

    - `health.js` - Health check handlers (global and instance-specific)
    - `tools.js` - List available tools with MCP compliance
    - `call.js` - Execute tool calls with user credential integration
    - Service-specific endpoints as needed

5. **Build api/** folder with service logic:

    - External API integration using user-specific credentials
    - Data processing and transformation with user context
    - Business logic specific to the service with isolation

6. **Create services/** folder for multi-tenant logic:

    - `database.js` - Instance credential lookup and validation
    - Usage tracking and analytics per instance
    - Instance status management (active/inactive/expired)

7. **Add middleware/** folder for authentication:

    - `instance-auth.js` - Instance-based authentication middleware
    - UUID validation and database credential lookup
    - User isolation and request context management

8. **Add utils/** folder for helpers:
    - Common utility functions
    - Input validation and sanitization
    - Shared service utilities

### Step 2: Register Service in Database

1. **Run database migration** to register the service:

    ```bash
    npm run db:migrate
    ```

    This will:
    - Execute core database schema migration
    - Automatically discover your service's `db/service.sql` file
    - Register your service in the `mcp_table` with correct metadata
    - Validate port consistency with mcp-ports configuration

2. **Verify service registration**:
    - Check that service appears in the frontend service catalog
    - Verify port number matches configuration files
    - Ensure service metadata is correct

### Step 3: Update Startup Script

1. **Edit bash startup script** (`scripts/start-all-services.sh`):

    - Add new service to the list of services to start
    - Include service name and path to index.js
    - Set environment variables if needed

2. **Ensure port uniqueness**:
    - Check that the port defined in index.js is unique
    - Verify port is in valid range (49160-49999)
    - Update documentation with port assignments

### Step 4: Test Service Startup

1. **Start individual service** for testing:

    - Run the service's index.js directly
    - Verify service configuration loads correctly
    - Test endpoints respond properly
    - Check health endpoint works

2. **Test via startup script**:
    - Run the batch startup script
    - Verify service starts via PM2
    - Check logs for startup errors
    - Test service endpoints respond correctly

## Service Management

### Manual Service Management

To add a new service to the system:

1. **Build service implementation** in `backend/src/mcp-servers/servicename/`
2. **Create database registration** in `db/service.sql` with service metadata
3. **Define configuration** directly in the service's index.js file
4. **Run database migration** to register the service (`npm run db:migrate`)
5. **Update startup script** to include the new service
6. **Test service** individually before adding to production
7. **Deploy via startup script** when ready

### Batch Service Startup

**Startup Script** (`scripts/start-all-services.sh`):

-   Contains list of all services to start
-   Starts each service via PM2 with proper configuration
-   Handles environment variables and logging
-   Provides status reporting during startup

**Key Features**:

-   Start all services with one command
-   Individual service status reporting
-   Error handling for failed services
-   Health check verification after startup

### Service Configuration

Each service defines its configuration directly in index.js:

```javascript
// Service configuration
const SERVICE_CONFIG = {
	name: 'Figma',
	port: <port>,
	authType: 'api_key',
	description: 'Access Figma files and designs',
	version: '1.0.0',
};
```

**Configuration Requirements**:

-   Name and port are required
-   Port must be unique across all services
-   Port must be in range 49160-49999
-   Auth type must be valid (api_key, oauth, basic_auth)
-   No duplicate service names

### Error Handling

**Service Startup Errors**:

-   Port already in use → Log error, mark service as failed
-   Service crashes → PM2 auto-restart (up to 5 times)
-   Health check fails → Mark as unhealthy, continue monitoring
-   Missing endpoints → Service fails to start, log error

## Startup Process Flow

### Complete Startup Sequence

**When the startup script is run:**

1. **Prerequisites Check**

    - Verify Node.js and PM2 are installed
    - Check database connectivity (if needed)
    - Validate startup script has all services listed

2. **Main Server Boot**

    - Start main API server on port 5000
    - Initialize database connection
    - Prepare for service startup

3. **Batch Service Startup Phase**

    - Execute startup script (`scripts/start-all-services.sh`)
    - Start each service listed in the script via PM2
    - Each service initializes with its built-in configuration
    - Services begin listening on their configured ports

4. **Health Verification Phase**

    - Wait for services to initialize (5 seconds)
    - Health check each service endpoint (/health)
    - Report startup status for each service
    - Log final startup results

5. **Service Registration**
    - Services register with any required registries
    - Update service status in monitoring systems
    - Complete startup process

### Service Entry Point Behavior

Each service's `index.js` will:

1. **Load Configuration**

    - Use built-in service configuration defined in the file
    - Extract port, auth type, service name from constants
    - Set up environment variables

2. **Initialize Express Server**

    - Create Express app instance
    - Set up middleware (JSON parsing, CORS, etc.)
    - Configure error handling

3. **Load MCP Endpoints**

    - Import endpoint handlers from `endpoints/` folder
    - Register `/health` endpoint from `endpoints/health.js`
    - Register `/mcp/tools` endpoint from `endpoints/tools.js`
    - Register `/mcp/call` endpoint from `endpoints/call.js`
    - Load any additional service-specific endpoints

4. **Initialize Service API**

    - Load service logic from `api/` folder
    - Set up external API integrations
    - Configure authentication mechanisms

5. **Start Listening**

    - Bind to configured port from built-in configuration
    - Log startup success/failure
    - Begin accepting requests

6. **Handle Graceful Shutdown**
    - Listen for SIGTERM and SIGINT signals
    - Close server connections cleanly
    - Log shutdown status

## Monitoring and Health Checks

### Health Check System

Each service provides a `/health` endpoint that returns:

```json
{
	"service": "figma",
	"status": "healthy",
	"uptime": 3600,
	"timestamp": "2024-01-15T10:30:00Z",
	"port": "<port>",
	"version": "1.0.0"
}
```

**Health Check Schedule**:

-   Every 30 seconds during normal operation
-   Every 5 seconds after service restart
-   On-demand via admin API

**Health Status Values**:

-   `healthy` - Service responding normally
-   `unhealthy` - Service not responding or returning errors
-   `unknown` - Service just started, health not yet determined

### PM2 Monitoring

PM2 provides built-in monitoring for:

-   **Process Status**: running, stopped, errored, restarting
-   **Memory Usage**: Current memory consumption per service
-   **CPU Usage**: CPU utilization per service
-   **Restart Count**: Number of times service has restarted
-   **Uptime**: How long service has been running

**PM2 Commands for Monitoring**:

-   `pm2 status` - Show all service statuses
-   `pm2 logs` - View service logs
-   `pm2 monit` - Real-time monitoring dashboard
-   `pm2 restart all` - Restart all services

## Startup Scripts

### Main Startup Script (`scripts/start-all-services.sh`)

**Purpose**: Start all MCP services using PM2 in batch mode

**What it contains**:

-   List of all services to start
-   Path to each service's index.js file
-   Environment variables for each service
-   PM2 process names and configurations

**Example structure**:

```bash
# Start Figma service
pm2 start backend/src/mcp-servers/figma/index.js --name "mcp-figma"

# Start GitHub service
pm2 start backend/src/mcp-servers/github/index.js --name "mcp-github"

# Start Slack service
pm2 start backend/src/mcp-servers/slack/index.js --name "mcp-slack"
```

**Steps**:

1. Check prerequisites (Node.js, PM2, database)
2. Stop any existing PM2 processes
3. Start main API server on port 5000
4. Start each MCP service listed in the script
5. Verify all services are healthy
6. Save PM2 configuration for auto-restart

**Usage**: `./scripts/start-all-services.sh`

### Development Mode (`scripts/start-dev.sh`)

**Purpose**: Start services in development mode with hot reloading

**Steps**:

1. Kill any existing Node processes
2. Start main API with nodemon
3. Start each MCP service with nodemon
4. Enable file watching for auto-restart

**Usage**: `./scripts/start-dev.sh`

## File Structure After Phase 1

```
project-root/
├── scripts/
│   ├── start-all-services.sh     # Main startup script with all services
│   ├── start-dev.sh              # Development startup script
│   └── stop-services.sh          # Stop all services script
├── backend/
│   ├── src/
│   │   ├── mcp-servers/          # Service implementations
│   │   │   ├── figma/
│   │   │   │   ├── index.js      # Figma service entry point (includes config)
│   │   │   │   ├── db/
│   │   │   │   │   └── service.sql  # Database service registration
│   │   │   │   ├── endpoints/    # MCP protocol endpoints
│   │   │   │   │   ├── health.js
│   │   │   │   │   ├── tools.js
│   │   │   │   │   └── call.js
│   │   │   │   ├── api/          # Figma-specific API logic
│   │   │   │   └── utils/        # Helper functions
│   │   │   ├── github/
│   │   │   │   ├── index.js      # GitHub service entry point (includes config)
│   │   │   │   ├── db/
│   │   │   │   │   └── service.sql  # Database service registration
│   │   │   │   ├── endpoints/    # MCP protocol endpoints
│   │   │   │   ├── api/          # GitHub-specific API logic
│   │   │   │   └── utils/        # Helper functions
│   │   │   └── slack/
│   │   │       ├── index.js      # Slack service entry point (includes config)
│   │   │       ├── db/
│   │   │       │   └── service.sql  # Database service registration
│   │   │       ├── endpoints/    # MCP protocol endpoints
│   │   │       ├── api/          # Slack-specific API logic
│   │   │       └── utils/        # Helper functions
│   │   └── index.js              # Main API server entry point
└── logs/                         # Service logs directory
    ├── main-api-error.log
    ├── main-api-out.log
    ├── mcp-figma-error.log
    ├── mcp-figma-out.log
    ├── mcp-github-error.log
    ├── mcp-github-out.log
    └── ...
```

## Success Criteria for Phase 1

### Functional Requirements

✅ **All services start via batch script** when executed
✅ **Each service has its own process** managed by PM2  
✅ **Services use built-in configuration** defined in index.js
✅ **Health checks work** for all services
✅ **Failed services restart automatically** (up to configured limit)
✅ **Logs are properly separated** per service
✅ **Batch startup via single script** works reliably

### Technical Requirements

✅ **Clean service structure** with endpoints/, api/, and utils/ folders
✅ **Port conflicts are prevented** through manual validation
✅ **Service structure is consistent** across all services
✅ **Graceful startup and shutdown** handling
✅ **Development and production** startup modes
✅ **Service health monitoring** via /health endpoints

### Operational Requirements

✅ **Services survive server restarts** (PM2 auto-start)
✅ **Easy monitoring** via PM2 and logs
✅ **Simple service addition** by updating startup script
✅ **Clear error messages** for startup issues
✅ **Status reporting** for all services during startup

## Next Steps: Preparing for Phase 2

Phase 1 provides the foundation for Phase 2 by ensuring all services are running and ready. Phase 2 will add:

1. **User Authentication System**

    - Magic link authentication
    - User session management
    - API key storage and validation

2. **Service Instance Management**

    - User-specific service instances
    - Unique URLs per user per service
    - Credential isolation between users

3. **Request Routing System**

    - Route requests to correct service based on URL
    - Extract user context from instance URLs
    - Apply user credentials to service requests

4. **User Interface**
    - Service catalog and selection
    - Credential entry and management
    - Instance monitoring and control

Phase 1 ensures that when Phase 2 is implemented, all the underlying services will already be running and ready to handle user requests with proper isolation.
