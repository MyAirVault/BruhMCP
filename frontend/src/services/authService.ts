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