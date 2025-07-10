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
- **[api-integration.md](./api-integration.md)** - Complete backend API integration guide with real-time credential validation and MCP creation flow

## Frontend Structure

The frontend is built with:

-   **Framework**: React + TypeScript + Vite
-   **Styling**: Tailwind CSS
-   **API Integration**: Custom API service with backend endpoints
-   **Location**: `/frontend/` directory

### New Component Organization (2025-07-10)

The frontend now follows CLAUDE.md rules with components organized in focused subdirectories:

#### Component Directories (`/frontend/src/components/`)

- **`dashboard/`** - Dashboard-specific components
  - `DashboardContent.tsx` - Main dashboard content display
  - `DashboardEmptyState.tsx` - Empty state when no MCPs exist
  - `DashboardHeader.tsx` - Dashboard header with user info
  - `types.ts` - Dashboard-specific type definitions
  - `useDashboardActions.ts` - Dashboard action handlers
  - `useDashboardKeyboardShortcuts.ts` - Keyboard shortcut logic
  - `useDashboardState.ts` - Dashboard state management

- **`layout/`** - Layout components
  - `Footer.tsx` - Application footer
  - `Header.tsx` - Application header
  - `Layout.tsx` - Main layout wrapper

- **`logs/`** - Logs page components
  - `LogsCard.tsx` - Individual log entry card
  - `LogsDisplay.tsx` - Main logs display component
  - `LogsFilters.tsx` - Log filtering controls
  - `LogsHeader.tsx` - Logs page header
  - `LogsTable.tsx` - Logs table component
  - `LogsTableRow.tsx` - Individual table row
  - `hooks.ts` - Logs-specific hooks
  - `index.ts` - Logs component exports
  - `types.ts` - Logs-specific types
  - `utils.ts` - Logs utility functions

- **`mcp/`** - MCP-related components
  - `MCPCard.tsx` - Individual MCP instance card
  - `MCPSection.tsx` - MCP section wrapper

- **`modals/`** - Modal components
  - `ConfirmationModal.tsx` - Generic confirmation dialog
  - `CopyURLModal.tsx` - URL copying modal
  - `CreateMCPModal.tsx` - MCP creation modal
  - `EditMCPModal.tsx` - MCP editing modal
  - `MagicLinkPopup.tsx` - Magic link authentication popup

- **`ui/`** - Reusable UI components
  - `CustomDropdown.tsx` - Custom dropdown implementation
  - `Dropdown.tsx` - Generic dropdown component
  - `KeyboardShortcuts.tsx` - Keyboard shortcuts display
  - `StatusBadge.tsx` - Status indicator badges
  - `Tooltip.tsx` - Tooltip component
  - `form/` - Form-specific components
    - `CredentialFields.tsx` - Credential input fields
    - `ExpirationDropdown.tsx` - Expiration time selector
    - `FormField.tsx` - Generic form field wrapper
    - `TypeDropdown.tsx` - MCP type selector
    - `ValidationFeedback.tsx` - Form validation feedback

#### Custom Hooks (`/frontend/src/hooks/`)

- `useAuth.ts` - Authentication state management
- `useCreateMCPForm.ts` - MCP creation form logic
- `useDropdown.ts` - Dropdown component logic

#### Utility Functions (`/frontend/src/utils/`)

- `authTest.ts` - Authentication testing utilities
- `dropdownHelpers.ts` - Dropdown helper functions
- `dropdownUtils.ts` - Dropdown utility functions
- `mcpHelpers.ts` - MCP-related helper functions

#### Type Definitions (`/frontend/src/types/`)

- `createMCPModal.ts` - Create MCP modal types
- `index.ts` - Main type exports

This new structure ensures:
- **Maximum 8 files per folder** (CLAUDE.md compliance)
- **Single responsibility** per component
- **Logical grouping** by feature/domain
- **Clear separation** between components, hooks, and utilities

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

The component architecture has been completely refactored to follow CLAUDE.md rules:

#### Modal Components (`/frontend/src/components/modals/`)

-   **MagicLinkPopup** (`MagicLinkPopup.tsx`)
    -   Modal popup showing magic link sent confirmation
    -   Polling mechanism that checks authentication every 2 seconds
    -   Displays user's email and instructions
    -   Automatic redirect to dashboard on successful verification
    -   Development note about console link visibility

-   **CreateMCPModal** (`CreateMCPModal.tsx`)
    -   Main MCP creation modal with form validation
    -   Integrates with credential validation flow
    -   Real-time type selection and credential testing

-   **EditMCPModal** (`EditMCPModal.tsx`)
    -   MCP instance editing interface
    -   Supports name, description, and expiration updates

-   **ConfirmationModal** (`ConfirmationModal.tsx`)
    -   Generic confirmation dialog for destructive actions
    -   Used for MCP deletion and other confirmations

-   **CopyURLModal** (`CopyURLModal.tsx`)
    -   Modal for copying MCP instance URLs
    -   Clipboard integration and user feedback

#### Dashboard Components (`/frontend/src/components/dashboard/`)

-   **DashboardContent** (`DashboardContent.tsx`)
    -   Main dashboard content with MCP instance display
    -   Status-based organization (Active, Inactive, Expired)

-   **DashboardHeader** (`DashboardHeader.tsx`)
    -   Dashboard header with user profile and actions
    -   Keyboard shortcuts display and user dropdown

-   **DashboardEmptyState** (`DashboardEmptyState.tsx`)
    -   Empty state component when no MCPs exist
    -   Onboarding guidance and create button

#### UI Components (`/frontend/src/components/ui/`)

-   **StatusBadge** (`StatusBadge.tsx`)
    -   Status indicator badges for MCP instances
    -   Color-coded status display (Active, Inactive, Expired)

-   **Tooltip** (`Tooltip.tsx`)
    -   Reusable tooltip component with smart positioning
    -   Used throughout the application for help text

-   **KeyboardShortcuts** (`KeyboardShortcuts.tsx`)
    -   Keyboard shortcuts display component
    -   Shows available shortcuts and their descriptions

-   **Form Components** (`/frontend/src/components/ui/form/`)
    -   **CredentialFields** (`CredentialFields.tsx`) - Dynamic credential input fields
    -   **ValidationFeedback** (`ValidationFeedback.tsx`) - Form validation feedback
    -   **TypeDropdown** (`TypeDropdown.tsx`) - MCP type selection dropdown
    -   **ExpirationDropdown** (`ExpirationDropdown.tsx`) - Expiration time selector
    -   **FormField** (`FormField.tsx`) - Generic form field wrapper

#### Logs Components (`/frontend/src/components/logs/`)

-   **LogsDisplay** (`LogsDisplay.tsx`)
    -   Main logs display with filtering and search
    -   Integration with backend logs API

-   **LogsFilters** (`LogsFilters.tsx`)
    -   Advanced filtering controls for logs
    -   Level, source, and time range filters

-   **LogsTable** (`LogsTable.tsx`)
    -   Tabular display of log entries
    -   Sortable columns and pagination

-   **LogsHeader** (`LogsHeader.tsx`)
    -   Logs page header with actions
    -   Export functionality and refresh controls

#### MCP Components (`/frontend/src/components/mcp/`)

-   **MCPCard** (`MCPCard.tsx`)
    -   Individual MCP instance card component
    -   Status display, actions, and quick information

-   **MCPSection** (`MCPSection.tsx`)
    -   Section wrapper for organizing MCP cards
    -   Used for status-based grouping

#### Layout Components (`/frontend/src/components/layout/`)

-   **Layout** (`Layout.tsx`)
    -   Main application layout wrapper
    -   Navigation and footer integration

-   **Header** (`Header.tsx`)
    -   Application header component
    -   Navigation and user actions

-   **Footer** (`Footer.tsx`)
    -   Application footer component
    -   Links and application information

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
