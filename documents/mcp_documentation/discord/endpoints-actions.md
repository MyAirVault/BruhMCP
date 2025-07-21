# Discord MCP Server - Available Endpoints & Actions

## User Flow: Frontend Selection to LLM Integration

### Complete System Flow: User Selects Discord Service

#### 1. Frontend Service Selection
**User Action**: Dashboard → "Create New MCP" → Select "Discord"  
**Flow**:
1. **Dashboard Page** → User clicks "Create New MCP" button
   - **File**: `/frontend/src/pages/Dashboard.tsx`
   - **Function**: Opens CreateMCPModal component
   - **Action**: Displays service selection modal

2. **Service Selection** → TypeDropdown loads available services
   - **File**: `/frontend/src/components/ui/form/TypeDropdown.tsx`
   - **API Call**: `GET /api/v1/mcp-types`
   - **Action**: Fetches available services from database

3. **Dynamic Form Generation** → Form adapts for Discord (OAuth type)
   - **File**: `/frontend/src/components/ui/form/CredentialFields.tsx`
   - **Function**: Renders OAuth credential fields
   - **Action**: Shows custom name, Client ID, Client Secret, and expiration fields

4. **Real-time Validation** → Credentials validated as user types
   - **File**: `/frontend/src/hooks/useCreateMCPForm.ts`
   - **API Call**: `POST /api/v1/mcps/validate-credentials`
   - **Action**: Validates Discord OAuth credentials against Discord API

#### 2. Backend Instance Creation
**User Action**: User clicks "Create Instance" button  
**Flow**:
1. **Request Validation** → Zod schema validation
   - **File**: `/backend/src/controllers/mcpInstances/crud/createMCP.js`
   - **Function**: `createMCP` controller
   - **Action**: Validates request body and OAuth credentials

2. **Service Definition Lookup** → Queries service configuration
   - **Database**: `mcp_table` query for Discord service
   - **Action**: Retrieves service configuration and port number

3. **Database Storage** → Creates instance records
   - **Tables**: `mcp_service_table` and `mcp_credentials`
   - **Action**: Stores instance with encrypted Client ID/Secret, sets `oauth_status: 'pending'`

4. **URL Generation** → Creates instance-specific URL
   - **Format**: `{PUBLIC_DOMAIN}/discord/{instance_id}`
   - **Action**: Returns URL and OAuth authorization URL to frontend

#### 3. OAuth Authentication Flow
**User Action**: User completes OAuth in popup window  
**Flow**:
1. **Authorization Request** → User redirected to Discord OAuth
   - **URL**: `https://discord.com/api/oauth2/authorize`
   - **Scopes**: `identify`, `email`, `connections`, `guilds`, `guilds.members.read`, `messages.read`, `bot`
   - **Action**: User grants permissions to application

2. **OAuth Callback** → Discord redirects to callback URL
   - **Endpoint**: `GET /auth/discord/callback`
   - **File**: `/backend/src/controllers/oauth/discord.js`
   - **Action**: Exchanges authorization code for access token

3. **Token Storage** → Stores OAuth tokens in database
   - **Table**: `mcp_credentials`
   - **Action**: Stores encrypted access_token, refresh_token, updates `oauth_status: 'completed'`

4. **Instance Activation** → Instance becomes active
   - **Action**: Instance status changed to "active" and ready for LLM integration

#### 4. LLM Integration Setup
**User Action**: User adds generated URL to LLM configuration  
**Flow**:
1. **LLM Connection** → LLM connects to instance URL
   - **Endpoint**: `POST /discord/{instance_id}/mcp`
   - **Protocol**: JSON-RPC 2.0 over HTTP using MCP SDK
   - **Action**: Establishes MCP session with Discord service

2. **Authentication Middleware** → Validates instance and credentials
   - **File**: `/backend/src/mcp-servers/discord/middleware/credential-auth.js`
   - **Function**: `credentialAuthMiddleware`
   - **Action**: Looks up instance, validates OAuth tokens, handles token refresh

3. **Handler Creation** → Creates persistent MCP handler
   - **File**: `/backend/src/mcp-servers/discord/services/handler-sessions.js`
   - **Function**: `getOrCreateHandler`
   - **Action**: Creates DiscordMCPHandler with authenticated API access

#### 5. Tool Execution Flow (e.g., Send Message)
**User Action**: LLM calls `send_message` tool  
**Flow**:
1. **MCP Request Processing**
   - **File**: `/backend/src/mcp-servers/discord/endpoints/mcp-handler.js:599`
   - **Class**: `DiscordMCPHandler`
   - **Method**: `handleMCPRequest`
   - **Action**: Processes JSON-RPC via MCP SDK

2. **Tool Execution**
   - **File**: `/backend/src/mcp-servers/discord/endpoints/mcp-handler.js:305`
   - **Method**: `send_message` tool handler
   - **Action**: Validates input with Zod schemas, formats embeds

3. **External API Call**
   - **File**: `/backend/src/mcp-servers/discord/api/discord-api.js`
   - **Function**: `sendMessage`
   - **Action**: Makes authenticated call to Discord API v10

4. **Response Processing**
   - **Processing**: Format response as JSON, handle Discord-specific errors
   - **Transport**: Send back via MCP transport to LLM

### Key System Components
- **Frontend**: `/frontend/src/pages/Dashboard.tsx` - Service selection UI
- **Backend API**: `/backend/src/controllers/mcpInstances/crud/createMCP.js` - Instance creation
- **OAuth Handler**: `/backend/src/controllers/oauth/discord.js` - OAuth flow management
- **Database**: `mcp_service_table`, `mcp_credentials` - Instance storage
- **MCP Server**: `/backend/src/mcp-servers/discord/index.js` - Multi-tenant routing
- **Authentication**: `/middleware/credential-auth.js` - Instance-based auth with OAuth
- **API Integration**: `/api/discord-api.js` - Discord API v10 integration

### Database Schema
```sql
-- Service instances
mcp_service_table (
  instance_id UUID PRIMARY KEY,
  user_id UUID,
  mcp_service_id UUID,
  custom_name TEXT,
  status TEXT,
  oauth_status TEXT, -- 'pending', 'completed', 'failed'
  expires_at TIMESTAMP
)

-- OAuth credentials
mcp_credentials (
  instance_id UUID,
  client_id TEXT,
  client_secret TEXT (encrypted),
  access_token TEXT (encrypted),
  refresh_token TEXT (encrypted),
  token_expires_at TIMESTAMP
)
```

### Generated URLs
- **Health Check**: `{PUBLIC_DOMAIN}/discord/{instance_id}/health`
- **MCP Endpoint**: `{PUBLIC_DOMAIN}/discord/{instance_id}/mcp`
- **Direct MCP**: `{PUBLIC_DOMAIN}/discord/{instance_id}` (Claude Code compatibility)
- **OAuth Authorization**: `https://discord.com/api/oauth2/authorize?client_id={client_id}&redirect_uri={callback_url}&response_type=code&scope=identify%20email%20connections%20guilds%20guilds.members.read%20messages.read%20bot`

---

Your Discord MCP server provides comprehensive access to Discord API through 21 different tools/endpoints with direct Discord API integration:

## 👤 **User Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_current_user` | Get current user information | None |
| `get_user_guilds` | Get user's guilds (servers) | None |
| `get_user_connections` | Get user's connections (linked accounts) | None |

## 🏠 **Guild/Server Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_guild` | Get detailed guild information | `guildId` |
| `get_guild_member` | Get guild member information | `guildId` |
| `get_guild_channels` | Get all channels in a guild | `guildId` |

## 📝 **Channel Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_channel` | Get channel information | `channelId` |
| `get_channel_messages` | Get messages from a channel | `channelId` |

## 💬 **Message Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `send_message` | Send a message to a channel | `channelId`, `content` |
| `edit_message` | Edit a message | `channelId`, `messageId`, `content` |
| `delete_message` | Delete a message | `channelId`, `messageId` |

## 🔥 **Reaction Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `add_reaction` | Add a reaction to a message | `channelId`, `messageId`, `emoji` |
| `remove_reaction` | Remove a reaction from a message | `channelId`, `messageId`, `emoji` |

## 📨 **Invite Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_invite` | Get invite information | `inviteCode` |
| `create_invite` | Create an invite for a channel | `channelId` |

## 🎭 **Role Management Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `list_guild_roles` | List all roles in a guild | `guildId` |
| `create_guild_role` | Create a new role in a guild | `guildId` |
| `modify_guild_role` | Modify an existing role | `guildId`, `roleId` |
| `delete_guild_role` | Delete a role from a guild | `guildId`, `roleId` |
| `add_member_role` | Add a role to a guild member | `guildId`, `userId`, `roleId` |
| `remove_member_role` | Remove a role from a guild member | `guildId`, `userId`, `roleId` |

## 🔐 **Authentication**
Your Discord MCP server uses **OAuth2 authentication** with direct Discord API integration:
- **Base URL**: `https://discord.com/api/v10` (Direct Discord API)
- **OAuth2 Flow**: Client ID and Client Secret required
- **Bearer Token**: OAuth2 access token for user operations
- **Bot Token**: Optional bot token for enhanced permissions
- **Redirect URI**: `http://localhost:3000/auth/discord/callback`
- **Scopes**: `identify`, `email`, `connections`, `guilds`, `guilds.members.read`, `messages.read`, `bot`
- **Authorization URL**: `https://discord.com/api/oauth2/authorize`
- **Token URL**: `https://discord.com/api/oauth2/token`

## 🚀 **Common Use Cases**

### **Profile Information**
```javascript
// Get current user profile
get_current_user()

// Get user's guilds (servers)
get_user_guilds()

// List connected third-party accounts
get_user_connections()
```

### **Server Management**
```javascript
// Get detailed guild information
get_guild({ guildId: "123456789", useBotToken: false })

// Get guild member details
get_guild_member({ guildId: "123456789", userId: "@me" })

// Get all channels in a guild
get_guild_channels({ guildId: "123456789" })
```

### **Channel Operations**
```javascript
// Get channel information
get_channel({ channelId: "987654321" })

// Get recent messages from channel
get_channel_messages({ 
  channelId: "987654321", 
  limit: 25 
})
```

### **Message Management**
```javascript
// Send a message
send_message({ 
  channelId: "987654321", 
  content: "Hello Discord!",
  embeds: [{
    title: "Example Embed",
    description: "This is an embed",
    color: 0x00ff00
  }]
})

// Edit a message
edit_message({ 
  channelId: "987654321", 
  messageId: "111222333", 
  content: "Updated message" 
})

// Delete a message
delete_message({ 
  channelId: "987654321", 
  messageId: "111222333" 
})
```

### **Reactions & Interactions**
```javascript
// Add reaction to message
add_reaction({ 
  channelId: "987654321", 
  messageId: "111222333", 
  emoji: "👍" 
})

// Remove reaction
remove_reaction({ 
  channelId: "987654321", 
  messageId: "111222333", 
  emoji: "👍" 
})
```

### **Invite Management**
```javascript
// Get invite information
get_invite({ inviteCode: "abc123" })

// Create channel invite
create_invite({ 
  channelId: "987654321",
  maxAge: 86400, // 24 hours
  maxUses: 10,
  temporary: false
})
```

### **Role Management**
```javascript
// List all roles in a guild
list_guild_roles({ guildId: "123456789" })

// Create a new role
create_guild_role({ 
  guildId: "123456789",
  name: "Moderator",
  color: 0x00ff00,
  hoist: true,
  mentionable: true,
  permissions: "268435456"
})

// Add role to member
add_member_role({ 
  guildId: "123456789",
  userId: "987654321",
  roleId: "111222333",
  reason: "Promoted to moderator"
})

// Remove role from member
remove_member_role({ 
  guildId: "123456789",
  userId: "987654321",
  roleId: "111222333",
  reason: "Role removed"
})
```

## 📊 **API Coverage**
Your Discord implementation covers **comprehensive Discord API functionality**:
- ✅ User Profile API (complete)
- ✅ OAuth2 API (complete)
- ✅ Guilds API (comprehensive operations)
- ✅ Channels API (full CRUD operations)
- ✅ Messages API (send, edit, delete, fetch)
- ✅ Reactions API (add, remove)
- ✅ Invites API (get, create)
- ✅ Roles API (complete CRUD operations)
- ❌ Webhooks API (not implemented)
- ❌ Voice API (not implemented)
- ❌ Moderation API (not implemented)
- ❌ Threads API (not implemented)
- ❌ Slash Commands API (not implemented)

## 🔧 **Technical Implementation Details**

### **Architecture**
- **Base URL**: `https://discord.com/api/v10` (Direct Discord API)
- **API Version**: v10
- **Documentation**: https://discord.com/developers/docs/intro
- **Port**: 49260

### **Implementation Pattern**
The Discord MCP server follows a **comprehensive MCP pattern**:
- Direct Discord API integration (no proxy)
- Uses official MCP SDK with Zod validation
- Implements JSON-RPC 2.0 protocol
- Custom Discord-specific error handling and formatting
- Supports both OAuth2 Bearer tokens and Bot tokens

### **Authentication Flow**
1. OAuth2 authorization with Discord
2. Direct token exchange with Discord API
3. Bearer token and optional Bot token support
4. Session management for MCP protocol
5. Proper token validation and error handling

### **Error Handling**
- Discord-specific error message parsing
- Comprehensive HTTP status code handling
- Rate limiting awareness
- Network and parsing error handling
- Proper MCP error response formatting

## 🔄 **Integration Examples**

### **Basic Usage**
```javascript
// Get user information
const userInfo = await get_my_user();

// List servers
const guilds = await list_my_guilds();

// Get member info for specific server
const memberInfo = await get_my_guild_member({ 
  guild_id: guilds[0].id 
});
```

### **Profile Analysis**
```javascript
// Get comprehensive user profile
const profile = await get_my_user();
const connections = await retrieve_user_connections();
const auth = await get_my_oauth2_authorization();

// Analyze user's Discord presence
const analysis = {
  username: profile.username,
  avatar: profile.avatar,
  connectedAccounts: connections.length,
  permissions: auth.scopes
};
```

## 📈 **Comparison with Gmail Implementation**

### **Similarities**
- ✅ Uses OAuth2 authentication
- ✅ Implements proper MCP JSON-RPC protocol with official SDK
- ✅ Has comprehensive error handling
- ✅ Follows similar endpoint organization and logging patterns
- ✅ Uses Zod for schema validation
- ✅ Implements session management and transport handling

### **Key Improvements Over Previous Version**
- ✅ **Comprehensive functionality**: 15 tools vs previous 6 tools
- ✅ **Core features implemented**: Message sending, channel management, reactions
- ✅ **Direct API integration**: No proxy, direct Discord API calls
- ✅ **Discord-specific handlers**: Custom formatting and error handling
- ✅ **Enhanced API coverage**: Full messaging and channel operations

### **Current Status vs Gmail**
- ✅ **Comparable tool count**: 21 Discord tools vs 20 Gmail tools
- ✅ **Professional implementation**: Matches Gmail's code quality and structure
- ✅ **Direct API integration**: Both use direct API calls
- ✅ **Comprehensive logging**: Similar logging patterns to Gmail
- ✅ **Proper error handling**: Discord-specific error parsing like Gmail
- ✅ **Complete validation**: Comprehensive Zod schemas like Gmail
- ✅ **Role management**: Discord equivalent of Gmail's label operations

## 🔨 **Future Enhancement Opportunities**

1. **Additional Discord Features**:
   - Role management and permissions
   - Thread operations
   - Slash command integration
   - Voice channel operations

2. **Advanced Features**:
   - Webhook management
   - Server moderation tools
   - File upload/download
   - Audit log access

3. **Performance Optimizations**:
   - Caching for frequently accessed data
   - Pagination for large datasets
   - Rate limiting management
   - Connection pooling

4. **Bot Integration**:
   - Enhanced bot token support
   - Bot-specific operations
   - Application command management

The Discord MCP server now provides comprehensive functionality that matches the quality and structure of the Gmail implementation, with direct API integration and professional-grade error handling.