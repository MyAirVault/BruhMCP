# Airtable MCP Server - Available Endpoints & Actions

## User Flow: Frontend Selection to LLM Integration

### Complete System Flow: User Selects Airtable Service

#### 1. Frontend Service Selection

**User Action**: Dashboard → "Create New MCP" → Select "Airtable"  
**Flow**:

1. **Dashboard Page** → User clicks "Create New MCP" button

    - **File**: `/frontend/src/pages/Dashboard.tsx`
    - **Function**: Opens CreateMCPModal component
    - **Action**: Displays service selection modal

2. **Service Selection** → TypeDropdown loads available services

    - **File**: `/frontend/src/components/ui/form/TypeDropdown.tsx`
    - **API Call**: `GET /api/v1/mcp-types`
    - **Action**: Fetches available services from database

3. **Dynamic Form Generation** → Form adapts for Airtable (API Key type)

    - **File**: `/frontend/src/components/ui/form/CredentialFields.tsx`
    - **Function**: Renders API key input field
    - **Action**: Shows custom name, API key, and expiration fields

4. **Real-time Validation** → Credentials validated as user types
    - **File**: `/frontend/src/hooks/useCreateMCPForm.ts`
    - **API Call**: `POST /api/v1/mcps/validate-credentials`
    - **Action**: Validates Airtable API key against Airtable API

#### 2. Backend Instance Creation

**User Action**: User clicks "Create Instance" button  
**Flow**:

1. **Request Validation** → Zod schema validation

    - **File**: `/backend/src/controllers/mcpInstances/crud/createMCP.js`
    - **Function**: `createMCP` controller
    - **Action**: Validates request body and credentials

2. **Service Definition Lookup** → Queries service configuration

    - **Database**: `mcp_table` query for Airtable service
    - **Action**: Retrieves service configuration and port number

3. **Database Storage** → Creates instance records

    - **Tables**: `mcp_service_table` and `mcp_credentials`
    - **Action**: Stores instance with encrypted API key

4. **URL Generation** → Creates instance-specific URL
    - **Format**: `{PUBLIC_DOMAIN}/airtable/{instance_id}`
    - **Action**: Returns URL to frontend for LLM integration

#### 3. LLM Integration Setup

**User Action**: User adds generated URL to LLM configuration  
**Flow**:

1. **LLM Connection** → LLM connects to instance URL

    - **Endpoint**: `POST /airtable/{instance_id}/mcp`
    - **Protocol**: JSON-RPC 2.0 over HTTP using MCP SDK
    - **Action**: Establishes MCP session with Airtable service

2. **Authentication Middleware** → Validates instance and credentials

    - **File**: `/backend/src/mcp-servers/airtable/middleware/credential-auth.js`
    - **Function**: `credentialAuthMiddleware`
    - **Action**: Looks up instance, validates API key, caches credentials

3. **Handler Creation** → Creates persistent MCP handler
    - **File**: `/backend/src/mcp-servers/airtable/services/session/handler-sessions.js`
    - **Function**: `getOrCreateHandler`
    - **Action**: Creates AirtableMCPHandler with authenticated API access

#### 4. Tool Execution Flow (e.g., List Records)

**User Action**: LLM calls `list_records` tool  
**Flow**:

1. **MCP Request Processing**

    - **File**: `/backend/src/mcp-servers/airtable/endpoints/mcp-handler.js:524`
    - **Class**: `AirtableMCPHandler`
    - **Method**: `handleMCPRequest`
    - **Action**: Processes JSON-RPC via MCP SDK

2. **Tool Execution**

    - **File**: `/backend/src/mcp-servers/airtable/endpoints/mcp-handler.js:86`
    - **Method**: `list_records` tool handler
    - **Action**: Validates input, applies performance measurement

3. **Service Layer Processing**

    - **File**: `/backend/src/mcp-servers/airtable/services/airtable-service.js`
    - **Function**: `listRecords` or `getAllRecords`
    - **Action**: Handles optimization, caching, and pagination

4. **External API Call**

    - **File**: `/backend/src/mcp-servers/airtable/api/airtable-api.js`
    - **Function**: Airtable API call with retry logic
    - **Action**: Makes authenticated call to Airtable API

5. **Response Processing**
    - **Processing**: Response optimization via ResponseOptimizer
    - **Formatting**: YAML formatting for better readability
    - **Transport**: Send back via MCP transport to LLM

### Key System Components

-   **Frontend**: `/frontend/src/pages/Dashboard.tsx` - Service selection UI
-   **Backend API**: `/backend/src/controllers/mcpInstances/crud/createMCP.js` - Instance creation
-   **Database**: `mcp_service_table`, `mcp_credentials` - Instance storage
-   **MCP Server**: `/backend/src/mcp-servers/airtable/index.js:111` - Multi-tenant routing
-   **Authentication**: `/middleware/credential-auth.js` - Instance-based auth
-   **Service Layer**: `/services/airtable-service.js` - Business logic abstraction

### Database Schema

```sql
-- Service instances
mcp_service_table (
  instance_id UUID PRIMARY KEY,
  user_id UUID,
  mcp_service_id UUID,
  custom_name TEXT,
  status TEXT,
  expires_at TIMESTAMP
)

-- Credentials storage
mcp_credentials (
  instance_id UUID,
  api_key TEXT (encrypted),
  created_at TIMESTAMP
)
```

### Generated URLs

-   **Health Check**: `{PUBLIC_DOMAIN}/airtable/{instance_id}/health`
-   **MCP Endpoint**: `{PUBLIC_DOMAIN}/airtable/{instance_id}/mcp`
-   **Direct MCP**: `{PUBLIC_DOMAIN}/airtable/{instance_id}` (Claude Code compatibility)

---

Your Airtable MCP server provides comprehensive access to the Airtable API through 10 different tools/endpoints with enterprise-grade optimization and features:

## 📊 **Base Management**

| Tool              | Description                                 | Required Parameters |
| ----------------- | ------------------------------------------- | ------------------- |
| `list_bases`      | List all accessible Airtable bases          | None                |
| `get_base_schema` | Get the schema for a specific Airtable base | `baseId`            |

## 📋 **Record Operations**

| Tool            | Description                                    | Required Parameters                       |
| --------------- | ---------------------------------------------- | ----------------------------------------- |
| `list_records`  | List records from a table in an Airtable base  | `baseId`, `tableId`                       |
| `get_record`    | Get a specific record from an Airtable table   | `baseId`, `tableId`, `recordId`           |
| `create_record` | Create a new record in an Airtable table       | `baseId`, `tableId`, `fields`             |
| `update_record` | Update an existing record in an Airtable table | `baseId`, `tableId`, `recordId`, `fields` |
| `delete_record` | Delete a record from an Airtable table         | `baseId`, `tableId`, `recordId`           |

## 🔢 **Batch Operations**

| Tool                      | Description                                                          | Required Parameters            |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------ |
| `create_multiple_records` | Create multiple records in an Airtable table (max 100, auto-batched) | `baseId`, `tableId`, `records` |

## 🔍 **Advanced Search**

| Tool             | Description                                            | Required Parameters |
| ---------------- | ------------------------------------------------------ | ------------------- |
| `search_records` | Search for records across one or more tables in a base | `baseId`, `query`   |

## 📊 **Monitoring & Statistics**

| Tool                | Description                                          | Required Parameters |
| ------------------- | ---------------------------------------------------- | ------------------- |
| `get_service_stats` | Get performance and usage statistics for the service | None                |

## 🔐 **Authentication**

Your Airtable MCP server uses **API token authentication**:

-   Requires Airtable API key starting with `pat` (Personal Access Token)
-   No OAuth flow - simpler authentication model
-   API key passed via `Authorization: Bearer` header

## 🚀 **Common Use Cases**

### **Database Management**

```javascript
// List all your accessible bases
list_bases();

// Get schema of a specific base
get_base_schema({ baseId: 'appABC123' });

// List records with filtering
list_records({
	baseId: 'appABC123',
	tableId: 'tblDEF456',
	filterByFormula: "Status = 'Active'",
	maxRecords: 50,
});
```

### **Record Operations**

```javascript
// Get a specific record
get_record({
	baseId: 'appABC123',
	tableId: 'tblDEF456',
	recordId: 'recGHI789',
});

// Create a new record
create_record({
	baseId: 'appABC123',
	tableId: 'tblDEF456',
	fields: {
		Name: 'John Doe',
		Email: 'john@example.com',
		Status: 'Active',
	},
});

// Update existing record
update_record({
	baseId: 'appABC123',
	tableId: 'tblDEF456',
	recordId: 'recGHI789',
	fields: {
		Status: 'Inactive',
	},
});
```

### **Batch Operations**

```javascript
// Create multiple records at once (enhanced with batching)
create_multiple_records({
	baseId: 'appABC123',
	tableId: 'tblDEF456',
	records: [
		{ fields: { Name: 'Alice', Email: 'alice@example.com' } },
		{ fields: { Name: 'Bob', Email: 'bob@example.com' } },
		// ... up to 100 records (automatically batched)
	],
});

// Search across multiple tables
search_records({
	baseId: 'appABC123',
	query: 'john',
	tables: ['tblUsers', 'tblContacts'],
	fields: ['Name', 'Email'],
	maxRecords: 50,
});

// Get all records with automatic pagination
list_records({
	baseId: 'appABC123',
	tableId: 'tblDEF456',
	getAllRecords: true,
	filterByFormula: "Status = 'Active'",
});

// Monitor service performance
get_service_stats();
```

## 🚀 **Enhanced Features**

### **Enterprise-Grade Performance**

-   **Response Optimization**: Automatic payload size reduction and compression
-   **Multi-Layer Caching**: Schema caching (1 hour), record caching (5 minutes), validation caching (5 minutes)
-   **Rate Limiting**: Built-in 5 requests/second rate limiting with intelligent queuing
-   **Automatic Retry**: Exponential backoff retry logic with circuit breaker
-   **Performance Monitoring**: Real-time performance metrics and logging

### **Advanced Data Processing**

-   **Response Simplification**: Cleaner, more readable response formats
-   **Intelligent Batching**: Automatic batching for large datasets (up to 100 records)
-   **Data Validation**: Comprehensive input validation with field type checking
-   **Data Sanitization**: XSS and SQL injection protection
-   **Error Handling**: Sophisticated error categorization and recovery

### **Search & Discovery**

-   **Cross-Table Search**: Search across multiple tables simultaneously
-   **Field-Specific Search**: Target specific fields for more precise results
-   **Formula-Based Filtering**: Advanced filtering with Airtable formulas
-   **Automatic Pagination**: Seamless handling of large result sets

### **Security & Reliability**

-   **Token Validation**: Real-time API token validation and scope checking
-   **Secure Logging**: Sensitive data redaction in logs
-   **Health Monitoring**: Comprehensive health checks and diagnostics
-   **Graceful Degradation**: Fallback mechanisms for service resilience

## 📊 **API Coverage**

Your implementation covers **comprehensive Airtable API endpoints**:

-   ✅ Bases API (list bases, get schema) - **Enhanced with caching**
-   ✅ Records API (CRUD operations) - **Enhanced with validation & optimization**
-   ✅ Batch operations (create multiple) - **Enhanced with intelligent batching**
-   ✅ Search operations - **NEW: Cross-table search functionality**
-   ✅ Performance monitoring - **NEW: Real-time statistics**
-   ❌ Tables API (create/update/delete tables) - **Future enhancement**
-   ❌ Fields API (create/update/delete fields) - **Future enhancement**
-   ❌ Views API (create/update/delete views) - **Future enhancement**
-   ❌ Attachments API (file uploads) - **Future enhancement**
-   ❌ Webhooks API - **Future enhancement**
-   ❌ Sync API - **Future enhancement**

## 🔧 **Technical Implementation Details**

### **Error Handling**

All endpoints include basic error handling:

-   **401**: Invalid Airtable API key
-   **403**: Insufficient permissions
-   **404**: Resource not found
-   **422**: Invalid request parameters
-   **General**: Network and parsing errors

### **Validation**

Input validation includes:

-   Base ID format validation (`app` prefix)
-   Table ID format validation (`tbl` prefix)
-   Record ID format validation (`rec` prefix)
-   Field validation for record operations

### **Rate Limiting**

-   No built-in rate limiting (relies on Airtable API limits)
-   Airtable API allows 5 requests per second per base
-   Error responses include Airtable's rate limit information

## 🔄 **Integration Examples**

### **Frontend Integration**

```typescript
// Example usage in your frontend
const airtableService = {
	async getBases() {
		return await apiCall('list_bases');
	},

	async getTableRecords(baseId: string, tableId: string) {
		return await apiCall('list_records', { baseId, tableId });
	},

	async createRecord(baseId: string, tableId: string, fields: any) {
		return await apiCall('create_record', { baseId, tableId, fields });
	},
};
```

### **Data Sync Example**

```javascript
// Sync data from external source to Airtable
async function syncToAirtable(data) {
	const baseId = 'appABC123';
	const tableId = 'tblDEF456';

	// Create records in batches of 10
	const batches = [];
	for (let i = 0; i < data.length; i += 10) {
		batches.push(data.slice(i, i + 10));
	}

	for (const batch of batches) {
		const records = batch.map(item => ({ fields: item }));
		await create_multiple_records({ baseId, tableId, records });
	}
}
```

## 🎯 **Performance & Reliability**

### **✅ Enterprise-Grade Features Now Available**

1. **✅ Advanced service layer** - Comprehensive API abstraction with AirtableService
2. **✅ Response optimization** - Automatic payload compression and optimization
3. **✅ Data transformation** - Specialized response simplification and formatting
4. **✅ Multi-layer caching** - Schema, record, and validation caching
5. **✅ Comprehensive error handling** - Sophisticated error categorization and recovery
6. **✅ Input validation** - Complete field validation with type checking
7. **✅ Structured logging** - Professional logging with performance metrics
8. **✅ Intelligent batching** - Automatic batching for up to 100 records

### **🏗️ Architecture Strengths**

-   ✅ **Dedicated API client layer** - AirtableAPI with rate limiting and retry logic
-   ✅ **Response optimization services** - ResponseOptimizer and ResponseSimplifier
-   ✅ **Data sanitization utilities** - XSS and SQL injection protection
-   ✅ **Authentication utilities** - Token validation and management
-   ✅ **Comprehensive validation system** - Field-level and schema validation
-   ✅ **Performance monitoring** - Real-time statistics and health checks

### **🔮 Future Enhancements**

-   **Webhooks support** - Real-time notifications and event handling
-   **File attachments** - Upload and manage file attachments
-   **Schema management** - Create/update tables, fields, and views
-   **Advanced analytics** - Usage analytics and insights
-   **Bulk operations** - Mass import/export capabilities

**Current Status**: The Airtable implementation now matches and exceeds the Figma implementation's architecture quality with enterprise-grade features, performance optimization, and comprehensive error handling.
