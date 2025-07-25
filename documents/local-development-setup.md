# Local Development Setup Guide

This document explains how to set up and use the complete local development environment for BruhMCP, including authentication, billing, and database configuration.

## Overview

The local development system provides:
- Simplified email/password authentication (no SMTP required)
- Disabled payment enforcement (unlimited pro features)
- Direct database user creation
- CLI tools for user management
- Complete isolation from production systems

## Step-by-Step Setup Procedure

### Step 1: Environment Configuration

Create or update your local `.env` file with the following variables:

```bash
# Local Development Mode
LOCAL_DEV=true
DISABLE_PAYMENTS=true
NODE_ENV=development

# Optional local settings
LOCAL_USER_EMAIL=dev@localhost.com

# Required backend settings
PORT=5000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
PUBLIC_DOMAIN=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Database connection (adjust as needed)
DATABASE_URL=your_local_database_url
```

### Step 2: Database Setup

Run the local development database setup script:

```bash
# Set up database schema for local development
node scripts/setup-local-dev-db.js

# Or add to package.json and run:
npm run setup:local-dev
```

This script:
- Only runs when `LOCAL_DEV=true` is set
- Adds password_hash column to users table
- Creates necessary indexes
- Provides safety checks against production usage

### Step 3: Install Dependencies

Ensure all required dependencies are installed:

```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies  
cd frontend && npm install
```

### Step 4: Build Frontend (if serving from backend)

If you're serving the frontend from the backend (single server setup):

```bash
# Build frontend for local development
cd frontend && npm run build

# The backend will serve the built frontend files
```

### Step 5: Start Development Services

Choose one of these approaches based on your setup:

#### Option A: All Services + Backend + Frontend (Recommended)
```bash
# Start all MCP services + backend in local development mode
cd backend && npm run dev:local:all-services
```

#### Option B: Single Server (Backend serves Frontend)
```bash
# Start backend only in local development mode
cd backend && npm run dev:local
```

#### Option C: Separate Servers (Development)
```bash
# Start backend in local development mode
cd backend && npm run dev:local

# Start frontend dev server (in separate terminal)
cd frontend && npm run dev
```

## Environment Variables Reference

### Authentication Settings
- `LOCAL_DEV=true` - Enables local email/password authentication
- `LOCAL_USER_EMAIL` - Default email for CLI operations (optional)

### Billing Settings
- `DISABLE_PAYMENTS=true` - Disables payment enforcement
- `NODE_ENV=development` - Required for payment bypass

### What These Settings Enable

#### 🔐 Authentication Features
- Email/password login without SMTP setup
- Automatic user creation in database
- CLI tools for password management
- Same JWT token flow as production

#### 🚀 Pro Plan Features for All Users
- Unlimited MCP instances for all users
- No payment enforcement
- No subscription limits
- Bypass all plan restrictions

#### 🛑 Disabled Services
- SMTP email sending
- Plan monitoring service
- Subscription expiration
- Payment flow requirements

## CLI Tools

### Available Commands

- `set-password` - Set or update password for any user
- `list-users` - Show all users and their password status  
- `test-login` - Test login credentials
- `help` - Show help information

### Usage Examples

Setting a password for a user:
```
npm run auth:set-password
```

Listing all users:
```
npm run auth:list-users
```

Testing login credentials:
```
node scripts/local-auth-cli.js test-login
```

## Frontend Integration

### Environment Detection

The frontend automatically detects local development mode by checking if the local auth API endpoints are available.

### Authentication Flow

1. Frontend detects local mode
2. Shows email/password form instead of magic link form
3. User enters credentials
4. System creates user in database if new, or verifies password if existing
5. Returns JWT token and sets auth cookie (same as production)

## API Endpoints

### Local Auth Routes (only available when LOCAL_DEV=true)

- `POST /api/local-auth/login` - Login or register with email/password
- `GET /api/local-auth/environment` - Get environment configuration
- `POST /api/local-auth/test-credentials` - Test credentials without logging in
- `POST /api/local-auth/logout` - Logout user

### Production Auth Routes

When `LOCAL_DEV=true`, the production magic link endpoints return errors directing users to use local authentication.

## Security Considerations

### Local Development Only

- Password authentication is only available when `LOCAL_DEV=true`
- Local auth routes return 404 errors in production
- Password hashes are stored in database but only used in local mode

### Password Requirements

- Minimum 6 characters
- Stored as bcrypt hashes
- CLI password input is hidden

## File Structure

```
backend/src/local_development/
├── config/localMode.js
├── controllers/localAuthController.js
├── routes/localAuthRoutes.js
├── services/localUserService.js
└── queries/localUserQueries.js

frontend/src/local_development/
├── components/LocalAuthForm.tsx
├── services/localAuthService.ts
└── utils/environmentDetection.ts

backend/scripts/
└── local-auth-cli.js

backend/src/db/migrations/
└── 008_add_password_hash_to_users.sql
```

## Integration Steps

### Backend Integration

1. Import and register local auth routes
2. Update email service to check local mode
3. Modify main auth controller for local mode redirects
4. Add npm scripts for CLI tools

### Frontend Integration

1. Use environment detection utilities
2. Conditionally render LocalAuthForm component
3. Handle local auth responses

## Integration Requirements

After creating all the local development files, you need to integrate them into your main application:

### Backend Integration

1. **Register local auth routes** in your main app file:
```javascript
import localAuthRoutes from './src/local_development/routes/localAuthRoutes.js';
app.use('/api/local-auth', localAuthRoutes);
```

2. **Update email service** to check local mode and skip SMTP
3. **Modify main auth controller** to redirect to local auth in local mode
4. **Add npm scripts** for CLI tools and local development

### Frontend Integration

1. **Use environment detection** to check if local mode is available
2. **Conditionally render LocalAuthForm** instead of magic link form
3. **Handle local auth responses** and user creation flow

### Package.json Scripts

Add these scripts to your backend package.json:

```json
{
  "scripts": {
    "dev:local": "LOCAL_DEV=true DISABLE_PAYMENTS=true npm run dev",
    "dev:local:build": "cd ../frontend && npm run build && cd ../backend && npm run dev:local",
    "dev:local:all-services": "./scripts/start-all-services-local.sh && npm run dev:local",
    "setup:local-dev": "node scripts/setup-local-dev-db.js",
    "auth:set-password": "node scripts/local-auth-cli.js set-password",
    "auth:list-users": "node scripts/local-auth-cli.js list-users",
    "auth:test-login": "node scripts/local-auth-cli.js test-login",
    "stop:local-services": "./scripts/stop-all-services-local.sh"
  }
}
```

### Serving Frontend from Backend

If your backend serves the frontend build files, ensure your backend is configured to:

1. **Serve static files** from the frontend build directory:
```javascript
// In your main app file (e.g., app.js or server.js)
import path from 'path';
import express from 'express';

// Serve frontend build files in production or local mode
if (process.env.NODE_ENV === 'production' || process.env.LOCAL_DEV === 'true') {
    const frontendBuildPath = path.join(process.cwd(), '../frontend/dist');
    app.use(express.static(frontendBuildPath));
    
    // Serve index.html for client-side routing
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(frontendBuildPath, 'index.html'));
        }
    });
}
```

2. **Update environment variables** for single server setup:
```bash
# When serving frontend from backend
FRONTEND_URL=http://localhost:5000  # Same as backend URL
PUBLIC_DOMAIN=http://localhost:5000
CORS_ORIGIN=http://localhost:5000
```

## Code Implementation Details

### Plan Limits Bypass

The system includes helper functions to detect local development and bypass plan limits:

```javascript
/**
 * Check if payments are disabled in local development
 */
export function isPaymentsDisabled() {
    return process.env.DISABLE_PAYMENTS === 'true' && 
           (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local');
}

/**
 * Get instance limit for plan (unlimited in local dev)
 */
export function getInstanceLimitForPlan(planType) {
    if (isPaymentsDisabled()) {
        return null; // unlimited
    }
    // ... normal plan logic
}
```

### Plan Monitoring Service

The plan monitoring service is automatically disabled in local development:

```javascript
const skipInLocalDev = isPaymentsDisabled();

if (autoStartEnabled && !skipInLocalDev) {
    planMonitoringService.start(checkInterval);
} else if (skipInLocalDev) {
    console.log('🚫 Plan Monitoring Service disabled in local development');
}
```

## Production vs Development Comparison

### Local Development Mode
```bash
LOCAL_DEV=true
DISABLE_PAYMENTS=true
NODE_ENV=development
```
**Result:** 
- Email/password authentication
- No SMTP required
- Unlimited instances for all users
- No payment enforcement
- CLI password management

### Production Mode
```bash
# LOCAL_DEV not set (or false)
DISABLE_PAYMENTS=false
NODE_ENV=production
```
**Result:**
- Magic link authentication via SMTP
- Normal plan enforcement (free=1 instance, pro=unlimited)
- Payment flows active
- Subscription monitoring active

## Development Workflow Examples

### Complete Local Development Setup (All Services - Recommended)

1. **Initial setup**:
```bash
# Set up environment
echo "LOCAL_DEV=true" >> backend/.env
echo "DISABLE_PAYMENTS=true" >> backend/.env
echo "NODE_ENV=development" >> backend/.env

# Set up database
cd backend && node scripts/setup-local-dev-db.js

# Create a user
npm run auth:set-password
```

2. **Daily development**:
```bash
# Start all MCP services + backend in local development mode
npm run dev:local:all-services
```

3. **Stop all services when done**:
```bash
# Stop all local MCP services
npm run stop:local-services
```

### Alternative Workflows

#### Single Server (Backend serves Frontend)

**Daily development**:
```bash
# Build frontend and start backend only
npm run dev:local:build
```

#### Separate Servers (Development with Hot Reload)

**Daily development**:
```bash
# Terminal 1: Start backend
npm run dev:local

# Terminal 2: Start frontend dev server with hot reload
cd frontend && npm run dev
```

## MCP Services in Local Development

### What `dev:local:all-services` Does

This command runs the equivalent of `dev:all-services` but with local development settings:

1. **Starts all MCP services via PM2** with these environment variables:
   - `LOCAL_DEV=true` - Enables local authentication
   - `DISABLE_PAYMENTS=true` - Unlimited instances for all users
   - `NODE_ENV=development` - Development mode logging

2. **Services started**:
   - Figma, Gmail, Google Sheets, Airtable
   - Dropbox, Google Drive, Reddit, Todoist
   - GitHub, Notion, Slack, Discord

3. **PM2 Features**:
   - Auto-restart on crashes
   - File watching (restart on code changes)
   - Process monitoring
   - Centralized logging

### Managing Local MCP Services

```bash
# View all running services
pm2 status

# View logs from all services
pm2 logs

# Real-time monitoring
pm2 monit

# Restart a specific service
pm2 restart mcp-figma-local

# Stop all local services
npm run stop:local-services

# Or stop individual services
pm2 stop mcp-gmail-local
```

## Troubleshooting

### Common Issues

- **CLI not working**: Ensure `LOCAL_DEV=true` is set in environment
- **Database setup fails**: Check that `LOCAL_DEV=true` and database connection is working
- **Routes not found**: Verify local auth routes are registered in main app file
- **Frontend not detecting local mode**: Check that `/api/local-auth/environment` endpoint is accessible
- **Still getting plan limits**: Verify both `LOCAL_DEV=true` AND `DISABLE_PAYMENTS=true` are set
- **Frontend 404 errors**: When serving from backend, ensure static file serving is configured correctly
- **CORS issues**: When using single server, ensure CORS_ORIGIN matches your server URL

### Development Tips

- Use default email `dev@localhost.com` for quick testing
- CLI provides helpful error messages and suggestions
- All local auth activity is logged to console for debugging
- Password status is visible in the user list command
- Database setup script can be run multiple times safely
- Use `dev:local:build` script for quick frontend rebuilds
- Single server setup is closer to production environment
- Separate servers allow for frontend hot reloading during development

### Testing Payment Features Locally

If you need to test payment flows in development:
- Temporarily set `DISABLE_PAYMENTS=false`
- Configure Razorpay test keys
- Use Razorpay test payment methods
- Re-enable `DISABLE_PAYMENTS=true` when done

## Security Considerations

### Local Development Only

- Password authentication only works when `LOCAL_DEV=true`
- Local auth routes return 404 errors in production
- Database setup script refuses to run without `LOCAL_DEV=true`
- All local development features automatically disabled in production

### Production Safety

- **Never set `LOCAL_DEV=true` in production**
- **Never set `DISABLE_PAYMENTS=true` in production**
- **Always verify environment variables before deployment**
- **Production requires proper SMTP and Razorpay configuration**

### Password Security

- Minimum 6 character requirement
- Passwords stored as bcrypt hashes
- CLI password input is hidden during entry
- Password hashes only used when in local development mode