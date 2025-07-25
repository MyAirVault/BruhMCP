# Backend Scripts

This directory contains utility scripts for managing the BruhMCP backend.

## Available Scripts

### Local Development Scripts

Scripts for managing local development environment and authentication:

#### `local-auth-cli.js`
Command-line tool for managing user authentication in local development mode.

**Usage:**
```bash
# Set password for a user
node scripts/local-auth-cli.js set-password

# List all users and their password status
node scripts/local-auth-cli.js list-users

# Test login credentials
node scripts/local-auth-cli.js test-login

# Show help
node scripts/local-auth-cli.js help
```

**Requirements:** `LOCAL_DEV=true` must be set in environment variables.

#### `setup-local-dev-db.js`
Sets up database schema for local development authentication.

**Usage:**
```bash
# Set up local development database
node scripts/setup-local-dev-db.js
```

**What it does:**
- Adds `password_hash` column to users table
- Creates performance indexes
- Only runs when `LOCAL_DEV=true`
- Safe to run multiple times

### MCP Services Scripts

Scripts for managing MCP services via PM2:

#### `start-all-services-local.sh`
Starts all MCP services in local development mode with PM2.

**Usage:**
```bash
# Start all services in local development mode
./scripts/start-all-services-local.sh

# Or use npm script
npm run dev:local:all-services
```

**Features:**
- Starts services with `LOCAL_DEV=true` and `DISABLE_PAYMENTS=true`
- File watching enabled for development
- Named `mcp-{service}-local` to avoid conflicts
- Health checks and status reporting

#### `stop-all-services-local.sh`
Stops all local development MCP services.

**Usage:**
```bash
# Stop all local services
./scripts/stop-all-services-local.sh

# Or use npm script
npm run stop:local-services
```

### Production Services Scripts

#### `start-all-services.sh`
Starts all MCP services in production mode with PM2.

**Usage:**
```bash
# Start all services in production mode
./scripts/start-all-services.sh

# Or use npm script
npm run dev:all-services
```

#### `stop-all-services.sh`
Stops all production MCP services.

## Script Categories

### Authentication Management
- `local-auth-cli.js` - User password management
- `setup-local-dev-db.js` - Database setup

### Service Management
- `start-all-services-local.sh` - Local development services
- `stop-all-services-local.sh` - Stop local services
- `start-all-services.sh` - Production services
- `stop-all-services.sh` - Stop production services

## Environment Requirements

### Local Development Scripts
- `LOCAL_DEV=true` - Required for all local development scripts
- `DISABLE_PAYMENTS=true` - Recommended for full local development experience
- `NODE_ENV=development` - Recommended for development logging

### Production Scripts
- `NODE_ENV=production` - Recommended for production services
- Proper database connection configured
- PM2 installed globally (`npm install -g pm2`)

## Common Usage Patterns

### Complete Local Development Setup
```bash
# 1. Set up database
node scripts/setup-local-dev-db.js

# 2. Create a user
node scripts/local-auth-cli.js set-password

# 3. Start all services
npm run dev:local:all-services
```

### Service Management
```bash
# View all PM2 processes
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit

# Stop all local services
npm run stop:local-services
```