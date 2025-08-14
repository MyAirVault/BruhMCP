/**
 * Instance Status Management Hook
 * Tracks OAuth status and handles re-authentication flows for MCP instances
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface InstanceStatus {
  instanceId: string;
  oauthStatus: 'pending' | 'completed' | 'failed' | 'expired';
  status: 'active' | 'inactive' | 'expired';
  lastUsed?: Date;
  lastError?: string;
  requiresReauth: boolean;
}

export interface UseInstanceStatusOptions {
  instanceId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (status: InstanceStatus) => void;
  onReauthRequired?: (instanceId: string) => void;
}

export interface UseInstanceStatusReturn {
  status: InstanceStatus | null;
  loading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  handleApiError: (error: any) => boolean;
  markAsRequiringReauth: () => void;
  clearError: () => void;
}

/**
 * Hook for managing instance OAuth status and re-authentication flows
 */
export const useInstanceStatus = ({
  instanceId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  onStatusChange,
  onReauthRequired
}: UseInstanceStatusOptions): UseInstanceStatusReturn => {
  const [status, setStatus] = useState<InstanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  /**
   * Fetch instance status from API
   */
  const fetchStatus = useCallback(async (): Promise<InstanceStatus | null> => {
    try {
      const response = await fetch(`/api/instances/${instanceId}/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Instance not found');
        } else if (response.status === 403) {
          throw new Error('Access denied');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      return {
        instanceId: data.instanceId || instanceId,
        oauthStatus: data.oauthStatus || 'pending',
        status: data.status || 'inactive',
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : undefined,
        lastError: data.lastError,
        requiresReauth: data.oauthStatus === 'failed' || data.oauthStatus === 'expired'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }, [instanceId]);

  /**
   * Refresh instance status
   */
  const refreshStatus = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setError(null);
      const newStatus = await fetchStatus();
      
      if (!mountedRef.current) return;

      setStatus(newStatus);
      
      // Trigger callbacks
      if (newStatus) {
        onStatusChange?.(newStatus);
        
        if (newStatus.requiresReauth) {
          onReauthRequired?.(instanceId);
        }
      }

    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch status';
      setError(errorMessage);
      console.error('Failed to refresh instance status:', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchStatus, instanceId, onStatusChange, onReauthRequired]);

  /**
   * Handle API errors from other requests to detect auth issues
   */
  const handleApiError = useCallback((error: any): boolean => {
    if (!error) return false;

    // Check for re-authentication required errors
    const isAuthError = (
      error.status === 401 ||
      error.errorCode === 'INVALID_REFRESH_TOKEN' ||
      error.errorCode === 'OAUTH_FLOW_REQUIRED' ||
      error.requiresReauth === true ||
      (error.message && error.message.includes('re-authenticate'))
    );

    if (isAuthError) {
      // Update status to require re-auth
      setStatus(prev => prev ? {
        ...prev,
        oauthStatus: 'failed',
        requiresReauth: true,
        lastError: error.message || 'Authentication required'
      } : null);

      // Trigger re-auth callback
      onReauthRequired?.(instanceId);
      
      return true;
    }

    return false;
  }, [instanceId, onReauthRequired]);

  /**
   * Mark instance as requiring re-authentication
   */
  const markAsRequiringReauth = useCallback(() => {
    setStatus(prev => prev ? {
      ...prev,
      oauthStatus: 'failed',
      requiresReauth: true,
      lastError: 'Re-authentication required'
    } : null);

    onReauthRequired?.(instanceId);
  }, [instanceId, onReauthRequired]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial status fetch
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    refreshIntervalRef.current = setInterval(() => {
      refreshStatus();
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refreshStatus]);

  // Listen for instance status changes from other parts of the app
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `instance_status_${instanceId}` && event.newValue) {
        try {
          const newStatus = JSON.parse(event.newValue) as InstanceStatus;
          setStatus(newStatus);
          onStatusChange?.(newStatus);
        } catch (err) {
          console.error('Failed to parse instance status from storage:', err);
        }
      }
    };

    const handleCustomEvent = (event: CustomEvent) => {
      if (event.detail.instanceId === instanceId) {
        refreshStatus();
      }
    };

    // Listen for storage changes (cross-tab communication)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (within same tab)
    window.addEventListener('instanceStatusUpdate' as any, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('instanceStatusUpdate' as any, handleCustomEvent);
    };
  }, [instanceId, onStatusChange, refreshStatus]);

  // Update localStorage when status changes (for cross-tab communication)
  useEffect(() => {
    if (status) {
      try {
        localStorage.setItem(`instance_status_${instanceId}`, JSON.stringify(status));
      } catch (err) {
        // Ignore localStorage errors
      }
    }
  }, [instanceId, status]);

  return {
    status,
    loading,
    error,
    refreshStatus,
    handleApiError,
    markAsRequiringReauth,
    clearError
  };
};

/**
 * Utility function to broadcast instance status updates
 */
export const broadcastInstanceStatusUpdate = (instanceId: string) => {
  window.dispatchEvent(new CustomEvent('instanceStatusUpdate', {
    detail: { instanceId }
  }));
};

/**
 * Hook for managing multiple instances
 */
export const useMultipleInstanceStatus = (instanceIds: string[]) => {
  const [statuses, setStatuses] = useState<Record<string, InstanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const instances = instanceIds.map(instanceId => 
    useInstanceStatus({
      instanceId,
      autoRefresh: true,
      onStatusChange: (status) => {
        setStatuses(prev => ({
          ...prev,
          [instanceId]: status
        }));
      },
      onReauthRequired: (_id) => {
        // Can be handled by parent component
      }
    })
  );

  useEffect(() => {
    const allLoaded = instances.every(instance => !instance.loading);
    setLoading(!allLoaded);

    // Collect errors
    const errorMap: Record<string, string> = {};
    instances.forEach((instance, index) => {
      if (instance.error) {
        errorMap[instanceIds[index]] = instance.error;
      }
    });
    setErrors(errorMap);

  }, [instances, instanceIds]);

  return {
    statuses,
    loading,
    errors,
    instances: instances.map((instance, index) => ({
      instanceId: instanceIds[index],
      ...instance
    }))
  };
};