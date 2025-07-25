#!/bin/bash

# Local Development MCP Services Stop Script
# Stops all local development MCP services

echo "🛑 Stopping Local Development MCP Services"
echo "=========================================="

# Stop all local development services
echo "🔄 Stopping local MCP services..."

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
echo "✅ All local development MCP services stopped"
echo ""
echo "📊 Remaining PM2 processes:"
pm2 status

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "🎉 Local development cleanup complete!"