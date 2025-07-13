#!/bin/bash

# Add New MCP Service Script
# Helps add a new service to the PM2 startup configuration

if [ $# -ne 2 ]; then
    echo "Usage: $0 <service_name> <port_number>"
    echo "Example: $0 trello 49298"
    exit 1
fi

SERVICE_NAME=$1
PORT=$2

# Validate port number
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "❌ Error: Port must be a number"
    exit 1
fi

# Set script directory and backend root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
MCP_SERVERS_ROOT="$BACKEND_ROOT/src/mcp-servers"
SERVICE_PATH="$MCP_SERVERS_ROOT/$SERVICE_NAME"

echo "🆕 Adding new MCP service: $SERVICE_NAME"
echo "========================================"
echo "📁 Service path: $SERVICE_PATH"
echo "🔌 Port: $PORT"

# Check if service directory exists
if [ ! -d "$SERVICE_PATH" ]; then
    echo "❌ Service directory not found: $SERVICE_PATH"
    echo "ℹ️  Please create the service directory and index.js first"
    exit 1
fi

# Check if index.js exists
if [ ! -f "$SERVICE_PATH/index.js" ]; then
    echo "❌ index.js not found in: $SERVICE_PATH"
    echo "ℹ️  Please create the index.js file first"
    exit 1
fi

# Check if port is already in use
if lsof -i :$PORT > /dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use. Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

# Add to start-all-services.sh
START_SCRIPT="$SCRIPT_DIR/start-all-services.sh"
STOP_SCRIPT="$SCRIPT_DIR/stop-all-services.sh"

# Check if service is already in start script
if grep -q "start_service \"$SERVICE_NAME\"" "$START_SCRIPT"; then
    echo "⚠️  Service $SERVICE_NAME already exists in start script"
else
    # Add before the echo statements at the end
    sed -i "/# Check each service/i start_service \"$SERVICE_NAME\" \"\$MCP_SERVERS_ROOT/$SERVICE_NAME\" \"$PORT\"" "$START_SCRIPT"
    
    # Add health check
    sed -i "/check_service_health \"discord\"/a check_service_health \"$SERVICE_NAME\" \"$PORT\"" "$START_SCRIPT"
    
    # Add to service list
    sed -i "/🎮 Discord:/a echo \"  🔧 $SERVICE_NAME: http://localhost:$PORT/health\"" "$START_SCRIPT"
    
    echo "✅ Added $SERVICE_NAME to start script"
fi

# Add to stop script
if grep -q "stop_service \"$SERVICE_NAME\"" "$STOP_SCRIPT"; then
    echo "⚠️  Service $SERVICE_NAME already exists in stop script"
else
    sed -i "/stop_service \"discord\"/a stop_service \"$SERVICE_NAME\"" "$STOP_SCRIPT"
    echo "✅ Added $SERVICE_NAME to stop script"
fi

echo ""
echo "🎉 Service $SERVICE_NAME added successfully!"
echo ""
echo "🛠️  Next steps:"
echo "  1. Test the service: node $SERVICE_PATH/index.js"
echo "  2. Start all services: ./scripts/start-all-services.sh"
echo "  3. Check health: curl http://localhost:$PORT/health"
echo ""
echo "📋 Service added to:"
echo "  - $START_SCRIPT"
echo "  - $STOP_SCRIPT"