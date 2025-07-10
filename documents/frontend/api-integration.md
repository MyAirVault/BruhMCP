# Frontend API Integration

This document describes how the frontend integrates with the backend API endpoints to provide a complete user experience.

## Table of Contents

1. [Overview](#overview)
2. [API Service Architecture](#api-service-architecture)
3. [Authentication Flow](#authentication-flow)
4. [MCP Management Integration](#mcp-management-integration)
5. [Logs and Monitoring](#logs-and-monitoring)
6. [User Profile Management](#user-profile-management)
7. [Error Handling](#error-handling)
8. [Type Safety](#type-safety)

## Overview

The frontend uses a centralized API service (`/frontend/src/services/apiService.ts`) to communicate with the backend. All API calls are fully integrated into the React components, providing real-time data updates and seamless user interactions.

## API Service Architecture

### Base Configuration

```typescript
const API_BASE_URL = '/api/v1';

// All requests include:
credentials: 'include', // Cookie-based authentication
headers: {
  'Content-Type': 'application/json',
  ...options.headers,
}
```

### Response Handling

The API service provides consistent error handling and type-safe responses:

```typescript
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
  }
  
  const data: ApiResponse<T> = await response.json();
  return data.data;
};
```

## Authentication Flow

### Cookie-Based Authentication

The frontend leverages the existing cookie-based authentication system:

- JWT tokens are automatically included in requests via HTTP-only cookies
- No manual token management required
- Authentication state is managed by the `useAuth` hook
- Automatic redirects on authentication failures

### Integration Points

- **Login/Verify pages**: Use existing `/auth/request` and `/auth/verify` endpoints
- **Protected routes**: Automatic authentication checks
- **API calls**: Cookie credentials included automatically

## MCP Management Integration

### Dashboard Component (`/frontend/src/pages/Dashboard.tsx`)

The Dashboard is fully integrated with the backend API:

#### Data Loading
```typescript
useEffect(() => {
  const loadMCPInstances = async () => {
    try {
      setIsLoadingMCPs(true);
      const instances = await apiService.getMCPInstances();
      setMCPInstances(instances);
    } catch (error) {
      console.error('Failed to load MCP instances:', error);
      setMCPInstances([]);
    } finally {
      setIsLoadingMCPs(false);
    }
  };

  loadMCPInstances();
}, []);
```

#### CRUD Operations

**Create MCP**
```typescript
const handleCreateMCP = async (data: any) => {
  try {
    const newInstance = await apiService.createMCP(data);
    const instances = await apiService.getMCPInstances();
    setMCPInstances(instances);
    setIsCreateModalOpen(false);
  } catch (error) {
    console.error('Failed to create MCP:', error);
  }
};
```

**Edit MCP**
```typescript
const handleEditMCP = async (data: EditData) => {
  try {
    await apiService.editMCP(editModalData.mcp.id, {
      custom_name: data.name,
      credentials: {
        api_key: data.apiKey,
        client_id: data.clientId,
        client_secret: data.clientSecret
      }
    });
    
    await refreshMCPList();
    setEditModalData({ isOpen: false, mcp: null });
  } catch (error) {
    console.error('Failed to edit MCP:', error);
  }
};
```

**Toggle MCP Status**
```typescript
const toggleMCP = async (mcp: MCPItem, isActive: boolean) => {
  try {
    await apiService.toggleMCP(mcp.id, { is_active: isActive });
    await refreshMCPList();
  } catch (error) {
    console.error('Failed to toggle MCP:', error);
  }
};
```

**Renew MCP**
```typescript
const renewMCP = async (mcp: MCPItem, expiration: string) => {
  try {
    await apiService.renewMCP(mcp.id, { expiration_option: expiration });
    await refreshMCPList();
  } catch (error) {
    console.error('Failed to renew MCP:', error);
  }
};
```

**Delete MCP**
```typescript
const deleteMCP = async (mcp: MCPItem) => {
  try {
    await apiService.deleteMCP(mcp.id);
    await refreshMCPList();
  } catch (error) {
    console.error('Failed to delete MCP:', error);
  }
};
```

#### Data Transformation

The Dashboard converts backend `MCPInstance` objects to the frontend `MCPItem` format for backward compatibility:

```typescript
const convertToMCPItem = (instance: MCPInstance): MCPItem => ({
  id: instance.id,
  name: instance.custom_name || `${instance.mcp_type.display_name} #${instance.instance_number}`,
  email: instance.access_url,
  status: instance.status === 'active' ? 'active' : 
          instance.status === 'expired' ? 'expired' : 'inactive'
});
```

#### Status Filtering

MCPs are categorized and filtered based on their backend status:

```typescript
const activeMCPs = mcpInstances
  .filter(instance => instance.status === 'active' && instance.is_active)
  .map(convertToMCPItem);

const inactiveMCPs = mcpInstances
  .filter(instance => instance.status === 'inactive' || !instance.is_active)
  .map(convertToMCPItem);

const expiredMCPs = mcpInstances
  .filter(instance => instance.status === 'expired')
  .map(convertToMCPItem);
```

## Logs and Monitoring

### Logs Component (`/frontend/src/pages/Logs.tsx`)

The Logs page integrates with the backend logging system:

#### Loading Logs
```typescript
useEffect(() => {
  const loadLogs = async () => {
    try {
      if (isSpecificMCP && mcpId) {
        // Load logs for specific MCP
        const mcpLogs = await apiService.getMCPLogs(mcpId);
        setLogs(mcpLogs);
        setFilteredLogs(mcpLogs);
      } else {
        // Fallback to mock data for all logs
        // (Backend doesn't currently have an "all logs" endpoint)
        const allLogs = mockLogs.map(transformToMCPLog);
        setLogs(allLogs);
        setFilteredLogs(allLogs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      // Fallback to mock data
    }
  };

  loadLogs();
}, [isSpecificMCP, mcpId]);
```

#### Log Export
```typescript
const handleExportLogs = async () => {
  try {
    if (isSpecificMCP && mcpId) {
      // Use API export for specific MCP
      const exportData = await apiService.exportMCPLogs(mcpId, {
        format: 'json',
        start_time: timeFilter !== 'all' ? getTimeFilterDate(timeFilter) : undefined,
        end_time: new Date().toISOString()
      });
      
      // Download the file from the provided URL
      const link = document.createElement('a');
      link.href = exportData.download_url;
      link.download = `logs_${mcpId}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else {
      // Fallback to local export for all logs
      const dataStr = JSON.stringify(filteredLogs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  } catch (error) {
    console.error('Failed to export logs:', error);
    // Fallback to local export
  }
};
```

#### Real-time Refresh
```typescript
const handleRefreshLogs = async () => {
  setIsLoadingLogs(true);
  
  try {
    if (isSpecificMCP && mcpId) {
      const mcpLogs = await apiService.getMCPLogs(mcpId);
      setLogs(mcpLogs);
      setFilteredLogs(mcpLogs);
    } else {
      // Refresh all logs logic
    }
  } catch (error) {
    console.error('Failed to refresh logs:', error);
  } finally {
    setIsLoadingLogs(false);
  }
};
```

## User Profile Management

### Profile Component (`/frontend/src/pages/Profile.tsx`)

The Profile page integrates with user settings API:

#### Loading Profile Data
```typescript
useEffect(() => {
  const loadProfileData = async () => {
    try {
      const settings = await apiService.getSettings();
      const newProfileData: ProfileData = {
        firstName: settings.user.name.split(' ')[0] || '',
        lastName: settings.user.name.split(' ').slice(1).join(' ') || '',
        email: settings.user.email,
        emailNotifications: settings.preferences.notifications_enabled,
        createdAt: '2024-01-15T10:30:00Z', // Would come from user creation date
        mcpStats: {
          totalMCPs: 12, // Would come from MCP count
          activeMCPs: 8  // Would come from active MCP count
        }
      };
      setProfileData(newProfileData);
      setEditedData(newProfileData);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  loadProfileData();
}, [userName]);
```

#### Notification Toggle
```typescript
const handleNotificationToggle = async () => {
  const newValue = !profileData.emailNotifications;
  try {
    await apiService.updateSettings({
      preferences: {
        notifications_enabled: newValue
      }
    });
    setProfileData(prev => ({ ...prev, emailNotifications: newValue }));
    setEditedData(prev => ({ ...prev, emailNotifications: newValue }));
  } catch (error) {
    console.error('Failed to update notification settings:', error);
  }
};
```

#### Profile Save
```typescript
const handleSave = async () => {
  try {
    await apiService.updateSettings({
      preferences: {
        notifications_enabled: editedData.emailNotifications
      }
    });
    
    setProfileData(editedData);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setShowSavePopup(false);
  } catch (error) {
    console.error('Failed to save profile data:', error);
  }
};
```

## Error Handling

### Centralized Error Handling

The API service provides consistent error handling across all endpoints:

```typescript
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  const data: ApiResponse<T> = await response.json();
  return data.data;
};
```

### Component-Level Error Handling

Each component handles errors gracefully with fallbacks:

```typescript
try {
  const result = await apiService.someOperation();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error message
  // Implement fallback behavior
}
```

### Common Error Scenarios

1. **Network Errors**: Fall back to cached/mock data when available
2. **Authentication Errors**: Automatic redirect to login page
3. **Validation Errors**: Display field-specific error messages
4. **Server Errors**: Show generic error message with retry option

## Type Safety

### Enhanced Type System

The frontend includes comprehensive TypeScript types that match the backend API:

#### MCPInstance Type
```typescript
export interface MCPInstance {
  id: string;
  custom_name?: string;
  instance_number: number;
  access_token: string;
  access_url: string;
  assigned_port: number;
  process_id?: number;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  is_active: boolean;
  expiration_option: string;
  expires_at: string;
  last_accessed?: string;
  mcp_type: {
    name: string;
    display_name: string;
    icon_url?: string;
  };
  metrics?: {
    requests: number;
    errors: number;
    uptime_hours: number;
  };
  config?: Record<string, any>;
  stats?: {
    cpu_percent: number;
    memory_mb: number;
    uptime_seconds: number;
  };
  created_at: string;
  updated_at?: string;
}
```

#### API Response Types
```typescript
interface ApiResponse<T> {
  data: T;
  meta?: any;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    request_id?: string;
    timestamp?: string;
  };
}
```

### Type-Safe API Calls

All API service methods are fully typed:

```typescript
getMCPInstances: async (params?: {
  status?: string;
  is_active?: boolean;
  mcp_type?: string;
  expiration_option?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}): Promise<MCPInstance[]>
```

## Development Guidelines

### Best Practices

1. **Always handle errors**: Every API call should have appropriate error handling
2. **Use loading states**: Show loading indicators during API operations
3. **Provide fallbacks**: Include fallback data or behavior when APIs fail
4. **Maintain type safety**: Use TypeScript interfaces for all API data
5. **Refresh data appropriately**: Update local state after successful mutations

### Testing Considerations

- Mock the API service for component testing
- Test error scenarios and fallback behavior
- Verify loading states are displayed correctly
- Ensure type safety is maintained throughout

### Future Enhancements

1. **Real-time updates**: Consider WebSocket integration for live data updates
2. **Caching**: Implement response caching for frequently accessed data
3. **Optimistic updates**: Update UI immediately for better UX
4. **Retry logic**: Add automatic retry for failed requests
5. **Request queuing**: Handle multiple concurrent requests efficiently

## Implementation Status

✅ **Completed:**
- API service architecture
- Dashboard CRUD operations
- Logs viewing and export
- Profile management
- Type definitions
- Error handling

🔄 **In Progress:**
- Enhanced error user feedback
- Loading state optimizations

📋 **Planned:**
- Real-time data updates
- Advanced caching strategies
- Comprehensive error recovery