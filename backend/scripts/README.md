# Service Management Scripts

This directory contains scripts for managing MCP services in the database.

## Overview

These scripts help you add services from the `mcp-ports/` directory to the database automatically. Each service must have a valid `config.json` file with the required configuration.

## Scripts

### 1. Single Service Registration

**File:** `add-service-to-db.js`

Add a single service to the database from its config file.

#### Usage

```bash
cd backend/scripts
node add-service-to-db.js <service-name>
```

#### Examples

```bash
node add-service-to-db.js slack
node add-service-to-db.js notion
node add-service-to-db.js stripe
node add-service-to-db.js openai
```

#### What it does

1. Reads `mcp-ports/<service-name>/config.json`
2. Validates required fields and configuration
3. Checks for existing services and port conflicts
4. Generates UUID for service ID
5. Inserts service into `mcp_table` database
6. Sets icon path to `/mcp-logos/<service-name>.svg`

#### Output Example

```
📖 Reading config for github...
🔍 Checking if github already exists...
🚪 Checking for port conflicts on 49294...
📝 Adding github to database...
✅ GitHub added successfully!
📊 Service details:
   🆔 Service ID: a1cc7ced-bfca-4dcc-a736-519b2861ee0b
   📛 Service Name: github
   🏷️  Display Name: GitHub
   🚪 Port: 49294
   🔐 Auth Type: oauth
   🎨 Icon Path: /mcp-logos/github.svg
   ✅ Active: true
   📝 Description: GitHub is a code hosting platform for version control...
   📅 Created: Sun Jul 13 2025 10:29:17 GMT+0100

🎉 Service registration complete!
```

### 2. Batch Service Registration

**File:** `add-all-services.js`

Add all services from `mcp-ports/` directory to the database in one command.

#### Usage

```bash
cd backend/scripts
node add-all-services.js
```

#### What it does

1. Scans entire `mcp-ports/` directory for service folders
2. Processes each service with a `config.json` file
3. Skips services that already exist in database
4. Provides comprehensive summary report
5. Shows which services were added, skipped, or failed

#### Output Example

```
🔍 Scanning mcp-ports directory for services...
📁 Found 423 potential service directories:
   - figma
   - github
   - slack
   - notion
   - stripe
   ...

📋 Processing figma...
⚠️  figma already exists, skipping...

📋 Processing github...
✅ GitHub added successfully!

🎯 BATCH PROCESSING SUMMARY
===========================
✅ Successfully added: 15
   - github
   - slack
   - notion
   ...

⚠️  Skipped (already exist): 3
   - figma
   - stripe
   - openai

❌ Failed: 2
   - invalid-service: Missing required field 'port'
   - broken-service: Invalid JSON in config.json

📊 Total processed: 20 services
```

## Service Configuration Requirements

Each service must have a `config.json` file in `mcp-ports/<service-name>/` with these required fields:

### Required Fields

```json
{
	"name": "service-name",
	"displayName": "Service Display Name",
	"port": 49160,
	"auth": {
		"type": "api_key"
	}
}
```

### Optional Fields

```json
{
	"description": "Service description",
	"category": "developer",
	"version": "1.0.0",
	"api": {
		"baseURL": "https://api.service.com",
		"version": "v1"
	}
}
```

### Supported Authentication Types

- `api_key` - API key authentication
- `oauth` - OAuth 1.0/2.0 authentication
- `oauth2` - OAuth 2.0 (normalized to `oauth` in database)
- `basic_auth` - Basic HTTP authentication
- `bearer_token` - Bearer token authentication

### Port Requirements

- Must be integer between 49160-49999
- Must be unique across all services
- Script will check for conflicts automatically

## Database Schema

Services are stored in the `mcp_table` with these fields:

```sql
CREATE TABLE mcp_table (
    mcp_service_id UUID PRIMARY KEY,
    mcp_service_name VARCHAR NOT NULL UNIQUE,
    display_name VARCHAR NOT NULL,
    description TEXT,
    icon_url_path VARCHAR,
    port INTEGER NOT NULL UNIQUE,
    type VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Common Errors and Solutions

**Config file not found:**

```
❌ Config file not found: /path/to/mcp-ports/service/config.json
```

- Ensure the service directory exists in `mcp-ports/`
- Ensure `config.json` file exists in the service directory

**Missing required fields:**

```
❌ Missing required fields in config: port, auth
```

- Add missing fields to the `config.json` file
- Check the required fields list above

**Invalid port:**

```
❌ Invalid port 8080. Must be integer between 49160-49999
```

- Update port to be in the valid range (49160-49999)
- Ensure port is not already used by another service

**Port conflict:**

```
❌ Port 49280 is already in use by service: figma
```

- Choose a different port number
- Check existing services in database for port usage

**Service already exists:**

```
⚠️  Service 'figma' already exists in database
```

- Service is already registered, no action needed
- Use different service name if this is a new service

**Invalid auth type:**

```
❌ Invalid auth type 'custom'. Must be: api_key, oauth, oauth2, basic_auth, bearer_token
```

- Use one of the supported authentication types
- Update `auth.type` field in config.json

## Icon Management

- Icons are automatically mapped to `/mcp-logos/<service-name>.svg`
- Ensure corresponding SVG file exists in `backend/public/mcp-logos/`
- Icons are used in the frontend service catalog

## Database Connection

Scripts use the database configuration from `../src/db/config.js`:

- Automatically loads environment variables from `.env`
- Uses PostgreSQL connection pool
- Handles connection cleanup automatically

## Debugging

Enable verbose logging by setting environment variable:

```bash
DEBUG=true node add-service-to-db.js github
```

View database contents:

```bash
node -e "
import { pool } from '../src/db/config.js';
const result = await pool.query('SELECT * FROM mcp_table ORDER BY created_at;');
console.table(result.rows);
await pool.end();
"
```

## File Structure

```
backend/scripts/
├── README.md                 # This documentation
├── add-service-to-db.js      # Single service registration
└── add-all-services.js       # Batch service registration
```

## Next Steps

After adding services to the database:

1. **Phase 1**: Services will be available for startup script inclusion
2. **Phase 2**: Services will appear in user interface for instance creation
3. **Service Implementation**: Create corresponding service implementations in `backend/src/mcp-servers/`

## Support

For issues or questions:

- Check error messages for specific guidance
- Verify config.json format and required fields
- Ensure database connection is working
- Check logs for detailed error information
