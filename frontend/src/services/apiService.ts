import type { MCPType, MCPInstance, MCPInstanceCreationResponse, APIKey, MCPLog } from '../types';

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
  
  const data = await response.json();
  
  // Check if this is an OAuth response (has oauth field)
  if (data.oauth && data.instance) {
    return data as T;
  }
  
  // Otherwise, assume it's wrapped in a data field
  return (data as ApiResponse<T>).data || data;
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
    return makeRequest<MCPType[]>('/mcp-types?status=active');
  },

  getMCPTypeByName: async (name: string): Promise<MCPType> => {
    return makeRequest<MCPType>(`/mcp-types/${name}`);
  },

  // MCP Credentials Validation
  validateMCPCredentials: async (data: {
    mcp_type: string;
    credentials: Record<string, string>;
  }): Promise<{
    valid: boolean;
    message: string;
    service?: {
      name: string;
      type: string;
    };
  }> => {
    return makeRequest<{
      valid: boolean;
      message: string;
      service?: {
        name: string;
        type: string;
      };
    }>('/mcps/validate-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // MCP Instances
  createMCP: async (data: {
    mcp_type: string;
    custom_name?: string;
    expiration_option: string;
    credentials: Record<string, string>;
    config?: Record<string, unknown>;
  }): Promise<MCPInstanceCreationResponse> => {
    return makeRequest<MCPInstanceCreationResponse>('/mcps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMCPInstances: async (params?: {
    status?: string;
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
    expires_at: string;
  }): Promise<{ id: string; status: string; expires_at: string; message: string }> => {
    return makeRequest<{ id: string; status: string; expires_at: string; message: string }>(`/mcps/${id}/renew`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  toggleMCP: async (id: string, data: {
    status: 'active' | 'inactive';
  }): Promise<{ id: string; status: string; message: string }> => {
    return makeRequest<{ id: string; status: string; message: string }>(`/mcps/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  editMCP: async (id: string, data: {
    custom_name?: string;
    credentials?: Record<string, string>;
  }): Promise<{ id: string; custom_name: string; message: string }> => {
    return makeRequest<{ id: string; custom_name: string; message: string }>(`/mcps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateMCPName: async (id: string, data: {
    custom_name: string;
  }): Promise<{ id: string; custom_name: string; message: string }> => {
    return makeRequest<{ id: string; custom_name: string; message: string }>(`/mcps/${id}/name`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateMCPCredentials: async (id: string, data: {
    credentials: Record<string, string>;
  }): Promise<{ id: string; message: string }> => {
    return makeRequest<{ id: string; message: string }>(`/mcps/${id}/credentials`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  validateInstanceCredentials: async (id: string, data: {
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
    }>(`/mcps/${id}/credentials/validate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteMCP: async (id: string): Promise<{
    message: string;
    instance_id: string;
    service_type: string;
    deleted_at: string;
    details: {
      instance_id: string;
      service_type: string;
      custom_name: string;
      user_id: string;
    };
  }> => {
    return makeRequest<{
      message: string;
      instance_id: string;
      service_type: string;
      deleted_at: string;
      details: {
        instance_id: string;
        service_type: string;
        custom_name: string;
        user_id: string;
      };
    }>(`/mcps/${id}`, {
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
    format: 'json' | 'csv' | 'txt';
    start_time?: string;
    end_time?: string;
    level?: 'debug' | 'info' | 'warn' | 'error';
  }) => {
    const response = await fetch(`${API_BASE_URL}/mcps/${mcpId}/logs/export`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
    }

    // Get the blob and create object URL
    const blob = await response.blob();
    const download_url = window.URL.createObjectURL(blob);
    
    // Get filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `logs_${mcpId}_${new Date().toISOString().split('T')[0]}.${data.format}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Return export response metadata
    return {
      download_url,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      size_bytes: blob.size,
      format: data.format,
      total_logs: 0, // This would need to be provided by the backend
      filename
    };
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

  // User Plan
  getUserPlan: async (): Promise<{
    userId: string;
    plan: {
      type: string;
      maxInstances: number | null;
      features: any;
      expiresAt: string | null;
      createdAt: string;
    };
    isActive: boolean;
    activeInstances: number;
    maxInstances: number | null;
    canCreate: boolean;
    message: string;
    usage: {
      used: number;
      limit: number | string;
      remaining: number | string;
    };
  }> => {
    return makeRequest<{
      userId: string;
      plan: {
        type: string;
        maxInstances: number | null;
        features: any;
        expiresAt: string | null;
        createdAt: string;
      };
      isActive: boolean;
      activeInstances: number;
      maxInstances: number | null;
      canCreate: boolean;
      message: string;
      usage: {
        used: number;
        limit: number | string;
        remaining: number | string;
      };
    }>('/auth/plan');
  },

  // Billing & Subscription Management
  getBillingStatus: async (): Promise<{
    userId: string;
    plan: {
      type: 'free' | 'pro';
      maxInstances: number | null;
      paymentStatus: string;
      features: any;
      expiresAt: string | null;
      subscriptionId: string | null;
    };
    subscription?: any;
    canUpgrade: boolean;
  }> => {
    return makeRequest('/billing/status');
  },

  createCheckoutSession: async (): Promise<{
    orderId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    customerId: string;
    razorpayKeyId: string;
    customerEmail: string;
    customerName: string;
  }> => {
    return makeRequest('/billing/checkout', {
      method: 'POST'
    });
  },

  handleCheckoutSuccess: async (sessionId: string): Promise<{
    planType: string;
    paymentStatus: string;
    upgradedBy?: string;
    note?: string;
  }> => {
    return makeRequest('/billing/success', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  },

  cancelSubscription: async (): Promise<{
    subscriptionId: string;
    cancelledAt: string;
    note: string;
  }> => {
    return makeRequest('/billing/cancel', {
      method: 'POST'
    });
  },

  // Generic HTTP methods for direct API calls
  get: async <T = any>(endpoint: string): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'GET'
    });
  },

  post: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },

  put: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'DELETE'
    });
  },

};