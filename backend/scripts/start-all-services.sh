#!/bin/bash

# MCP Services Startup Script
# Starts all MCP services via PM2 for the cache-based architecture
# Automatically detects local development mode from environment variables

# Detect environment mode
if [ "$LOCAL_DEV" = "true" ]; then
    MODE="Local Development"
    MODE_SUFFIX="-local"
    NODE_ENV_VALUE="development"
    echo "🏠 Starting MCP Services - Local Development Mode"
    echo "=================================================="
    echo "🔧 Environment: LOCAL_DEV=true detected"
    echo "💰 Payments: DISABLE_PAYMENTS=true"
    echo "🔐 Auth: Email/password authentication enabled"
else
    MODE="Production"
    MODE_SUFFIX=""
    NODE_ENV_VALUE="production"
    echo "🚀 Starting MCP Services - Production Mode"
    echo "=========================================="
fi

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "❌ PM2 not installed. Install with: npm install -g pm2"; exit 1; }

# Set script directory and backend root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
MCP_SERVERS_ROOT="$BACKEND_ROOT/src/mcp-servers"

echo "📁 Backend root: $BACKEND_ROOT"
echo "📁 MCP servers: $MCP_SERVERS_ROOT"

# Change to backend directory
cd "$BACKEND_ROOT" || { echo "❌ Failed to change to backend directory"; exit 1; }

# Function to start a service with PM2
start_service() {
    local service_name=$1
    local service_path=$2
    local service_port=$3
    
    echo "📋 Starting $service_name service..."
    
    # Check if service directory exists
    if [ ! -d "$service_path" ]; then
        echo "⚠️  $service_name service directory not found, skipping..."
        return
    fi
    
    # Check if index.js exists
    if [ ! -f "$service_path/index.js" ]; then
        echo "⚠️  $service_name service index.js not found, skipping..."
        return
    fi
    
    # Set environment variables based on mode
    local env_args="--env NODE_ENV=$NODE_ENV_VALUE --env SERVICE_NAME=$service_name --env SERVICE_PORT=$service_port"
    
    # Add local development environment variables
    if [ "$LOCAL_DEV" = "true" ]; then
        env_args="$env_args --env LOCAL_DEV=true --env DISABLE_PAYMENTS=true"
    fi
    
    # Start the service with PM2
    pm2 start "$service_path/index.js" --name "mcp-$service_name$MODE_SUFFIX" \
        --log-type json \
        --merge-logs \
        --max-restarts 10 \
        --watch "$service_path" \
        --ignore-watch "node_modules logs *.log" \
        $env_args
    
    echo "✅ $service_name service started with PM2 ($MODE mode)"
}

# Stop any existing services first
echo ""
echo "🛑 Stopping existing MCP services ($MODE mode)..."
pm2 delete mcp-figma$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-gmail$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-sheets$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-airtable$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-dropbox$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-googledrive$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-reddit$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-notion$MODE_SUFFIX 2>/dev/null || true
pm2 delete mcp-slack$MODE_SUFFIX 2>/dev/null || true

echo ""
echo "🏁 Starting MCP services in $MODE mode..."

# Start individual services with PM2
start_service "figma" "$MCP_SERVERS_ROOT/figma" "49280"
start_service "gmail" "$MCP_SERVERS_ROOT/gmail" "49296"
start_service "sheets" "$MCP_SERVERS_ROOT/sheets" "49307"
start_service "airtable" "$MCP_SERVERS_ROOT/airtable" "49171"
start_service "dropbox" "$MCP_SERVERS_ROOT/dropbox" "49264"
start_service "googledrive" "$MCP_SERVERS_ROOT/googledrive" "49303"
start_service "reddit" "$MCP_SERVERS_ROOT/reddit" "49425"
start_service "notion" "$MCP_SERVERS_ROOT/notion" "49391"
start_service "slack" "$MCP_SERVERS_ROOT/slack" "49458"

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 3

echo ""
echo "🔍 Checking service health..."

# Health check function for PM2 services
check_service_health() {
    local service_name=$1
    local port=$2
    
    local pm2_status=$(pm2 describe "mcp-$service_name$MODE_SUFFIX" 2>/dev/null | grep "status" | awk '{print $4}' | tr -d '│')
    
    if [ "$pm2_status" = "online" ]; then
        echo "✅ $service_name service is running (PM2 status: online, $MODE mode)"
        
        # Try health check if port is available
        if command -v curl >/dev/null 2>&1; then
            if curl -f -s http://localhost:$port/health > /dev/null 2>&1; then
                echo "   🩺 Health check passed"
            else
                echo "   ⚠️  Health check endpoint not responding (service may still be starting)"
            fi
        fi
    elif [ "$pm2_status" = "errored" ]; then
        echo "❌ $service_name service failed to start (PM2 status: errored)"
    elif [ "$pm2_status" = "stopped" ]; then
        echo "⏸️  $service_name service is stopped"
    elif [ -z "$pm2_status" ]; then
        echo "❓ $service_name service not found in PM2"
    else
        echo "⚠️  $service_name service status: $pm2_status"
    fi
}

# Check each service
check_service_health "figma" "49280"
check_service_health "gmail" "49296"
check_service_health "sheets" "49307"
check_service_health "airtable" "49171"
check_service_health "dropbox" "49264"
check_service_health "googledrive" "49303"
check_service_health "reddit" "49425"
check_service_health "notion" "49391"
check_service_health "slack" "49458"

echo ""
echo "🎉 MCP Services startup complete ($MODE mode)!"
echo ""

# Show mode-specific features
if [ "$LOCAL_DEV" = "true" ]; then
    echo "🏠 Local Development Features Active:"
    echo "  ✅ LOCAL_DEV=true - Email/password authentication"
    echo "  ✅ DISABLE_PAYMENTS=true - Unlimited instances for all users"
    echo "  ✅ NODE_ENV=development - Development mode logging"
    echo "  ✅ File watching enabled - Auto-restart on changes"
    echo ""
fi

echo "📊 Service Status:"
echo "Available services:"
echo "  📐 Figma: http://localhost:49280/health"
echo "  📧 Gmail: http://localhost:49296/health"
echo "  📊 Google Sheets: http://localhost:49307/health"
echo "  📋 Airtable: http://localhost:49171/health"
echo "  📦 Dropbox: http://localhost:49264/health"
echo "  🗂️ Google Drive: http://localhost:49303/health"
echo "  🤖 Reddit: http://localhost:49425/health"
echo ""
echo ""
echo "  📝 Notion: http://localhost:49391/health"
echo "  💬 Slack: http://localhost:49458/health"
echo ""

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "📝 Service Logs:"
echo "  View all logs: pm2 logs"
if [ "$LOCAL_DEV" = "true" ]; then
    echo "  Individual logs: pm2 logs mcp-figma-local | pm2 logs mcp-gmail-local | pm2 logs mcp-sheets-local"
else
    echo "  Individual logs: pm2 logs mcp-figma | pm2 logs mcp-gmail | pm2 logs mcp-sheets"
fi
echo "  Real-time logs: pm2 monit"

echo ""
echo "🛠️  Management commands:"
echo "  pm2 status           - View all services"
if [ "$LOCAL_DEV" = "true" ]; then
    echo "  pm2 restart mcp-*-local    - Restart all local services"
    echo "  pm2 stop mcp-*-local       - Stop all local services"
    echo "  pm2 delete mcp-*-local     - Delete all local services"
else
    echo "  pm2 restart mcp-*    - Restart all services"
    echo "  pm2 stop mcp-*       - Stop all services"
    echo "  pm2 delete mcp-*     - Delete all services"
fi
echo "  pm2 logs             - View all logs"
echo "  pm2 monit            - Real-time monitoring"
echo "  ./scripts/stop-all-services.sh - Stop script"
echo ""
echo "🔄 PM2 Features Active:"
echo "  ✅ Auto-restart on crashes"
echo "  ✅ Process monitoring"
echo "  ✅ Log management"
echo "  ✅ Cluster mode ready"
echo "  ✅ File watching (development)"
echo ""
echo "ℹ️  Services integrate with main backend via credential cache system"