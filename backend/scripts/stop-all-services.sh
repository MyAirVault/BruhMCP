#!/bin/bash

# Phase 2 MCP Services Stop Script
# Stops all MCP services via PM2

echo "🛑 Stopping MCP Services - Phase 2 (PM2)"
echo "========================================="

# Check prerequisites
command -v pm2 >/dev/null 2>&1 || { echo "❌ PM2 not installed"; exit 1; }

# Set script directory and backend root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

echo "📁 Backend root: $BACKEND_ROOT"

# Function to stop a PM2 service
stop_service() {
    local service_name=$1
    local pm2_name="mcp-$service_name"
    
    echo "🛑 Stopping $service_name service..."
    
    # Check if service exists in PM2
    if pm2 describe "$pm2_name" > /dev/null 2>&1; then
        # Stop the service gracefully
        pm2 stop "$pm2_name"
        
        # Delete the service from PM2
        pm2 delete "$pm2_name"
        
        echo "   ✅ $service_name service stopped and removed from PM2"
    else
        echo "   ⚠️  $service_name service not found in PM2"
    fi
}

echo ""
echo "🏁 Stopping MCP services..."

# Stop individual services
stop_service "figma"
stop_service "github"
stop_service "slack"
stop_service "notion"
stop_service "discord"

echo ""
echo "🧹 Cleanup: Ensuring all MCP services are stopped..."
# Stop any remaining MCP services that might be running
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Clean up PM2 logs
echo "🧹 Cleanup: Rotating PM2 logs..."
pm2 flush || true

echo ""
echo "📊 Final PM2 Status:"
pm2 status

echo ""
echo "✅ All MCP services stopped successfully!"
echo ""
echo "🛠️  Commands:"
echo "  Restart services: ./scripts/start-all-services.sh"
echo "  PM2 status: pm2 status"
echo "  PM2 monitoring: pm2 monit"
echo ""
echo "ℹ️  PM2 configuration saved for auto-startup on system reboot"