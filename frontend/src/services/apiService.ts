import type { MCPType, MCPInstance, APIKey, MCPLog } from '../types';

const API_BASE_URL = '/api/v1';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id?: string;
    timestamp?: string;
  };
}

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

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return handleResponse<T>(response);
};

export const apiService = {
  // MCP Types
  getMCPTypes: async (): Promise<MCPType[]> => {
    return makeRequest<MCPType[]>('/mcp-types');
  },

  getMCPTypeByName: async (name: string): Promise<MCPType> => {
    return makeRequest<MCPType>(`/mcp-types/${name}`);
  },

  // MCP Instances
  createMCP: async (data: {
    mcp_type: string;
    custom_name?: string;
    expiration_option: string;
    credentials: Record<string, string>;
    config?: Record<string, unknown>;
  }): Promise<MCPInstance> => {
    return makeRequest<MCPInstance>('/mcps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMCPInstances: async (params?: {
    status?: string;
    is_active?: boolean;
    mcp_type?: string;
    expiration_option?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }): Promise<MCPInstance[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/mcps?${queryString}` : '/mcps';
    
    return makeRequest<MCPInstance[]>(endpoint);
  },

  getMCPInstance: async (id: string): Promise<MCPInstance> => {
    return makeRequest<MCPInstance>(`/mcps/${id}`);
  },

  renewMCP: async (id: string, data: {
    expiration_option: string;
  }): Promise<{ id: string; status: string; expires_at: string; message: string }> => {
    return makeRequest<{ id: string; status: string; expires_at: string; message: string }>(`/mcps/${id}/renew`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleMCP: async (id: string, data: {
    is_active: boolean;
  }): Promise<{ id: string; is_active: boolean; message: string }> => {
    return makeRequest<{ id: string; is_active: boolean; message: string }>(`/mcps/${id}/toggle`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  editMCP: async (id: string, data: {
    custom_name?: string;
    credentials?: Record<string, string>;
  }): Promise<{ id: string; custom_name: string; message: string }> => {
    return makeRequest<{ id: string; custom_name: string; message: string }>(`/mcps/${id}/edit`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMCP: async (id: string): Promise<{ message: string }> => {
    return makeRequest<{ message: string }>(`/mcps/${id}`, {
      method: 'DELETE',
    });
  },

  // API Keys
  getAPIKeys: async (): Promise<APIKey[]> => {
    return makeRequest<APIKey[]>('/api-keys');
  },

  storeAPIKey: async (data: {
    mcp_type_id: string;
    credentials: Record<string, string>;
  }): Promise<APIKey> => {
    return makeRequest<APIKey>('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  validateCredentials: async (data: {
    mcp_type_id: string;
    credentials: Record<string, string>;
  }): Promise<{
    valid: boolean;
    message: string;
    api_info?: {
      service: string;
      quota_remaining?: number;
      permissions?: string[];
    };
  }> => {
    return makeRequest<{
      valid: boolean;
      message: string;
      api_info?: {
        service: string;
        quota_remaining?: number;
        permissions?: string[];
      };
    }>('/api-keys/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteAPIKey: async (id: string): Promise<void> => {
    return makeRequest<void>(`/api-keys/${id}`, {
      method: 'DELETE',
    });
  },

  // Logs
  getMCPLogs: async (mcpId: string, params?: {
    start_time?: string;
    end_time?: string;
    level?: string;
    limit?: number;
    offset?: number;
  }): Promise<MCPLog[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/mcps/${mcpId}/logs?${queryString}` : `/mcps/${mcpId}/logs`;
    
    return makeRequest<MCPLog[]>(endpoint);
  },

  exportMCPLogs: async (mcpId: string, data: {
    format: string;
    start_time?: string;
    end_time?: string;
  }): Promise<{
    download_url: string;
    expires_at: string;
    size_bytes: number;
  }> => {
    return makeRequest<{
      download_url: string;
      expires_at: string;
      size_bytes: number;
    }>(`/mcps/${mcpId}/logs/export`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAllMCPLogs: async (params?: {
    start_time?: string;
    end_time?: string;
    level?: string;
    limit?: number;
    offset?: number;
  }): Promise<MCPLog[]> => {
    // First get all MCP instances
    const mcps = await makeRequest<MCPInstance[]>('/mcps');
    
    // Then fetch logs for each MCP instance
    const allLogsPromises = mcps.map(async (mcp) => {
      try {
        const logs = await makeRequest<MCPLog[]>(`/mcps/${mcp.id}/logs`, {
          method: 'GET',
        });
        // Add MCP info to each log entry
        return logs.map(log => ({
          ...log,
          mcpId: mcp.id,
          mcpName: mcp.custom_name || `${mcp.mcp_type} MCP`
        }));
      } catch (error) {
        console.warn(`Failed to fetch logs for MCP ${mcp.id}:`, error);
        return [];
      }
    });
    
    // Wait for all promises and flatten the results
    const allLogsArrays = await Promise.all(allLogsPromises);
    const allLogs = allLogsArrays.flat();
    
    // Sort by timestamp (newest first)
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply filters if provided
    let filteredLogs = allLogs;
    
    if (params?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === params.level);
    }
    
    if (params?.start_time) {
      const startTime = new Date(params.start_time);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startTime);
    }
    
    if (params?.end_time) {
      const endTime = new Date(params.end_time);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endTime);
    }
    
    // Apply pagination
    if (params?.offset || params?.limit) {
      const start = params?.offset || 0;
      const end = params?.limit ? start + params.limit : undefined;
      filteredLogs = filteredLogs.slice(start, end);
    }
    
    return filteredLogs;
  },

  // Settings
  getSettings: async (): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
    };
    preferences: {
      default_expiration_minutes: number;
      notifications_enabled: boolean;
    };
    limits: {
      max_concurrent_mcps: number;
      max_instances_per_user: number;
      max_api_keys: number;
    };
  }> => {
    return makeRequest<{
      user: {
        id: string;
        email: string;
        name: string;
      };
      preferences: {
        default_expiration_minutes: number;
        notifications_enabled: boolean;
      };
      limits: {
        max_concurrent_mcps: number;
        max_instances_per_user: number;
        max_api_keys: number;
      };
    }>('/settings');
  },

  updateSettings: async (data: {
    preferences: {
      default_expiration_minutes?: number;
      notifications_enabled?: boolean;
    };
  }): Promise<{
    message: string;
    preferences: {
      default_expiration_minutes: number;
      notifications_enabled: boolean;
    };
  }> => {
    return makeRequest<{
      message: string;
      preferences: {
        default_expiration_minutes: number;
        notifications_enabled: boolean;
      };
    }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};