#!/bin/bash

# Local Development MCP Services Startup Script
# Starts all MCP services via PM2 for local development with LOCAL_DEV=true

echo "🚀 Starting MCP Services - Local Development Mode"
echo "=================================================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "❌ PM2 not installed. Install with: npm install -g pm2"; exit 1; }

# Set script directory and backend root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
MCP_SERVERS_ROOT="$BACKEND_ROOT/src/mcp-servers"

echo "📁 Backend root: $BACKEND_ROOT"
echo "📁 MCP servers: $MCP_SERVERS_ROOT"
echo "🏠 Local development mode: LOCAL_DEV=true"

# Change to backend directory
cd "$BACKEND_ROOT" || { echo "❌ Failed to change to backend directory"; exit 1; }

# Function to start a service with PM2 in local development mode
start_service_local() {
    local service_name=$1
    local service_path=$2
    local service_port=$3
    
    echo "📋 Starting $service_name service (local dev)..."
    
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
    
    # Start the service with PM2 in local development mode
    pm2 start "$service_path/index.js" --name "mcp-$service_name-local" \
        --log-type json \
        --merge-logs \
        --max-restarts 10 \
        --watch "$service_path" \
        --ignore-watch "node_modules logs *.log" \
        --env NODE_ENV=development \
        --env LOCAL_DEV=true \
        --env DISABLE_PAYMENTS=true \
        --env SERVICE_NAME="$service_name" \
        --env SERVICE_PORT="$service_port"
    
    echo "✅ $service_name service started with PM2 (local dev mode)"
}

# Stop any existing local development services first
echo ""
echo "🛑 Stopping existing local MCP services..."
pm2 delete mcp-figma-local 2>/dev/null || true
pm2 delete mcp-gmail-local 2>/dev/null || true
pm2 delete mcp-sheets-local 2>/dev/null || true
pm2 delete mcp-airtable-local 2>/dev/null || true
pm2 delete mcp-dropbox-local 2>/dev/null || true
pm2 delete mcp-googledrive-local 2>/dev/null || true
pm2 delete mcp-reddit-local 2>/dev/null || true
pm2 delete mcp-todoist-local 2>/dev/null || true
pm2 delete mcp-github-local 2>/dev/null || true
pm2 delete mcp-notion-local 2>/dev/null || true
pm2 delete mcp-slack-local 2>/dev/null || true
pm2 delete mcp-discord-local 2>/dev/null || true

echo ""
echo "🏁 Starting MCP services in local development mode..."

# Start individual services with PM2 in local development mode
start_service_local "figma" "$MCP_SERVERS_ROOT/figma" "49280"
start_service_local "gmail" "$MCP_SERVERS_ROOT/gmail" "49296"
start_service_local "sheets" "$MCP_SERVERS_ROOT/sheets" "49307"
start_service_local "airtable" "$MCP_SERVERS_ROOT/airtable" "49171"
start_service_local "dropbox" "$MCP_SERVERS_ROOT/dropbox" "49264"
start_service_local "googledrive" "$MCP_SERVERS_ROOT/googledrive" "49303"
start_service_local "reddit" "$MCP_SERVERS_ROOT/reddit" "49425"
start_service_local "todoist" "$MCP_SERVERS_ROOT/todoist" "49491"
start_service_local "github" "$MCP_SERVERS_ROOT/github" "49294"
start_service_local "notion" "$MCP_SERVERS_ROOT/notion" "49391"
start_service_local "slack" "$MCP_SERVERS_ROOT/slack" "49458"
start_service_local "discord" "$MCP_SERVERS_ROOT/discord" "49260"

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 3

echo ""
echo "🔍 Checking service health..."

# Health check function for PM2 services in local mode
check_service_health_local() {
    local service_name=$1
    local port=$2
    
    local pm2_status=$(pm2 describe "mcp-$service_name-local" 2>/dev/null | grep "status" | awk '{print $4}' | tr -d '│')
    
    if [ "$pm2_status" = "online" ]; then
        echo "✅ $service_name service is running (PM2 status: online, local dev mode)"
        
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
check_service_health_local "figma" "49280"
check_service_health_local "gmail" "49296"
check_service_health_local "sheets" "49307"
check_service_health_local "airtable" "49171"
check_service_health_local "dropbox" "49264"
check_service_health_local "googledrive" "49303"
check_service_health_local "reddit" "49425"
check_service_health_local "todoist" "49491"
check_service_health_local "github" "49294"
check_service_health_local "notion" "49391"
check_service_health_local "slack" "49458"
check_service_health_local "discord" "49260"

echo ""
echo "🎉 Local Development MCP Services startup complete!"
echo ""
echo "🏠 Local Development Features Active:"
echo "  ✅ LOCAL_DEV=true - Email/password authentication"
echo "  ✅ DISABLE_PAYMENTS=true - Unlimited instances for all users"
echo "  ✅ NODE_ENV=development - Development mode logging"
echo "  ✅ File watching enabled - Auto-restart on changes"
echo ""
echo "📊 Service Status (Local Development):"
echo "Available services:"
echo "  📐 Figma: http://localhost:49280/health"
echo "  📧 Gmail: http://localhost:49296/health"
echo "  📊 Google Sheets: http://localhost:49307/health"
echo "  📋 Airtable: http://localhost:49171/health"
echo "  📦 Dropbox: http://localhost:49264/health"
echo "  🗂️ Google Drive: http://localhost:49303/health"
echo "  🤖 Reddit: http://localhost:49425/health"
echo "  ✅ Todoist: http://localhost:49491/health"
echo "  🐙 GitHub: http://localhost:49294/health"
echo "  📝 Notion: http://localhost:49391/health"
echo "  💬 Slack: http://localhost:49458/health"
echo "  🎮 Discord: http://localhost:49260/health"

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "📝 Service Logs:"
echo "  View all logs: pm2 logs"
echo "  Individual logs: pm2 logs mcp-figma-local | pm2 logs mcp-gmail-local | pm2 logs mcp-sheets-local"
echo "  Real-time logs: pm2 monit"

echo ""
echo "🛠️  Management commands:"
echo "  pm2 status                    - View all services"
echo "  pm2 restart mcp-*-local       - Restart all local services"
echo "  pm2 stop mcp-*-local          - Stop all local services"
echo "  pm2 delete mcp-*-local        - Delete all local services"
echo "  pm2 logs                      - View all logs"
echo "  pm2 monit                     - Real-time monitoring"
echo "  ./scripts/stop-all-services-local.sh - Stop local services"

echo ""
echo "🔄 PM2 Features Active (Local Development):"
echo "  ✅ Auto-restart on crashes"
echo "  ✅ Process monitoring"
echo "  ✅ Log management"
echo "  ✅ File watching (development mode)"
echo "  ✅ Environment variables: LOCAL_DEV=true, DISABLE_PAYMENTS=true"
echo ""
echo "ℹ️  Services running in local development mode with all local features enabled"