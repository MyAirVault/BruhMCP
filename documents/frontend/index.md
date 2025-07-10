# Frontend Documentation

This directory contains documentation for the frontend components and pages of the MiniMCP application.

## Documents

### Authentication Components
- **[login-page.md](./login-page.md)** - Main login page with email input and magic link request
- **[verify-page.md](./verify-page.md)** - Magic link verification page handling and user feedback
- **[magic-link-popup.md](./magic-link-popup.md)** - Popup component with polling-based authentication detection
- **[dashboard-page.md](./dashboard-page.md)** - Protected dashboard page with logout functionality
- **[logs-page.md](./logs-page.md)** - Logs viewing page with filtering and export capabilities

### Enhanced User Experience
- **[frontend-enhancements.md](./frontend-enhancements.md)** - Latest UI/UX improvements including keyboard navigation, tooltips, and smart positioning
- **[api-integration.md](./api-integration.md)** - Complete backend API integration guide with implementation details

## Frontend Structure

The frontend is built with:

-   **Framework**: React + TypeScript + Vite
-   **Styling**: Tailwind CSS
-   **API Integration**: Custom API service with backend endpoints
-   **Location**: `/frontend/` directory

## API Integration

### API Service (`/frontend/src/services/apiService.ts`)

The frontend integrates with the backend through a centralized API service that provides:

#### MCP Management
- `getMCPTypes()` - List available MCP types
- `getMCPTypeByName(name)` - Get specific MCP type details
- `createMCP(data)` - Create new MCP instance
- `getMCPInstances(params?)` - List user's MCP instances with filtering
- `getMCPInstance(id)` - Get specific MCP instance details
- `renewMCP(id, data)` - Renew expired MCP instance
- `toggleMCP(id, data)` - Toggle MCP active/inactive status
- `editMCP(id, data)` - Update MCP instance details
- `deleteMCP(id)` - Delete MCP instance

#### API Key Management
- `getAPIKeys()` - List user's stored API keys
- `storeAPIKey(data)` - Store new API credentials
- `validateCredentials(data)` - Validate credentials before storing
- `deleteAPIKey(id)` - Delete stored API key

#### Logs and Monitoring
- `getMCPLogs(mcpId, params?)` - Get logs for specific MCP with filtering
- `exportMCPLogs(mcpId, data)` - Export logs in various formats

#### User Settings
- `getSettings()` - Get user profile and preferences
- `updateSettings(data)` - Update user preferences

### Type Definitions (`/frontend/src/types/index.ts`)

Enhanced type system including:

- `MCPType` - MCP type configuration with required fields and resource limits
- `MCPInstance` - Complete MCP instance with status, metrics, and configuration
- `APIKey` - Stored API credentials with MCP type association
- `MCPLog` - Log entries with metadata and structured information

All API calls include:
- Cookie-based authentication (automatic)
- Comprehensive error handling
- TypeScript type safety
- Consistent response formatting

## Pages

### Authentication Pages

-   **Login Page** (`/frontend/src/pages/LoginPage.tsx`)
    -   Email input form for magic link authentication
    -   Authentication check on page load with auto-redirect
    -   Connects to `/api/auth/request` endpoint
    -   Shows MagicLinkPopup component after successful submission
    -   Route: `/login` and `/` (default)

-   **Magic Link Verification** (`/frontend/src/pages/VerifyPage.tsx`)
    -   Verifies authentication tokens from email links
    -   Connects to `/api/auth/verify` endpoint
    -   Works with MagicLinkPopup polling for seamless UX
    -   Route: `/verify?token={uuid}`

-   **Dashboard** (`/frontend/src/pages/Dashboard.tsx`)
    -   Protected route displaying user's MCP instances organized by status
    -   Real-time data from backend via `apiService.getMCPInstances()`
    -   Full CRUD operations: create, edit, toggle, renew, delete MCPs
    -   Keyboard navigation and shortcuts (Ctrl+K for create modal)
    -   Authentication check with redirect to login
    -   User profile dropdown with navigation to profile page
    -   Route: `/dashboard`

-   **Profile** (`/frontend/src/pages/Profile.tsx`)
    -   User profile management page with backend integration
    -   Loads profile data via `apiService.getSettings()`
    -   Shows first name, last name (editable), email (read-only), member since
    -   Displays MCP statistics (total created, active count)
    -   Email notification toggle with real-time API updates
    -   Save confirmation popup for profile changes
    -   Back button to return to dashboard
    -   Route: `/profile`

-   **Logs** (`/frontend/src/pages/Logs.tsx`)
    -   Comprehensive log viewing with backend integration
    -   Uses `apiService.getMCPLogs()` for specific MCP logs
    -   Advanced filtering by level, source, time range, and search
    -   Export functionality via `apiService.exportMCPLogs()`
    -   Supports both individual MCP logs and system-wide logs
    -   Real-time refresh capability
    -   Route: `/logs` or `/logs?mcp={id}&name={name}` for specific MCP

### Components

-   **MagicLinkPopup** (`/frontend/src/components/MagicLinkPopup.tsx`)
    -   Modal popup showing magic link sent confirmation
    -   Polling mechanism that checks authentication every 2 seconds
    -   Displays user's email and instructions
    -   Automatic redirect to dashboard on successful verification
    -   Development note about console link visibility

## Enhanced Authentication Flow

### Complete User Journey
1. User visits `/login` or `/` (redirects to LoginPage)
2. **Auto-Redirect Check**: If already authenticated, redirects to dashboard
3. User enters email and submits form
4. Frontend calls `/api/auth/request` with email
5. MagicLinkPopup appears with confirmation and starts polling
6. User clicks magic link from console (opens `/verify?token={uuid}`)
7. VerifyPage validates token via `/api/auth/verify` and sets JWT cookie
8. **Polling Detection**: MagicLinkPopup detects authentication via polling
9. Popup shows "Verification Successful!" message
10. User is automatically redirected to `/dashboard`
11. Dashboard shows personalized greeting with email address
12. **Persistent Session**: Refresh or revisit redirects to dashboard automatically

### Logout Flow
1. User clicks logout button on dashboard
2. Frontend calls `/api/auth/logout` to clear server session
3. Client-side cookies are cleared
4. User is redirected to login page
5. Authentication state is reset

## Development

Frontend runs on port 5173 by default with Vite dev server:

```bash
cd frontend
npm run dev
```

### API Proxy Configuration

The frontend uses Vite's proxy configuration to route API calls to the backend:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

This allows frontend to call `/api/auth/request` which proxies to `http://localhost:5000/auth/request`.

## Key Dependencies

- **React Router DOM**: Client-side routing for authentication flow
- **Tailwind CSS**: Utility-first styling framework  
- **TypeScript**: Type safety for components and API calls
- **Vite**: Fast development server and build tool with proxy support
