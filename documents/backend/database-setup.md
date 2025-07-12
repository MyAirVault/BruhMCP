# Database Setup Guide

## Overview

This guide covers setting up the PostgreSQL database for the MCP (Model Context Protocol) management system.

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 18+ for running migration scripts
- Database credentials configured in environment variables

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcp_manager
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Application Configuration
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3000

# Email Configuration (for magic link authentication)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@yourdomain.com

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

## Database Creation

1. **Create Database**
   ```sql
   CREATE DATABASE mcp_manager;
   CREATE USER your_db_user WITH PASSWORD 'your_db_password';
   GRANT ALL PRIVILEGES ON DATABASE mcp_manager TO your_db_user;
   ```

2. **Connect to Database**
   ```bash
   psql -h localhost -U your_db_user -d mcp_manager
   ```

## Migration Scripts

### Available Migrations

The system includes the following migration files in `/backend/src/db/migrations/`:

1. **001_create_users_table.sql** - Creates users table for authentication
2. **002_create_mcp_types_table.sql** - Creates MCP service types table
3. **003_create_api_keys_table.sql** - Creates API keys storage table
4. **004_create_mcp_instances_table.sql** - Creates MCP instances table
5. **006_update_port_range.sql** - Updates port range configuration

### Running Migrations

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run all migrations
npm run db:migrate

# Or run migration script directly
node src/db/scripts/migrate.js
```

### Manual Migration

If you need to run migrations manually:

```bash
# Run each migration file in order
psql -h localhost -U your_db_user -d mcp_manager -f src/db/migrations/001_create_users_table.sql
psql -h localhost -U your_db_user -d mcp_manager -f src/db/migrations/002_create_mcp_types_table.sql
psql -h localhost -U your_db_user -d mcp_manager -f src/db/migrations/003_create_api_keys_table.sql
psql -h localhost -U your_db_user -d mcp_manager -f src/db/migrations/004_create_mcp_instances_table.sql
psql -h localhost -U your_db_user -d mcp_manager -f src/db/migrations/006_update_port_range.sql
```

## Database Schema

### Core Tables

1. **users** - User accounts and authentication
2. **mcp_types** - Available MCP service types (Figma, Slack, etc.)
3. **api_keys** - Stored API credentials for services
4. **mcp_instances** - Active MCP server instances

### Relationships

- Users can have multiple API keys
- Users can create multiple MCP instances
- MCP instances reference MCP types
- MCP instances can use stored API keys

## Database Scripts

### Update MCP Types

Populate the database with supported MCP service types:

```bash
node src/db/scripts/update_mcp_types.js
```

### Verify Database

Verify database setup and MCP types:

```bash
node src/db/scripts/verify_mcp_types.js
```

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL Status**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Verify Database Exists**
   ```bash
   psql -h localhost -U your_db_user -l
   ```

3. **Test Connection**
   ```bash
   psql -h localhost -U your_db_user -d mcp_manager -c "SELECT version();"
   ```

### Permission Issues

1. **Grant Database Permissions**
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE mcp_manager TO your_db_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
   ```

### Migration Failures

1. **Check Migration Order** - Ensure migrations run in the correct sequence
2. **Verify Dependencies** - Some migrations depend on previous ones
3. **Check Syntax** - Validate SQL syntax in migration files
4. **Review Logs** - Check application logs for detailed error messages

## Development Commands

```bash
# Run database migrations
npm run db:migrate

# Update MCP types data
npm run db:update-types

# Verify database setup
npm run db:verify

# Seed database with test data (if available)
npm run db:seed
```

## Production Considerations

1. **Use Environment-Specific Configs** - Separate `.env` files for different environments
2. **Enable SSL** - Configure SSL connections for production databases
3. **Setup Backups** - Implement regular database backup procedures
4. **Monitor Performance** - Set up database monitoring and alerting
5. **Connection Pooling** - Configure appropriate connection pool settings

## Security

1. **Use Strong Passwords** - Generate secure database passwords
2. **Limit Database Access** - Restrict database access to application servers only
3. **Regular Updates** - Keep PostgreSQL updated with security patches
4. **Audit Logs** - Enable PostgreSQL audit logging for security monitoring