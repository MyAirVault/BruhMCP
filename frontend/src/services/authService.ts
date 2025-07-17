// Authentication API Response Types
interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
  };
}

interface AuthErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

interface MagicLinkResponse {
  success: boolean;
  message: string;
  email: string;
  token?: string; // Only in development
}

// OAuth-specific types
interface OAuthErrorResponse {
  error: string;
  errorCode?: string;
  requiresReauth?: boolean;
  instanceId?: string;
  shouldRetry?: boolean;
}

interface ReAuthResponse {
  authorizationUrl: string;
  instanceId: string;
  message: string;
}

// OAuth error types
export const OAUTH_ERROR_CODES = {
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_CLIENT: 'INVALID_CLIENT',
  OAUTH_FLOW_REQUIRED: 'OAUTH_FLOW_REQUIRED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

export type OAuthErrorCode = typeof OAUTH_ERROR_CODES[keyof typeof OAUTH_ERROR_CODES];

// Authentication service functions
export const requestMagicLink = async (email: string): Promise<MagicLinkResponse> => {
  try {
    const response = await fetch('/auth/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as AuthErrorResponse;
      throw new Error(errorData.error?.message || 'Failed to send magic link');
    }

    return data as MagicLinkResponse;
  } catch (error) {
    console.error('Magic link request failed:', error);
    throw error;
  }
};

export const verifyToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch('/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as AuthErrorResponse;
      throw new Error(errorData.error?.message || 'Token verification failed');
    }

    return data as AuthResponse;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const response = await fetch('/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as AuthErrorResponse;
      throw new Error(errorData.error?.message || 'Failed to get current user');
    }

    return data as AuthResponse;
  } catch (error) {
    console.error('Get current user failed:', error);
    throw error;
  }
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// OAuth-specific functions

/**
 * Check if an error response indicates OAuth re-authentication is required
 */
export const isOAuthReauthRequired = (error: any): boolean => {
  if (!error) return false;

  return (
    error.status === 401 ||
    error.requiresReauth === true ||
    error.errorCode === OAUTH_ERROR_CODES.INVALID_REFRESH_TOKEN ||
    error.errorCode === OAUTH_ERROR_CODES.OAUTH_FLOW_REQUIRED ||
    (error.message && error.message.includes('re-authenticate'))
  );
};

/**
 * Parse OAuth error from API response
 */
export const parseOAuthError = (error: any): OAuthErrorResponse | null => {
  if (!error) return null;

  // Handle different error formats
  if (error.response?.data) {
    // Axios-style error
    const data = error.response.data;
    return {
      error: data.error || data.message || 'OAuth error occurred',
      errorCode: data.errorCode,
      requiresReauth: data.requiresReauth,
      instanceId: data.instanceId,
      shouldRetry: data.shouldRetry
    };
  } else if (error.error || error.errorCode) {
    // Direct error object
    return {
      error: error.error || error.message || 'OAuth error occurred',
      errorCode: error.errorCode,
      requiresReauth: error.requiresReauth,
      instanceId: error.instanceId,
      shouldRetry: error.shouldRetry
    };
  } else if (error.message) {
    // Generic error with message
    return {
      error: error.message,
      errorCode: undefined,
      requiresReauth: isOAuthReauthRequired(error),
      instanceId: undefined,
      shouldRetry: false
    };
  }

  return null;
};

/**
 * Handle OAuth error with appropriate action
 */
export const handleOAuthError = (
  error: any,
  onReauthRequired?: (instanceId: string, errorMessage: string) => void,
  onRetryableError?: (error: OAuthErrorResponse) => void
): boolean => {
  const oauthError = parseOAuthError(error);
  
  if (!oauthError) {
    return false; // Not an OAuth error
  }

  console.warn('OAuth error detected:', oauthError);

  if (oauthError.requiresReauth && oauthError.instanceId && onReauthRequired) {
    onReauthRequired(oauthError.instanceId, oauthError.error);
    return true;
  }

  if (oauthError.shouldRetry && onRetryableError) {
    onRetryableError(oauthError);
    return true;
  }

  return true; // Was an OAuth error, even if no specific action taken
};

/**
 * Start re-authentication flow for an instance
 */
export const startReAuthentication = async (instanceId: string, provider?: string): Promise<ReAuthResponse> => {
  try {
    // Use a generic reauth endpoint that works for all OAuth providers
    const endpoint = provider ? `/api/${provider}/${instanceId}/reauth` : `/api/v1/mcps/${instanceId}/reauth`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to start re-authentication');
    }

    const data = await response.json();
    
    if (!data.authorizationUrl) {
      throw new Error('No authorization URL received from server');
    }

    return {
      authorizationUrl: data.authorizationUrl,
      instanceId: data.instanceId || instanceId,
      message: data.message || 'Re-authentication flow initiated'
    };

  } catch (error) {
    console.error('Failed to start re-authentication:', error);
    throw error;
  }
};

/**
 * Enhanced fetch wrapper that handles OAuth errors automatically
 */
export const fetchWithOAuthHandling = async (
  url: string,
  options: RequestInit = {},
  onReauthRequired?: (instanceId: string, errorMessage: string) => void
): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // If response is OK, return it
    if (response.ok) {
      return response;
    }

    // Try to parse error response
    const errorData = await response.json().catch(() => ({}));
    
    // Check if it's an OAuth error requiring re-authentication
    if (handleOAuthError(errorData, onReauthRequired)) {
      // OAuth error was handled, throw with OAuth context
      const error = new Error(errorData.error || 'OAuth authentication required');
      Object.assign(error, errorData);
      throw error;
    }

    // Not an OAuth error, throw generic error
    const error = new Error(errorData.error || errorData.message || `Request failed: ${response.status}`);
    Object.assign(error, { status: response.status, ...errorData });
    throw error;

  } catch (error) {
    // Re-throw with additional context if not already handled
    throw error;
  }
};

/**
 * Create a custom hook for API calls with OAuth handling
 */
export const createOAuthAwareRequest = (
  onReauthRequired?: (instanceId: string, errorMessage: string) => void
) => {
  return {
    get: (url: string, options?: RequestInit) =>
      fetchWithOAuthHandling(url, { ...options, method: 'GET' }, onReauthRequired),
    
    post: (url: string, data?: any, options?: RequestInit) =>
      fetchWithOAuthHandling(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      }, onReauthRequired),
    
    put: (url: string, data?: any, options?: RequestInit) =>
      fetchWithOAuthHandling(url, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      }, onReauthRequired),
    
    delete: (url: string, options?: RequestInit) =>
      fetchWithOAuthHandling(url, { ...options, method: 'DELETE' }, onReauthRequired),
  };
};

/**
 * Utility to check if current user session is valid
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const response = await fetch('/auth/validate', {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};