# Adding a New MCP Service - Step-by-Step Guide

This guide walks you through adding a new service to the MCP system using your API documentation. No coding knowledge required - just follow these steps carefully.

## What You'll Need

Before starting, gather these items:

1. **API Documentation** for your service (website or PDF)
2. **Service Icon/Logo** URL (optional but recommended)
3. **API Credentials** for testing (API key, access token, etc.)
4. **Service Information** (name, description, category)

## Step-by-Step Process

### Step 1: Gather Service Information

From your API documentation, collect:

**Basic Information:**
- Service name (e.g., "Trello", "Slack", "Notion")
- Short description of what the service does
- Category (productivity, communication, development, design, etc.)
- Service icon/logo URL (if available)

**API Details:**
- Base API URL (e.g., `https://api.trello.com/1`)
- API version (e.g., "v1", "v2")
- Authentication method (API key, Bearer token, OAuth, etc.)
- Rate limits (requests per hour/minute)
- Documentation URL

**Authentication Information:**
- What type of credentials are needed?
- How are credentials formatted? (starts with specific prefix?)
- Which HTTP header is used for authentication?
- Is there a specific endpoint to test credentials?

### Step 2: Create Service Directory

Navigate to your project folder and create a new directory structure:

1. Open your file manager or terminal
2. Go to: `backend/src/mcp-servers/services/`
3. Create a new folder with your service name (lowercase, no spaces)
   - Example: `trello`, `slack`, `notion`
4. Inside that folder, create a `handlers` subfolder

**Result:** You should have:
```
backend/src/mcp-servers/services/
└── your-service-name/
    └── handlers/
```

### Step 3: Copy Template Files

1. Go to `backend/src/mcp-servers/templates/`
2. Copy `rest-api.js` to your service folder and rename it to `config.js`
3. Copy `routes.js` to your service folder (keep the same name)
4. Copy all files from `backend/src/mcp-servers/handlers/` to your service's `handlers/` folder

### Step 4: Customize Configuration

Open your service's `config.js` file and replace the placeholder values:

**Basic Information Section:**
- Replace `SERVICE_NAME` with your service name (lowercase)
- Replace `SERVICE_DISPLAY_NAME` with the proper service name
- Replace `SERVICE_DESCRIPTION` with a brief description
- Replace `SERVICE_CATEGORY` with appropriate category
- Replace `SERVICE_ICON_URL` with your icon URL

**API Configuration Section:**
- Replace `https://api.SERVICE_DOMAIN.com/API_VERSION` with actual API URL
- Replace `API_VERSION` with the API version
- Update rate limits based on your API documentation
- Replace documentation URL with actual API docs URL

**Authentication Section:**
- Set `AUTH_TYPE` to match your service:
  - `api_key` for API keys
  - `bearer_token` for Bearer tokens
  - `oauth` for OAuth tokens
  - `basic_auth` for username/password
- Replace `CREDENTIAL_FIELD_NAME` with the field name users will enter
- Replace `HEADER_NAME` with the HTTP header name
- Update the header format function
- Replace `TOKEN_REGEX` with pattern that matches your tokens
- Replace `VALIDATION_ENDPOINT` with endpoint to test credentials

**Endpoints Section:**
- Map your API endpoints to the standard names
- Update endpoint paths to match your API documentation

### Step 5: Map API Endpoints to MCP Tools and Resources

This is the most important step - mapping your API to MCP components. For detailed guidance, see **[API to MCP Mapping Guide](./api-to-mcp-mapping-guide.md)**.

#### Understanding Tools vs Resources:
- **Tools**: Actions users can perform (GET, POST, PUT, DELETE operations)
- **Resources**: Data users can browse (GET operations only)

#### Quick Reference for Common Patterns:

**Read Operations (GET endpoints):**
```
GET /users/me     → Tool: "get_user_info" + Resource: "user_profile"
GET /projects     → Tool: "list_projects" + Resource: "projects_list"
GET /tasks        → Tool: "list_tasks" + Resource: "tasks_list"
```

**Write Operations (POST/PUT/DELETE endpoints):**
```
POST /projects    → Tool: "create_project" (tools only)
PUT /projects/{id} → Tool: "update_project" (tools only)
DELETE /projects/{id} → Tool: "delete_project" (tools only)
```

#### For Each API Endpoint:

**1. Analyze the endpoint:**
- HTTP method (GET, POST, PUT, DELETE)
- URL path and parameters
- Request body structure (for POST/PUT)
- Response structure

**2. Map to MCP components:**
- GET endpoints → Tool + Resource
- POST/PUT/DELETE endpoints → Tool only

**3. Define parameters:**
- Required vs optional
- Data types (string, integer, boolean, array, object)
- Validation rules and defaults

**4. Create custom handlers:**
- For simple GET endpoints, use direct endpoint mapping
- For complex operations, create custom handler functions
- Handle pagination, filtering, and error cases

### Step 6: Set Up Credential Validation

In the `validation` section:
- Define what credentials are required
- Set up format validation (if your tokens have specific patterns)
- Configure API testing to verify credentials work

### Step 7: Add to Database

You need to register your service in the system database:

1. Open your database management tool
2. Find the `mcp_types` table
3. Add a new row with:
   - `name`: your service name (lowercase)
   - `display_name`: proper service name
   - `description`: brief description
   - `icon_url`: your icon URL (optional)

### Step 8: Test Your Service

**Test Service Loading:**
1. Start your development server
2. Check the console logs for your service name
3. Look for "✅ Loaded service: [Your Service Name]"

**Test Credential Validation:**
1. Go to your application frontend
2. Try creating a new MCP instance
3. Select your service from the dropdown
4. Enter test credentials
5. Verify the system accepts valid credentials
6. Verify the system rejects invalid credentials

**Test API Functionality:**
1. Create a complete MCP instance
2. Access the provided URL
3. Test the `/health` endpoint
4. Test user info endpoints
5. Test your custom endpoints

### Step 9: Document Your Service

Create a simple reference document:

1. List all available endpoints
2. Document required credentials
3. Note any special requirements or limitations
4. Include example usage if helpful

### Step 10: Final Verification

Complete these checks:

- [ ] Service appears in frontend dropdown
- [ ] Valid credentials are accepted
- [ ] Invalid credentials are rejected
- [ ] MCP instance creates successfully
- [ ] Health check endpoint works
- [ ] User info endpoint works
- [ ] Custom endpoints return expected data
- [ ] Service follows your API rate limits
- [ ] Error messages are clear and helpful

## Common Issues and Solutions

### Service Not Appearing in Dropdown
- Check console logs for loading errors
- Verify your config.js file has no syntax errors
- Ensure all required fields are filled in
- Check that your service directory is in the correct location

### Credential Validation Failing
- Verify your API credentials are correct
- Check that your token format regex is accurate
- Ensure your validation endpoint is correct
- Test your credentials directly with the API

### API Calls Not Working
- Check your base URL is correct
- Verify your authentication header format
- Test your API endpoints with a tool like Postman
- Check for any required HTTP headers you might be missing
- Review the **[API to MCP Mapping Guide](./api-to-mcp-mapping-guide.md)** for proper handler implementation

### Performance Issues
- Review your rate limiting configuration
- Check if your API requires pagination
- Consider caching frequently accessed data
- Monitor your API usage to avoid hitting limits

## Best Practices

### Security
- Never log or display actual credentials
- Use environment variables for sensitive data
- Implement proper error handling
- Validate all input parameters

### User Experience
- Provide clear error messages
- Use descriptive names for tools and resources
- Include helpful descriptions
- Test with real user workflows

### Maintenance
- Keep API documentation URLs updated
- Monitor API changes and deprecations
- Update rate limits as needed
- Test periodically with fresh credentials

## Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Review the **[API to MCP Mapping Guide](./api-to-mcp-mapping-guide.md)** for detailed implementation patterns
3. Review existing service implementations (Figma, GitHub, Notion)
4. Verify your API documentation is current
5. Test your credentials with the service's API directly
6. Check the main integration guide for technical details

## Example Walkthrough: Adding Trello

Let's walk through adding Trello as an example:

**Step 1: Gather Information**
- Service: Trello
- Description: Project management with boards and cards
- Category: productivity
- Base URL: https://api.trello.com/1
- Authentication: API key + token
- Icon: https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg

**Step 2: Create Directory**
Create: `backend/src/mcp-servers/services/trello/handlers/`

**Step 3: Copy Templates**
Copy template files to the new trello folder

**Step 4: Update Configuration**
- name: 'trello'
- displayName: 'Trello'
- description: 'Project management and collaboration tool'
- category: 'productivity'
- API URL: https://api.trello.com/1
- Auth: API key + token combination

**Step 5: Define Tools**
- get_user_info: Get current user
- list_boards: List user's boards
- list_cards: List user's cards

**Step 6: Set Up Validation**
Test credentials against /members/me endpoint

**Step 7: Add to Database**
Insert Trello record into mcp_types table

**Step 8: Test**
Create test instance, verify all endpoints work

This process creates a fully functional Trello MCP service that users can create instances of and interact with through the standard MCP protocol.

---

*This guide assumes you have API documentation available. If you need help interpreting API documentation or have questions about specific services, consult the technical team.*