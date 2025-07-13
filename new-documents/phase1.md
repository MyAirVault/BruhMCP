# Phase 1: Service Management and Startup Flow

## Overview

Phase 1 focuses on automatically starting all MCP services when the server boots up. Each service will have its own entry point (index.js) that listens for requests, configures MCP endpoints from the service's API, and runs as a separate process managed by PM2.

## Core Objectives

1. **Individual Service Entry Points**: Each service gets its own index.js file that starts independently
2. **MCP Endpoint Configuration**: Services configure their MCP endpoints based on their specific API
3. **PM2 Process Management**: Each service runs as a separate PM2 process
4. **Manual Service Management**: start services by creating folders and updating bash script
5. **Service Health Monitoring**: Ensure all services are running and responding correctly

## Architecture Overview

### Service Structure

All services are implemented in `backend/src/mcp-servers/` with this structure:

```
backend/src/mcp-servers/
├── figma/
│   ├── index.js          # Entry point - starts the service
│   ├── endpoints/        # MCP protocol endpoints
│   ├── api/              # Service-specific API logic
│   └── utils/            # Helper functions
├── github/
│   ├── index.js          # Entry point - starts the service
│   ├── endpoints/        # MCP protocol endpoints
│   ├── api/              # Service-specific API logic
│   └── utils/            # Helper functions
└── slack/
    ├── index.js          # Entry point - starts the service
    ├── endpoints/        # MCP protocol endpoints
    ├── api/              # Service-specific API logic
    └── utils/            # Helper functions
```

### How Each Service Works

1. **index.js**: Main entry point that:

    - Contains service configuration (port, name, auth type) directly in the file
    - Sets up Express server on the configured port
    - Loads endpoints from the endpoints/ folder
    - Configures MCP protocol handlers
    - Starts listening for requests

2. **endpoints/** folder: Contains MCP protocol endpoints:

    - `health.js` - Health check endpoint
    - `tools.js` - Available tools endpoint
    - `call.js` - Tool execution endpoint
    - Service-specific endpoint files

3. **api/** folder: Service-specific API logic:

    - External API integration code
    - Data transformation functions
    - Service-specific business logic

4. **utils/** folder: Helper functions and utilities:
    - Common utility functions
    - Authentication helpers
    - Data validation functions

## Step-by-Step Implementation Process

### Step 1: Create Service Implementation

1. **Create service folder** in `backend/src/mcp-servers/servicename/`

2. **Implement index.js** entry point:

    - Define service configuration directly in file (name, port, auth type)
    - Set up Express server on configured port
    - Load and register endpoint handlers from endpoints/ folder
    - Start listening for requests

3. **Create endpoints/** folder with MCP handlers:

    - `health.js` - Health check endpoint
    - `tools.js` - List available tools
    - `call.js` - Execute tool calls
    - Service-specific endpoints as needed

4. **Build api/** folder with service logic:

    - External API integration
    - Data processing and transformation
    - Business logic specific to the service

5. **Add utils/** folder for helpers:
    - Common utility functions
    - Authentication and validation helpers
    - Shared service utilities

### Step 2: Update Startup Script

1. **Edit bash startup script** (`scripts/start-all-services.sh`):

    - Add new service to the list of services to start
    - Include service name and path to index.js
    - Set environment variables if needed

2. **Ensure port uniqueness**:
    - Check that the port defined in index.js is unique
    - Verify port is in valid range (49160-49999)
    - Update documentation with port assignments

### Step 3: Test Service Startup

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
2. **Define configuration** directly in the service's index.js file
3. **Update startup script** to include the new service
4. **Test service** individually before adding to production
5. **Deploy via startup script** when ready

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
	port: 49160,
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
	"port": 49160,
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
│   │   │   │   ├── endpoints/    # MCP protocol endpoints
│   │   │   │   │   ├── health.js
│   │   │   │   │   ├── tools.js
│   │   │   │   │   └── call.js
│   │   │   │   ├── api/          # Figma-specific API logic
│   │   │   │   └── utils/        # Helper functions
│   │   │   ├── github/
│   │   │   │   ├── index.js      # GitHub service entry point (includes config)
│   │   │   │   ├── endpoints/    # MCP protocol endpoints
│   │   │   │   ├── api/          # GitHub-specific API logic
│   │   │   │   └── utils/        # Helper functions
│   │   │   └── slack/
│   │   │       ├── index.js      # Slack service entry point (includes config)
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
