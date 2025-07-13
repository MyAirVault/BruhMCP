#!/bin/bash

# Phase 1 MCP Services Startup Script
# Starts all MCP services via PM2 according to documentation

echo "🚀 Starting MCP Services - Phase 1"
echo "=================================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "❌ PM2 not installed"; exit 1; }

# Set script directory and backend root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
MCP_SERVERS_ROOT="$BACKEND_ROOT/src/mcp-servers"

echo "📁 Backend root: $BACKEND_ROOT"
echo "📁 MCP servers: $MCP_SERVERS_ROOT"

# Change to backend directory
cd "$BACKEND_ROOT" || { echo "❌ Failed to change to backend directory"; exit 1; }

# Stop any existing MCP services
echo ""
echo "🛑 Stopping existing MCP services..."
pm2 delete mcp-figma 2>/dev/null || true
# pm2 delete mcp-github 2>/dev/null || true
# pm2 delete mcp-slack 2>/dev/null || true
# pm2 delete mcp-notion 2>/dev/null || true
# pm2 delete mcp-discord 2>/dev/null || true

echo ""
echo "🏁 Starting MCP services..."

# Start Figma service
echo "📋 Starting Figma service..."
pm2 start "$MCP_SERVERS_ROOT/figma/index.js" --name "mcp-figma" --log-type json

# TODO: Uncomment as other services are implemented
# echo "📋 Starting GitHub service..."
# pm2 start "$MCP_SERVERS_ROOT/github/index.js" --name "mcp-github" --log-type json

# echo "📋 Starting Slack service..."
# pm2 start "$MCP_SERVERS_ROOT/slack/index.js" --name "mcp-slack" --log-type json

# echo "📋 Starting Notion service..."
# pm2 start "$MCP_SERVERS_ROOT/notion/index.js" --name "mcp-notion" --log-type json

# echo "📋 Starting Discord service..."
# pm2 start "$MCP_SERVERS_ROOT/discord/index.js" --name "mcp-discord" --log-type json

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

echo ""
echo "🔍 Checking service health..."

# Health check for Figma service
echo "🩺 Checking Figma service health..."
if curl -f -s http://localhost:49280/health > /dev/null; then
    echo "✅ Figma service is healthy"
else
    echo "❌ Figma service health check failed"
fi

# TODO: Add health checks for other services
# echo "🩺 Checking GitHub service health..."
# if curl -f -s http://localhost:49294/health > /dev/null; then
#     echo "✅ GitHub service is healthy"
# else
#     echo "❌ GitHub service health check failed"
# fi

echo ""
echo "📊 PM2 status:"
pm2 status

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "🎉 MCP Services startup complete!"
echo ""
echo "Available services:"
echo "  📐 Figma: http://localhost:49280/health"
# echo "  🐙 GitHub: http://localhost:49294/health"
# echo "  💬 Slack: http://localhost:XXXX/health"
# echo "  📝 Notion: http://localhost:XXXX/health"
# echo "  🎮 Discord: http://localhost:XXXX/health"

echo ""
echo "🛠️  Management commands:"
echo "  pm2 status        - View all services"
echo "  pm2 logs          - View all logs"
echo "  pm2 logs mcp-figma - View Figma logs"
echo "  pm2 restart all   - Restart all services"
echo "  pm2 stop all      - Stop all services"
echo "  pm2 delete all    - Delete all services"