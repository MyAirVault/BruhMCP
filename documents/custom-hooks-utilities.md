# Custom Hooks and Utility Functions

This document provides comprehensive documentation for the custom hooks and utility functions implemented in the MiniMCP frontend to support the refactored component architecture.

## Overview

The MiniMCP frontend uses custom hooks and utility functions to extract business logic, state management, and reusable functionality from components. This approach ensures components focus on rendering while business logic remains testable and reusable.

## Custom Hooks

### Authentication Hooks

#### `useAuth.ts`
**Purpose**: Manages authentication state and provides authentication-related functions.

**Location**: `/frontend/src/hooks/useAuth.ts`

**Features**:
- User authentication state management
- Login/logout functionality
- Authentication status checking
- Token management
- Auto-redirect logic for protected routes

**Usage**:
```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, checkAuth } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.email}!</div>;
};
```

**Returns**:
- `user` - Current user object
- `isAuthenticated` - Boolean authentication status
- `login(credentials)` - Login function
- `logout()` - Logout function
- `checkAuth()` - Check current authentication status

### Form Management Hooks

#### `useCreateMCPForm.ts`
**Purpose**: Manages the complex state and logic for the MCP creation form.

**Location**: `/frontend/src/hooks/useCreateMCPForm.ts`

**Features**:
- Form state management (name, description, type, credentials, expiration)
- Form validation logic
- Credential validation workflow
- Error handling and display
- Form submission handling
- Integration with backend API

**Usage**:
```typescript
import { useCreateMCPForm } from '../hooks/useCreateMCPForm';

const CreateMCPModal = () => {
  const {
    formData,
    errors,
    isValidating,
    isSubmitting,
    handleInputChange,
    handleTypeChange,
    handleSubmit,
    validateCredentials,
    resetForm
  } = useCreateMCPForm();
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

**Returns**:
- `formData` - Current form data object
- `errors` - Form validation errors
- `isValidating` - Credential validation status
- `isSubmitting` - Form submission status
- `handleInputChange(field, value)` - Input change handler
- `handleTypeChange(type)` - MCP type change handler
- `handleSubmit(event)` - Form submission handler
- `validateCredentials()` - Credential validation function
- `resetForm()` - Reset form to initial state

### UI Interaction Hooks

#### `useDropdown.ts`
**Purpose**: Manages dropdown component state and behavior.

**Location**: `/frontend/src/hooks/useDropdown.ts`

**Features**:
- Dropdown open/close state management
- Keyboard navigation support
- Click outside to close functionality
- Option selection handling
- Accessibility features

**Usage**:
```typescript
import { useDropdown } from '../hooks/useDropdown';

const MyDropdown = ({ options, onSelect }) => {
  const {
    isOpen,
    selectedOption,
    highlightedIndex,
    toggleDropdown,
    selectOption,
    handleKeyDown,
    dropdownRef
  } = useDropdown(options, onSelect);
  
  return (
    <div ref={dropdownRef} onKeyDown={handleKeyDown}>
      {/* Dropdown implementation */}
    </div>
  );
};
```

**Returns**:
- `isOpen` - Boolean dropdown open state
- `selectedOption` - Currently selected option
- `highlightedIndex` - Currently highlighted option index
- `toggleDropdown()` - Toggle dropdown open/close
- `selectOption(option)` - Select an option
- `handleKeyDown(event)` - Keyboard event handler
- `dropdownRef` - Ref for dropdown container

### Dashboard-Specific Hooks

#### `useDashboardState.ts`
**Purpose**: Manages dashboard-specific state including MCP instances, loading states, and filters.

**Location**: `/frontend/src/components/dashboard/useDashboardState.ts`

**Features**:
- MCP instances data management
- Loading and error states
- Filter and search functionality
- Data refresh logic
- Status-based organization

**Usage**:
```typescript
import { useDashboardState } from './useDashboardState';

const DashboardContent = () => {
  const {
    mcpInstances,
    loading,
    error,
    activeMCPs,
    inactiveMCPs,
    expiredMCPs,
    refreshData,
    setFilter
  } = useDashboardState();
  
  // Component implementation
};
```

#### `useDashboardActions.ts`
**Purpose**: Handles dashboard actions like create, edit, delete, toggle, and renew MCP instances.

**Location**: `/frontend/src/components/dashboard/useDashboardActions.ts`

**Features**:
- MCP instance action handlers
- Confirmation dialogs
- Success/error notifications
- Data refresh after actions
- Optimistic updates

**Usage**:
```typescript
import { useDashboardActions } from './useDashboardActions';

const DashboardContent = () => {
  const {
    handleCreateMCP,
    handleEditMCP,
    handleDeleteMCP,
    handleToggleMCP,
    handleRenewMCP,
    isActionLoading
  } = useDashboardActions();
  
  // Component implementation
};
```

#### `useDashboardKeyboardShortcuts.ts`
**Purpose**: Manages keyboard shortcuts for dashboard interactions.

**Location**: `/frontend/src/components/dashboard/useDashboardKeyboardShortcuts.ts`

**Features**:
- Keyboard shortcut registration
- Shortcut handling logic
- Modal opening via shortcuts
- Accessibility support

**Usage**:
```typescript
import { useDashboardKeyboardShortcuts } from './useDashboardKeyboardShortcuts';

const Dashboard = () => {
  const { shortcuts } = useDashboardKeyboardShortcuts({
    onCreateMCP: handleCreateMCP,
    onRefresh: handleRefresh
  });
  
  // Component implementation
};
```

### Logs-Specific Hooks

#### `hooks.ts` (Logs)
**Purpose**: Manages logs page state, filtering, and data fetching.

**Location**: `/frontend/src/components/logs/hooks.ts`

**Features**:
- Log data fetching and management
- Advanced filtering (level, source, time range)
- Search functionality
- Export capabilities
- Real-time refresh

**Usage**:
```typescript
import { useLogsState, useLogsFilters } from './hooks';

const LogsPage = () => {
  const { logs, loading, error, refresh } = useLogsState();
  const { filters, setFilter, clearFilters } = useLogsFilters();
  
  // Component implementation
};
```

## Utility Functions

### Authentication Utilities

#### `authTest.ts`
**Purpose**: Testing utilities for authentication flows.

**Location**: `/frontend/src/utils/authTest.ts`

**Functions**:
- `validateToken(token)` - Validate JWT token format
- `isTokenExpired(token)` - Check if token is expired
- `extractUserFromToken(token)` - Extract user data from token
- `mockAuthResponse(userData)` - Create mock authentication response for testing

### Dropdown Utilities

#### `dropdownHelpers.ts`
**Purpose**: Helper functions for dropdown component logic.

**Location**: `/frontend/src/utils/dropdownHelpers.ts`

**Functions**:
- `findOptionByValue(options, value)` - Find option by value
- `getNextOption(options, currentIndex)` - Get next option for keyboard navigation
- `getPreviousOption(options, currentIndex)` - Get previous option for keyboard navigation
- `filterOptions(options, searchTerm)` - Filter options based on search term

#### `dropdownUtils.ts`
**Purpose**: Utility functions for dropdown behavior and positioning.

**Location**: `/frontend/src/utils/dropdownUtils.ts`

**Functions**:
- `calculateDropdownPosition(triggerElement, dropdownElement)` - Calculate optimal dropdown position
- `isDropdownInViewport(element)` - Check if dropdown is within viewport
- `adjustDropdownPosition(element, adjustment)` - Adjust dropdown position
- `getDropdownAlignment(triggerElement, dropdownElement)` - Determine dropdown alignment

### MCP Management Utilities

#### `mcpHelpers.ts`
**Purpose**: Helper functions for MCP instance management and data processing.

**Location**: `/frontend/src/utils/mcpHelpers.ts`

**Functions**:
- `formatMCPStatus(status)` - Format MCP status for display
- `calculateMCPHealth(metrics)` - Calculate MCP health score
- `getMCPStatusColor(status)` - Get status color for UI display
- `formatMCPUptime(startTime)` - Format MCP uptime for display
- `validateMCPName(name)` - Validate MCP instance name
- `generateMCPUrl(instance)` - Generate MCP access URL
- `parseMCPMetrics(rawMetrics)` - Parse raw metrics data
- `sortMCPInstances(instances, sortBy)` - Sort MCP instances by criteria

**Usage Examples**:
```typescript
import {
  formatMCPStatus,
  getMCPStatusColor,
  validateMCPName,
  generateMCPUrl
} from '../utils/mcpHelpers';

// Format status for display
const statusText = formatMCPStatus('running'); // "Active"

// Get status color
const statusColor = getMCPStatusColor('running'); // "green"

// Validate name
const isValid = validateMCPName('my-mcp-instance'); // true

// Generate URL
const url = generateMCPUrl(mcpInstance); // "http://localhost:3001"
```

### Logs Utilities

#### `utils.ts` (Logs)
**Purpose**: Utility functions for log processing and formatting.

**Location**: `/frontend/src/components/logs/utils.ts`

**Functions**:
- `formatLogTimestamp(timestamp)` - Format log timestamp for display
- `formatLogLevel(level)` - Format log level for display
- `parseLogMessage(message)` - Parse structured log messages
- `filterLogsByLevel(logs, level)` - Filter logs by level
- `filterLogsByTimeRange(logs, startTime, endTime)` - Filter logs by time range
- `searchLogs(logs, searchTerm)` - Search logs by content
- `exportLogsToCSV(logs)` - Export logs to CSV format
- `exportLogsToJSON(logs)` - Export logs to JSON format

## Integration Patterns

### Hook Composition
Multiple hooks can be composed together for complex functionality:

```typescript
const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const dashboardState = useDashboardState();
  const dashboardActions = useDashboardActions();
  const { shortcuts } = useDashboardKeyboardShortcuts({
    onCreateMCP: dashboardActions.handleCreateMCP
  });
  
  // Component implementation using multiple hooks
};
```

### Utility Function Integration
Utility functions integrate seamlessly with hooks:

```typescript
const useDashboardState = () => {
  const [mcpInstances, setMcpInstances] = useState([]);
  
  const processMCPData = useCallback((rawData) => {
    return rawData.map(instance => ({
      ...instance,
      statusText: formatMCPStatus(instance.status),
      statusColor: getMCPStatusColor(instance.status),
      url: generateMCPUrl(instance)
    }));
  }, []);
  
  // Hook implementation
};
```

## Testing Strategy

### Hook Testing
Custom hooks are tested using React Testing Library's `renderHook`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

test('useAuth provides authentication functionality', () => {
  const { result } = renderHook(() => useAuth());
  
  expect(result.current.isAuthenticated).toBe(false);
  
  act(() => {
    result.current.login({ email: 'test@example.com' });
  });
  
  expect(result.current.isAuthenticated).toBe(true);
});
```

### Utility Function Testing
Utility functions are tested as pure functions:

```typescript
import { formatMCPStatus, validateMCPName } from '../utils/mcpHelpers';

describe('mcpHelpers', () => {
  test('formatMCPStatus formats status correctly', () => {
    expect(formatMCPStatus('running')).toBe('Active');
    expect(formatMCPStatus('stopped')).toBe('Inactive');
    expect(formatMCPStatus('expired')).toBe('Expired');
  });
  
  test('validateMCPName validates names correctly', () => {
    expect(validateMCPName('valid-name')).toBe(true);
    expect(validateMCPName('')).toBe(false);
    expect(validateMCPName('name with spaces')).toBe(false);
  });
});
```

## Benefits

### 1. Separation of Concerns
- **Components focus on rendering** - Business logic extracted to hooks
- **Hooks manage state and effects** - Pure functions handle data processing
- **Utilities provide reusable functions** - Shared logic across components

### 2. Testability
- **Hooks can be tested independently** - No need to render components
- **Utility functions are pure** - Easy to test with various inputs
- **Mocking is simplified** - Clear boundaries between different concerns

### 3. Reusability
- **Hooks can be shared** - Common patterns available across components
- **Utilities are framework-agnostic** - Can be used in any context
- **Logic is centralized** - Changes propagate to all users

### 4. Maintainability
- **Clear structure** - Easy to locate specific functionality
- **Focused responsibility** - Each hook/utility has a single purpose
- **Consistent patterns** - Predictable structure across the application

This architecture ensures that the MiniMCP frontend remains maintainable, testable, and follows React best practices while complying with CLAUDE.md organizational rules.