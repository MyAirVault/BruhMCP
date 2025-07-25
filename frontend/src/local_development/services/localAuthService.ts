/**
 * Local Development Authentication Service
 * @fileoverview Service for handling local development authentication
 */

export interface LocalLoginRequest {
    email: string;
    password: string;
}

export interface LocalLoginResponse {
    success: boolean;
    message: string;
    user?: {
        id: number;
        email: string;
    };
    isNewUser?: boolean;
    error?: string;
}

export interface TestCredentialsResponse {
    success: boolean;
    message: string;
    user?: {
        id: number;
        email: string;
    };
    error?: string;
}

/**
 * Login or register user in local development mode
 * @param credentials LocalLoginRequest
 * @returns Promise<LocalLoginResponse>
 */
export const localLogin = async (credentials: LocalLoginRequest): Promise<LocalLoginResponse> => {
    try {
        const response = await fetch('/api/local-auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Login failed',
                error: data.error
            };
        }

        return {
            success: true,
            message: data.message,
            user: data.user,
            isNewUser: data.isNewUser
        };
    } catch (error) {
        console.error('Local login error:', error);
        return {
            success: false,
            message: 'Network error occurred',
            error: 'NETWORK_ERROR'
        };
    }
};

/**
 * Test credentials without logging in
 * @param credentials LocalLoginRequest
 * @returns Promise<TestCredentialsResponse>
 */
export const testCredentials = async (credentials: LocalLoginRequest): Promise<TestCredentialsResponse> => {
    try {
        const response = await fetch('/api/local-auth/test-credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Credential test failed',
                error: data.error
            };
        }

        return {
            success: true,
            message: data.message,
            user: data.user
        };
    } catch (error) {
        console.error('Test credentials error:', error);
        return {
            success: false,
            message: 'Network error occurred',
            error: 'NETWORK_ERROR'
        };
    }
};

/**
 * Logout user (reuses existing logout endpoint)
 * @returns Promise<boolean>
 */
export const localLogout = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/local-auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        return response.ok;
    } catch (error) {
        console.error('Local logout error:', error);
        return false;
    }
};