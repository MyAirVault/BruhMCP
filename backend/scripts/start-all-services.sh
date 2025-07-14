#!/bin/bash

# Phase 2 MCP Services Startup Script
# Starts all MCP services via PM2 for the cache-based architecture

echo "🚀 Starting MCP Services - Phase 2 (Cache-Based Architecture)"
echo "=============================================================="

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
    
    # Start the service with PM2
    pm2 start "$service_path/index.js" --name "mcp-$service_name" \
        --log-type json \
        --merge-logs \
        --max-restarts 10 \
        --watch "$service_path" \
        --ignore-watch "node_modules logs *.log" \
        --env NODE_ENV=production \
        --env SERVICE_NAME="$service_name" \
        --env SERVICE_PORT="$service_port"
    
    echo "✅ $service_name service started with PM2"
}

# Stop any existing services first
echo ""
echo "🛑 Stopping existing MCP services..."
pm2 delete mcp-figma 2>/dev/null || true

echo ""
echo "🏁 Starting MCP services..."

# Start individual services with PM2
start_service "figma" "$MCP_SERVERS_ROOT/figma" "49280"

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 3

echo ""
echo "🔍 Checking service health..."

# Health check function for PM2 services
check_service_health() {
    local service_name=$1
    local port=$2
    
    local pm2_status=$(pm2 jlist | jq -r ".[] | select(.name==\"mcp-$service_name\") | .pm2_env.status" 2>/dev/null)
    
    if [ "$pm2_status" = "online" ]; then
        echo "✅ $service_name service is running (PM2 status: online)"
        
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

echo ""
echo "🎉 MCP Services startup complete!"
echo ""
echo "📊 Service Status:"
echo "Available services:"
echo "  📐 Figma: http://localhost:49280/health"

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "📝 Service Logs:"
echo "  View all logs: pm2 logs"
echo "  Individual logs: pm2 logs mcp-figma"
echo "  Real-time logs: pm2 monit"

echo ""
echo "🛠️  Management commands:"
echo "  pm2 status           - View all services"
echo "  pm2 restart all      - Restart all services"
echo "  pm2 stop all         - Stop all services"
echo "  pm2 delete all       - Delete all services"
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