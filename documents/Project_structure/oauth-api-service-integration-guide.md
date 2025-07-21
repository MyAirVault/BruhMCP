# OAuth and API Key Service Integration Guide

## Overview

This comprehensive guide documents the current authentication architecture and provides detailed instructions for adding new OAuth and API key-based services to the bruhMCP platform. The analysis covers both Google Drive (OAuth) and Splitwise (API key) integration scenarios.

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [OAuth Implementation](#oauth-implementation)
3. [API Key Implementation](#api-key-implementation)
4. [Google Drive Integration Requirements](#google-drive-integration-requirements)
5. [Splitwise Integration Requirements](#splitwise-integration-requirements)
6. [Implementation Guidelines](#implementation-guidelines)
7. [Security Considerations](#security-considerations)

---

## Current Architecture Analysis

### Authentication Framework

The bruhMCP platform implements a dual authentication system:

1. **User Authentication**: Magic link-based authentication with JWT cookies
2. **Service Authentication**: OAuth 2.0 and API key-based authentication for third-party services

### Service Types Supported

-   **OAuth Services**: Google (Gmail, Drive, Calendar, etc.), Microsoft (Outlook, OneDrive, Teams)
-   **API Key Services**: Figma, GitHub, and other services with token-based authentication

---

## OAuth Implementation

### Backend OAuth Architecture

#### Centralized OAuth Service (`/src/oauth-service/`)

The OAuth service runs as a dedicated microservice handling all OAuth operations:

```javascript
// Core Components
-index.js - // Express app for OAuth operations
	core / oauth -
	manager.js - // OAuth flow orchestration
	core / token -
	exchange.js - // Token refresh operations
	providers / base -
	oauth.js - // Abstract OAuth provider base class
	providers / google.js - // Google OAuth implementation
	providers / microsoft.js - // Microsoft OAuth implementation
	utils / validation.js; // Credential validation utilities
```

#### OAuth Flow Process

1. **Service Creation**: User creates OAuth-based MCP instance
2. **Credential Validation**: Format validation (e.g., Google client ID ends with `.apps.googleusercontent.com`)
3. **Authorization URL Generation**: Provider-specific authorization URL created
4. **User Consent**: User redirected to provider's consent screen
5. **Callback Processing**: OAuth service handles provider callback
6. **Token Exchange**: Authorization code exchanged for access/refresh tokens
7. **Token Caching**: Tokens cached in service instance
8. **Token Refresh**: Automatic token refresh using refresh tokens

#### OAuth Service Endpoints

```javascript
// Core OAuth Endpoints
POST   /validate-credentials     // Validate OAuth credential format
POST   /start-oauth             // Generate authorization URL
GET    /callback/:provider      // Handle OAuth callbacks
POST   /exchange-refresh-token  // Refresh access tokens
GET    /health                  // Service health check
GET    /providers               // List supported providers
```

#### Database Schema for OAuth

```sql
-- Service Registry
CREATE TABLE mcp_table (
    mcp_service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mcp_service_name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('api_key', 'oauth')),
    -- other fields...
);

-- User Instances with OAuth Credentials
CREATE TABLE mcp_service_table (
    instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mcp_service_id UUID NOT NULL,
    client_id VARCHAR(500),
    client_secret VARCHAR(500),
    -- OAuth services require both client_id and client_secret
    CONSTRAINT check_credentials_not_all_null CHECK (
        api_key IS NOT NULL OR (client_id IS NOT NULL AND client_secret IS NOT NULL)
    )
);
```

### Frontend OAuth Implementation

#### OAuth Detection and UI

The frontend automatically detects OAuth services and provides appropriate UI:

```typescript
// OAuth Service Detection
const isOAuthService = (mcpType: MCPType): boolean => {
	return mcpType?.type === 'oauth';
};

// OAuth Form Handling
const handleOAuthSubmit = async (formData: FormData) => {
	const response = await apiService.createMCPInstance(formData);
	if (response.oauth?.authorization_url) {
		window.location.href = response.oauth.authorization_url;
	}
};
```

#### OAuth Callback Handling

The Dashboard component handles OAuth completion:

```typescript
// OAuth Callback Detection
useEffect(() => {
	const urlParams = new URLSearchParams(window.location.search);

	if (urlParams.get('oauth_success')) {
		refreshMCPList();
		cleanupURLParams();
	}

	if (urlParams.get('oauth_error')) {
		handleOAuthError(urlParams.get('oauth_error'));
		cleanupURLParams();
	}
}, []);
```

### OAuth Provider Configuration

#### Google OAuth Configuration

```json
{
	"name": "googledrive",
	"auth": {
		"type": "oauth2",
		"fields": [
			{ "name": "client_id", "type": "text", "required": true },
			{ "name": "client_secret", "type": "password", "required": true }
		],
		"oauth": {
			"scopes": ["https://www.googleapis.com/auth/drive"],
			"authorization_url": "https://accounts.google.com/o/oauth2/auth",
			"token_url": "https://oauth2.googleapis.com/token"
		}
	}
}
```

#### Current OAuth Services

-   **Google Services**: Gmail, Google Drive, Google Calendar, Google Sheets, Google Docs
-   **Microsoft Services**: Outlook, OneDrive, Microsoft Teams

---

## API Key Implementation

### Backend API Key Architecture

#### Database Schema for API Keys

```sql
-- API Key Storage
CREATE TABLE mcp_service_table (
    instance_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    mcp_service_id UUID REFERENCES mcp_table(mcp_service_id),
    api_key VARCHAR(500),
    -- API key services use api_key field
    CONSTRAINT check_credentials_not_all_null CHECK (
        api_key IS NOT NULL OR (client_id IS NOT NULL AND client_secret IS NOT NULL)
    )
);
```

#### API Key Service Controllers

```javascript
// API Key Controllers (/src/controllers/apiKeys/)
-storeAPIKey.js - // Store API key with validation
	getAPIKeys.js - // Retrieve user's API keys
	validateCredentials.js - // Validate API keys against external services
	deleteAPIKey.js - // Delete API key
	schemas.js; // Zod validation schemas
```

#### API Key Validation Service

```javascript
// Credential Validation Service
const validateCredentials = async (serviceName, credentials) => {
	switch (serviceName) {
		case 'figma':
			return await validateFigmaCredentials(credentials);
		case 'github':
			return await validateGitHubCredentials(credentials);
		case 'splitwise':
			return await validateSplitwiseCredentials(credentials); // To be implemented
		default:
			throw new Error(`Unsupported service: ${serviceName}`);
	}
};
```

### Frontend API Key Implementation

#### Dynamic Field Rendering

```typescript
// API Key Form Component
const CredentialFields = ({ mcpType, formData, setFormData }) => {
	const renderField = (field: AuthField) => {
		if (field.name === 'api_key') {
			return (
				<input
					type="password"
					placeholder="Enter your API key"
					value={formData.api_key || ''}
					onChange={e => setFormData({ ...formData, api_key: e.target.value })}
				/>
			);
		}
	};
};
```

#### API Key Validation Flow

```typescript
// Real-time Validation
const validateAPIKey = async (serviceName: string, apiKey: string) => {
	const response = await fetch('/api/v1/api-keys/validate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ service: serviceName, credentials: { api_key: apiKey } }),
	});

	return response.json();
};
```

### API Key Service Configuration

#### Service Configuration Pattern

```json
{
	"name": "splitwise",
	"displayName": "Splitwise",
	"auth": {
		"type": "api_key",
		"fields": [
			{
				"name": "api_key",
				"type": "password",
				"required": true,
				"description": "Splitwise API Key"
			}
		]
	},
	"port": 49464,
	"api": {
		"baseURL": "https://secure.splitwise.com/api/v3.0",
		"documentation": "https://dev.splitwise.com/"
	}
}
```

#### Current API Key Services

-   **Figma**: Personal Access Token validation
-   **GitHub**: Personal Access Token validation
-   **Splitwise**: API key validation (to be implemented)

---

## Google Drive Integration Requirements

### Implementation Status

**Infrastructure Ready**: ✅ Complete

-   OAuth service supports Google provider
-   Database schema supports OAuth services
-   Frontend OAuth flow implemented
-   Service configuration exists

### Required Changes

#### 1. Database Update

```sql
-- Google Drive service already exists in mcp_table
-- No database changes needed
```

#### 2. OAuth Service Configuration

```javascript
// /src/controllers/mcpInstances/crud/oauth-helpers.js
const SERVICE_SCOPE_MAPPING = {
	gmail: ['https://www.googleapis.com/auth/gmail.modify'],
	googledrive: ['https://www.googleapis.com/auth/drive'], // Add this line
	googlecalendar: ['https://www.googleapis.com/auth/calendar'],
	// ...
};
```

#### 3. MCP Server Implementation

```javascript
// /src/mcp-servers/googledrive/index.js
const express = require('express');
const { google } = require('googleapis');
const oauth = require('../shared/oauth-integration');

class GoogleDriveMCPServer {
	constructor(instanceId) {
		this.instanceId = instanceId;
		this.drive = null;
	}

	async initialize() {
		const tokens = await oauth.getTokens(this.instanceId);
		const auth = new google.auth.OAuth2();
		auth.setCredentials(tokens);

		this.drive = google.drive({ version: 'v3', auth });
	}

	async listFiles() {
		const response = await this.drive.files.list({
			pageSize: 10,
			fields: 'nextPageToken, files(id, name)',
		});
		return response.data.files;
	}

	async createFile(name, content) {
		const response = await this.drive.files.create({
			resource: { name },
			media: { mimeType: 'text/plain', body: content },
		});
		return response.data;
	}

	// Additional Google Drive operations...
}
```

#### 4. Service Registration

```javascript
// Service already registered in mcp_table
// Configuration exists in /mcp-ports/googledrive/config.json
```

### Implementation Effort: **LOW**

-   OAuth infrastructure complete
-   Main work: MCP server implementation
-   Estimated time: 2-3 days

---

## Splitwise Integration Requirements

### Implementation Status

**Infrastructure Ready**: ✅ Complete

-   API key service architecture implemented
-   Database schema supports API key services
-   Frontend API key flow implemented
-   Service configuration exists

### Required Changes

#### 1. Database Update

```sql
-- Add Splitwise service to mcp_table
INSERT INTO mcp_table (mcp_service_name, display_name, type, port, is_active)
VALUES ('splitwise', 'Splitwise', 'api_key', 49464, true);
```

#### 2. Credential Validation Service

```javascript
// /src/services/credentialValidationService.js
const validateSplitwiseCredentials = async credentials => {
	try {
		const response = await fetch('https://secure.splitwise.com/api/v3.0/get_current_user', {
			headers: {
				Authorization: `Bearer ${credentials.api_key}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error('Invalid Splitwise API key');
		}

		const userData = await response.json();
		return {
			valid: true,
			user: userData.user,
		};
	} catch (error) {
		return {
			valid: false,
			error: error.message,
		};
	}
};

// Add to main validation function
const validateCredentials = async (serviceName, credentials) => {
	switch (serviceName) {
		case 'splitwise':
			return await validateSplitwiseCredentials(credentials);
		// ... other cases
	}
};
```

#### 3. MCP Server Implementation

```javascript
// /src/mcp-servers/splitwise/index.js
const express = require('express');
const axios = require('axios');

class SplitwiseMCPServer {
	constructor(instanceId) {
		this.instanceId = instanceId;
		this.apiKey = null;
		this.baseURL = 'https://secure.splitwise.com/api/v3.0';
	}

	async initialize() {
		// Get API key from database
		this.apiKey = await this.getStoredAPIKey();
	}

	async getExpenses() {
		const response = await axios.get(`${this.baseURL}/get_expenses`, {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});
		return response.data.expenses;
	}

	async createExpense(description, cost, users) {
		const response = await axios.post(
			`${this.baseURL}/create_expense`,
			{
				description,
				cost,
				users,
			},
			{
				headers: { Authorization: `Bearer ${this.apiKey}` },
			}
		);
		return response.data;
	}

	async getGroups() {
		const response = await axios.get(`${this.baseURL}/get_groups`, {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});
		return response.data.groups;
	}

	// Additional Splitwise operations...
}
```

#### 4. MCP Tools Definition

```javascript
// Splitwise MCP Tools
const SPLITWISE_TOOLS = [
	{
		name: 'get_expenses',
		description: 'Get user expenses from Splitwise',
		inputSchema: {
			type: 'object',
			properties: {
				limit: { type: 'number', description: 'Number of expenses to return' },
				offset: { type: 'number', description: 'Offset for pagination' },
			},
		},
	},
	{
		name: 'create_expense',
		description: 'Create a new expense in Splitwise',
		inputSchema: {
			type: 'object',
			properties: {
				description: { type: 'string', description: 'Expense description' },
				cost: { type: 'number', description: 'Total cost of expense' },
				users: { type: 'array', description: 'Users involved in the expense' },
			},
			required: ['description', 'cost', 'users'],
		},
	},
	{
		name: 'get_groups',
		description: 'Get user groups from Splitwise',
		inputSchema: {
			type: 'object',
			properties: {},
		},
	},
];
```

### Implementation Effort: **MEDIUM**

-   API key infrastructure complete
-   Main work: MCP server implementation and API integration
-   Additional: Splitwise-specific validation logic
-   Estimated time: 3-5 days

---

## Implementation Guidelines

### Step-by-Step Implementation Process

#### For OAuth Services (Google Drive)

1. **Review Service Configuration**

    ```bash
    # Check existing configuration
    cat /mcp-ports/googledrive/config.json
    ```

2. **Add Scope Mapping**

    ```javascript
    // Update oauth-helpers.js
    googledrive: ['https://www.googleapis.com/auth/drive'];
    ```

3. **Implement MCP Server**

    ```bash
    # Create service directory
    mkdir -p /src/mcp-servers/googledrive

    # Implement server following Gmail pattern
    cp /src/mcp-servers/gmail/index.js /src/mcp-servers/googledrive/index.js
    ```

4. **Define API Integration**

    ```javascript
    // Implement Google Drive API calls
    const { google } = require('googleapis');
    const drive = google.drive({ version: 'v3', auth });
    ```

5. **Test OAuth Flow**
    ```bash
    # Test OAuth flow
    curl -X POST http://localhost:3000/api/v1/mcps \
      -H "Content-Type: application/json" \
      -d '{"service": "googledrive", "client_id": "...", "client_secret": "..."}'
    ```

#### For API Key Services (Splitwise)

1. **Add Database Entry**

    ```sql
    INSERT INTO mcp_table (mcp_service_name, display_name, type, port, is_active)
    VALUES ('splitwise', 'Splitwise', 'api_key', 49464, true);
    ```

2. **Implement Validation Function**

    ```javascript
    // Add to credentialValidationService.js
    const validateSplitwiseCredentials = async credentials => {
    	// Validate against Splitwise API
    };
    ```

3. **Create MCP Server**

    ```bash
    # Create service directory
    mkdir -p /src/mcp-servers/splitwise

    # Implement server following Figma pattern
    cp /src/mcp-servers/figma/index.js /src/mcp-servers/splitwise/index.js
    ```

4. **Test API Key Flow**
    ```bash
    # Test API key validation
    curl -X POST http://localhost:3000/api/v1/api-keys/validate \
      -H "Content-Type: application/json" \
      -d '{"service": "splitwise", "credentials": {"api_key": "..."}}'
    ```

### Code Patterns to Follow

#### OAuth Service Pattern

```javascript
// Follow Gmail implementation pattern
class GoogleDriveMCPServer extends BaseMCPServer {
	async initialize() {
		const tokens = await this.getOAuthTokens();
		this.client = this.createAPIClient(tokens);
	}

	async refreshTokens() {
		// Use centralized OAuth service for token refresh
		return await oauthService.refreshTokens(this.instanceId);
	}
}
```

#### API Key Service Pattern

```javascript
// Follow Figma implementation pattern
class SplitwiseMCPServer extends BaseMCPServer {
	async initialize() {
		this.apiKey = await this.getStoredAPIKey();
		this.client = this.createAPIClient(this.apiKey);
	}

	async validateCredentials() {
		// Test API key against service endpoint
		return await this.client.getCurrentUser();
	}
}
```

### Testing Strategy

#### OAuth Service Testing

1. **Credential Validation**: Test OAuth credential format validation
2. **Authorization Flow**: Test complete OAuth authorization flow
3. **Token Refresh**: Test automatic token refresh
4. **API Integration**: Test API calls with OAuth tokens

#### API Key Service Testing

1. **Credential Validation**: Test API key validation against service
2. **API Integration**: Test API calls with stored API key
3. **Error Handling**: Test invalid API key scenarios
4. **Rate Limiting**: Test API rate limiting behavior

---

## Security Considerations

### OAuth Security

#### Token Management

-   **Secure Storage**: Tokens stored in database with encryption
-   **Token Refresh**: Automatic token refresh with 5-minute buffer
-   **Token Revocation**: Proper token cleanup on service deletion
-   **Scope Limitation**: Minimal required scopes for each service

#### OAuth Flow Security

-   **State Parameter**: Cryptographically secure state parameter
-   **HTTPS Enforcement**: All OAuth flows over HTTPS in production
-   **Callback Validation**: Strict callback URL validation
-   **CSRF Protection**: State parameter prevents CSRF attacks

### API Key Security

#### Storage Security

-   **Encryption**: API keys encrypted at rest in database
-   **Access Control**: Instance-based access control with UUID validation
-   **Audit Logging**: All API key operations logged
-   **Rotation**: Support for API key rotation

#### Usage Security

-   **Rate Limiting**: Per-instance rate limiting
-   **Error Handling**: Secure error messages without key exposure
-   **Monitoring**: API key usage monitoring and alerting
-   **Expiration**: Support for API key expiration

### General Security Measures

#### Authentication

-   **JWT Cookies**: Secure JWT-based session management
-   **Magic Link**: Secure email-based authentication
-   **Session Management**: Proper session invalidation
-   **CORS**: Strict CORS configuration

#### Data Protection

-   **Instance Isolation**: UUID-based instance isolation
-   **Multi-tenancy**: Secure multi-tenant architecture
-   **Data Encryption**: Sensitive data encryption at rest
-   **Secure Transport**: All communications over HTTPS

#### Monitoring and Auditing

-   **Access Logging**: Comprehensive access logging
-   **Security Events**: Security event monitoring
-   **Anomaly Detection**: Unusual usage pattern detection
-   **Incident Response**: Security incident response procedures

---

## Conclusion

The bruhMCP platform provides a robust, secure, and extensible architecture for both OAuth and API key-based service integration. The current implementation supports:

### Ready for Integration

-   **Google Drive**: OAuth infrastructure complete, requires MCP server implementation
-   **Splitwise**: API key infrastructure complete, requires validation logic and MCP server
-   **Future Services**: Architecture supports rapid integration of new services

### Key Strengths

-   **Security**: Comprehensive security measures for both OAuth and API key services
-   **Scalability**: Multi-tenant architecture with instance isolation
-   **Extensibility**: Modular design supports easy addition of new services
-   **Reliability**: Robust error handling and token management

### Implementation Effort

-   **OAuth Services**: Low effort (2-3 days) - infrastructure ready
-   **API Key Services**: Medium effort (3-5 days) - requires validation logic
-   **New Service Types**: Architecture supports future authentication methods

The platform is well-positioned for rapid expansion with minimal architectural changes required for new service integration.

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-15  
**Authors**: Claude Code Analysis Agent  
**Review Status**: Initial Draft
