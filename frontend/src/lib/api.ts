/**
 * API utility functions for authentication and HTTP requests
 * Uses centralized axios utilities for consistent error handling and type safety
 * 
 * This module provides comprehensive API functionality including:
 * - Authentication operations (login, register, OTP verification)
 * - Error handling with user-friendly messages
 * - Type-safe request/response handling
 * - Automatic token management and refresh
 */

import { axiosGet, axiosPost, axiosPut } from './axios';
import { config } from '../data/env';
import { formatErrorMessage } from './utils';
import type { SubscriptionPlan, UserSubscription, AccountCredit, PaymentStatusResponse } from '../types/subscription';


// API response type definitions

/**
 * Standard login response interface
 * Used for both regular login and signup verification flows
 * Also supports verification required responses
 */
export interface LoginResponse {
    success: boolean;
    message: string;
    code?: string;
    data: {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            isVerified: boolean;
            name?: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    } | {
        email: string;
        requiresVerification: boolean;
        redirectToOTP: boolean;
        step: string;
    };
}

/**
 * User profile response interface
 * Contains detailed user information for profile display
 */
export interface UserProfileResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            isVerified: boolean;
            createdAt: string;
        };
    };
}

/**
 * Generic API response interface for simple operations
 * Used for operations that don't require specific response data structure
 */
export interface GenericApiResponse {
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
}


// Helper functions

/**
 * Get authorization headers for authenticated requests
 * Retrieves JWT token from localStorage and formats it for API requests
 * 
 * @returns {Record<string, string>} Authorization headers object
 */
function getAuthHeaders(): Record<string, string> {
    try {
        const token = localStorage.getItem(config.auth.jwtStorageKey);
        if (token && token.trim()) {
            return {
                'Authorization': `Bearer ${token.trim()}`,
            };
        }
        return {};
        
    } catch (error) {
        console.error('Error retrieving auth headers:', error);
        return {};
    } finally {
        // Debug logging omitted for production
    }
}


// Authentication API operations

/**
 * Authentication API functions with comprehensive error handling
 * Provides all authentication-related operations including signup verification
 */
export const authApi = {
    /**
     * Authenticate user with email and password
     * Validates credentials and returns user data with auth tokens
     * Or returns verification required response
     * 
     * @param {string} email - User email address
     * @param {string} password - User password
     * @returns {Promise<LoginResponse>} Promise resolving to login response with user and tokens or verification required
     * @throws {Error} If credentials are invalid or network error occurs
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axiosPost<LoginResponse>(
                `${config.api.baseUrl}/api/v1/auth/login`,
                { email, password }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Login failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            // Check if it's an axios error with response status from our axios utilities
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Register new user account with email verification
     * Creates unverified account and sends OTP for email verification
     * 
     * @param {string} email - User email address
     * @param {string} password - User password
     * @param {string} firstName - User first name
     * @param {string} lastName - User last name
     * @returns {Promise<{ userId: string; email: string; requiresVerification: boolean; step: string; isExistingUser?: boolean }>} Promise resolving to registration response data
     * @throws {Error} If email already exists or validation fails
     */
    async register(
        email: string, 
        password: string, 
        firstName: string, 
        lastName: string
    ): Promise<{ userId: string; email: string; requiresVerification: boolean; step: string; isExistingUser?: boolean }> {
        try {
            const requestBody = { email, password, firstName, lastName };
            
            const response = await axiosPost<GenericApiResponse & { data: { userId: string; email: string; requiresVerification: boolean; step: string; isExistingUser?: boolean } }>(
                `${config.api.baseUrl}/api/v1/auth/signup`,
                requestBody
            );
            
            if (!response.success || !response.data) {
                console.error('❌ API response indicates failure');
                
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Registration failed');
                (error as any).status = response.status;
                throw error;
            }
            
            const returnData = response.data.data!;
            
            return returnData;
            
        } catch (error) {
            console.error('❌ API register error:', error);
            
            const message = error instanceof Error ? error.message : 'Registration failed';
            // Check if it's an axios error with response status from our axios utilities
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Resend OTP for unverified signup users
     * Allows users who haven't verified their email to receive a new verification code
     * 
     * @param {string} email - User email address to resend OTP to
     * @returns {Promise<GenericApiResponse>} Promise resolving to resend confirmation
     * @throws {Error} If user not found, already verified, or resend fails
     */
    async resendSignupOTP(email: string): Promise<GenericApiResponse> {
        try {
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/v1/auth/signup/resend`,
                { email }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to resend verification code');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to resend verification code';
            // Check if it's an axios error with response status from our axios utilities
            const statusCode = (error as any)?.status || (error as any).response?.status;
            
            // Debug logging omitted for production
            
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Verify signup email with OTP and complete account setup
     * Verifies OTP code, marks account as verified, and automatically logs in user
     * 
     * @param {string} email - User email address to verify
     * @param {string} otp - 6-digit OTP verification code from email
     * @returns {Promise<LoginResponse>} Promise resolving to login response with user and tokens
     * @throws {Error} If OTP is invalid, expired, or verification fails
     */
    async verifySignupOTP(email: string, otp: string): Promise<LoginResponse> {
        try {
            const response = await axiosPost<LoginResponse>(
                `${config.api.baseUrl}/api/v1/auth/signup/verify`,
                { email, otp }
            );
            
            if (!response.success) {
                // Extract specific error message from backend response
                let errorMessage = 'Email verification failed';
                
                // Priority order: backend message > error message > generic fallback
                if (response.data && typeof response.data === 'object' && 'message' in response.data) {
                    errorMessage = String(response.data.message);
                } else if (response.error instanceof Error) {
                    errorMessage = response.error.message;
                } else if (typeof response.error === 'string' && response.error.trim()) {
                    errorMessage = response.error.trim();
                }
                
                const error = new Error(errorMessage);
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!;
            
        } catch (error) {
            // Preserve backend error messages for better user experience
            let message = 'Invalid verification code. Please try again.';
            
            if (error instanceof Error && error.message.trim()) {
                message = error.message;
            } else if (typeof error === 'string' && error.trim()) {
                message = error.trim();
            }
            
            // Only format generic network errors, preserve specific backend messages
            if (message.includes('Request failed with status code') || 
                message.includes('Network Error') || 
                message.includes('timeout') ||
                message.includes('fetch')) {
                message = formatErrorMessage(error);
            }
            
            throw new Error(message);
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Send OTP verification code to user email
     * Triggers OTP generation and email delivery for login verification
     * 
     * @param {string} email - User email address to send OTP to
     * @returns {Promise<{ message: string }>} Promise resolving to success message
     * @throws {Error} If email is invalid or OTP sending fails
     */
    async sendOTP(email: string): Promise<{ message: string }> {
        try {
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/v1/auth/send-otp`,
                { email }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to send OTP');
                (error as any).status = response.status;
                throw error;
            }
            
            return { message: response.data!.message };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send OTP';
            // Check if it's an axios error with response status from our axios utilities
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Verify OTP code and complete login process
     * Validates OTP and logs in user with authentication tokens
     * 
     * @param {string} email - User email address
     * @param {string} otp - 6-digit OTP verification code
     * @returns {Promise<LoginResponse>} Promise resolving to login response with user and tokens
     * @throws {Error} If OTP is invalid, expired, or verification fails
     */
    async verifyOTP(email: string, otp: string): Promise<LoginResponse> {
        try {
            const response = await axiosPost<LoginResponse>(
                `${config.api.baseUrl}/api/v1/auth/verify-otp`,
                { email, otp }
            );
            
            if (!response.success) {
                // For failed API responses, try to extract the backend message first
                let errorMessage = 'OTP verification failed';
                
                // Check if we have backend response data with message
                if (response.data && typeof response.data === 'object' && 'message' in response.data) {
                    errorMessage = response.data.message as string;
                } else if (response.error instanceof Error) {
                    errorMessage = response.error.message;
                } else if (typeof response.error === 'string') {
                    errorMessage = response.error;
                }
                
                const error = new Error(errorMessage);
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!;
            
        } catch (error) {
            // Preserve specific backend error messages for OTP verification
            let message = 'Invalid verification code. Please try again.';
            
            if (error instanceof Error && error.message.trim()) {
                message = error.message;
            } else if (typeof error === 'string' && error.trim()) {
                message = error.trim();
            }
            
            // Only format generic network errors, preserve backend validation messages
            if (message.includes('Request failed with status code') || 
                message.includes('Network Error') || 
                message.includes('timeout') ||
                message.includes('fetch')) {
                message = formatErrorMessage(error);
            }
            
            throw new Error(message);
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Request password reset via email
     * Sends password reset instructions to user email
     * 
     * @param {string} email - User email address for password reset
     * @returns {Promise<{ message: string }>} Promise resolving to success message
     * @throws {Error} If email is invalid or reset request fails
     */
    async resetPassword(email: string): Promise<{ message: string }> {
        try {
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/v1/auth/forgot-password`,
                { email }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Password reset request failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return { message: response.data!.message };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send reset link';
            // Check if it's an axios error with response status from our axios utilities
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Get authenticated user profile information
     * Retrieves current user data using stored authentication token
     * 
     * @returns {Promise<UserProfileResponse['data']['user']>} Promise resolving to user profile data
     * @throws {Error} If user is not authenticated or profile retrieval fails
     */
    async getProfile(): Promise<UserProfileResponse['data']['user']> {
        try {
            const response = await axiosGet<UserProfileResponse>(
                `${config.api.baseUrl}/api/v1/auth/profile`,
                { headers: getAuthHeaders() }
            );
            
            // X-Clear-Auth header is now handled globally by axios interceptor
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to get profile');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data.user;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get profile';
            // Check if it's an axios error with response status from our axios utilities
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Logout user and clear authentication data
     * Invalidates tokens on server and clears local storage
     * 
     * @returns {Promise<{ message: string }>} Promise resolving to logout confirmation
     */
    async logout(): Promise<{ message: string }> {
        try {
            const refreshToken = localStorage.getItem(config.auth.refreshTokenStorageKey);
            
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/v1/auth/logout`,
                { refreshToken },
                { headers: getAuthHeaders() }
            );
            
            // Always clear local storage even if API call fails
            localStorage.removeItem(config.auth.jwtStorageKey);
            localStorage.removeItem(config.auth.userStorageKey);
            localStorage.removeItem(config.auth.refreshTokenStorageKey);
            
            return { message: response.data?.message || 'Logged out successfully' };
            
        } catch (error) {
            // Always clear local storage even on error
            localStorage.removeItem(config.auth.jwtStorageKey);
            localStorage.removeItem(config.auth.userStorageKey);
            localStorage.removeItem(config.auth.refreshTokenStorageKey);
            
            const message = error instanceof Error ? error.message : 'Logout completed';
            return { message: formatErrorMessage(message) };
            
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Refresh authentication tokens
     * Uses refresh token to obtain new access and refresh tokens
     * 
     * @returns {Promise<{ accessToken: string; refreshToken: string }>} Promise resolving to new token pair
     * @throws {Error} If refresh token is invalid or refresh fails
     */
    async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const refreshToken = localStorage.getItem(config.auth.refreshTokenStorageKey);
            
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            
            const response = await axiosPost<{
                success: boolean;
                data: {
                    tokens: {
                        accessToken: string;
                        refreshToken: string;
                    };
                };
            }>(
                `${config.api.baseUrl}/api/v1/auth/refresh`,
                { refreshToken }
            );
            
            // X-Clear-Auth header is now handled globally by axios interceptor
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Token refresh failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data.tokens;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Token refresh failed';
            // Check if it's an axios error with response status from our axios utilities
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Request password reset via email
     * Sends password reset OTP to user's email address
     * 
     * @param {string} email - User email address for password reset
     * @returns {Promise<{ message: string }>} Promise resolving to success message
     * @throws {Error} If email is invalid or reset request fails
     */
    async requestPasswordReset(email: string): Promise<{ message: string }> {
        try {
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/v1/settings/forgot-password`,
                { email }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Password reset request failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return { message: response.data!.message };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send password reset';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Complete password reset with OTP and new password
     * Verifies OTP and sets new password for user account
     * 
     * @param {string} email - User email address
     * @param {string} otp - OTP verification code
     * @param {string} newPassword - New password to set
     * @returns {Promise<{ message: string }>} Promise resolving to success message
     * @throws {Error} If OTP is invalid or password reset fails
     */
    async completePasswordReset(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
        try {
            // Send direct fields - let backend handle all security validation
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/v1/settings/reset-password`,
                { email, otp, newPassword }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Password reset failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return { message: response.data!.message };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset password';
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Request email change with current password verification
     * Initiates email change process by sending OTP to new email
     * 
     * @param {string} newEmail - New email address
     * @param {string} currentPassword - Current account password for verification
     * @returns {Promise<{ message: string }>} Promise resolving to success message
     * @throws {Error} If password is invalid or email change request fails
     */
    async requestEmailChange(newEmail: string, currentPassword: string): Promise<{ message: string }> {
        try {
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/v1/settings/change-email`,
                { newEmail, currentPassword },
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Email change request failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return { message: response.data!.message };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to request email change';
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Verify email change with OTP
     * Completes email change process by verifying OTP sent to new email
     * 
     * @param {string} newEmail - New email address to verify
     * @param {string} otp - OTP verification code
     * @returns {Promise<{ message: string; user: User }>} Promise resolving to success message and updated user
     * @throws {Error} If OTP is invalid or email change verification fails
     */
    async verifyEmailChange(newEmail: string, otp: string): Promise<{ message: string; user: UserProfileResponse['data']['user'] }> {
        try {
            const response = await axiosPost<{
                success: boolean;
                message: string;
                user: UserProfileResponse['data']['user'];
            }>(
                `${config.api.baseUrl}/api/v1/settings/verify-email-change`,
                { email: newEmail, otp },
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Email change verification failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return {
                message: response.data!.message,
                user: response.data!.user
            };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to verify email change';
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Update user profile information
     * Updates user's name and other profile details
     * 
     * @param {Object} profileData - Profile data to update
     * @param {string} profileData.firstName - User's first name
     * @param {string} profileData.lastName - User's last name
     * @returns {Promise<{ message: string; user: User }>} Promise resolving to success message and updated user
     * @throws {Error} If update fails or validation errors occur
     */
    async updateProfile(profileData: { firstName: string; lastName: string }): Promise<{ message: string; user: UserProfileResponse['data']['user'] }> {
        try {
            const response = await axiosPut<{
                success: boolean;
                message: string;
                data: {
                    message: string;
                    user: UserProfileResponse['data']['user'];
                };
            }>(
                `${config.api.baseUrl}/api/v1/settings/profile`,
                profileData,
                { 
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Profile update failed');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },
};


// Subscription API operations

/**
 * Subscription API response interfaces
 */
interface SubscriptionPlansResponse {
    success: boolean;
    message: string;
    data: {
        plans: SubscriptionPlan[];
    };
}

interface UserSubscriptionResponse {
    success: boolean;
    message: string;
    data: {
        subscription: UserSubscription | null;
        currentPlan?: {
            plan_code: string;
            name: string;
            description: string;
            features: string[];
            limits: Record<string, any>;
            price_monthly: number;
            trial_days: number;
        };
        isActive?: boolean;
        isTrialActive?: boolean;
    };
}

interface CreateSubscriptionResponse {
    success: boolean;
    message: string;
    data: {
        subscriptionId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
    };
}

interface UpdateSubscriptionResponse {
    success: boolean;
    message: string;
    data: {
        subscriptionId: string;
        currentPlan: string;
        newPlan: string;
        requiresPayment: boolean;
        subscription?: UserSubscription;
        billing?: {
            immediateCharge?: boolean;
            chargeAmount?: number;
            chargeDescription?: string;
            creditAmount?: number;
            creditDescription?: string;
            nextBillingAmount?: number;
            nextBillingDate?: string;
        };
        proration?: {
            daysRemaining: number;
            dailyRate: number;
            proratedAmount: number;
            isUpgrade: boolean;
            isDowngrade: boolean;
            requiresPayment: boolean;
            creditAmount: number;
        };
    };
}

interface SubscriptionHistoryResponse {
    success: boolean;
    message: string;
    data: {
        transactions: Array<{
            id: string;
            amount: number;
            status: string;
            method: string;
            created_at: string;
            plan_name: string;
            amount_formatted: string;
        }>;
        pagination: {
            currentPage: number;
            totalPages: number;
            totalRecords: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    };
}




interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    data: {
        subscriptionId: string;
        paymentId: string;
        paymentStatus: string;
        subscriptionStatus: string;
        planCode: string;
        planName: string;
        amount: number;
        currency: string;
    };
}

/**
 * Subscription API functions for managing user subscriptions and billing
 * Provides subscription plan management and Razorpay integration
 */
export const subscriptionApi = {
    /**
     * Get user credits
     * @returns {Promise<AccountCredit[]>} Promise resolving to array of account credits
     */
    async getCredits(): Promise<AccountCredit[]> {
        try {
            const response = await axiosGet<{
                success: boolean;
                data: { credits: AccountCredit[] };
            }>(
                `${config.api.baseUrl}/api/subscriptions/credits`,
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to get credits');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data.credits;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get credits';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        }
    },

    /**
     * Apply credits to account
     * @param {number} amount - Amount of credits to apply
     * @returns {Promise<{ message: string }>} Promise resolving to success message
     */
    async applyCredits(amount: number): Promise<{ message: string }> {
        try {
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/subscriptions/apply-credits`,
                { amount },
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to apply credits');
                (error as any).status = response.status;
                throw error;
            }
            
            return { message: response.data!.message };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to apply credits';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        }
    },
    /**
     * Get all available subscription plans
     * Retrieves active subscription plans with pricing and features
     * 
     * @returns {Promise<SubscriptionPlan[]>} Promise resolving to array of subscription plans
     * @throws {Error} If plans retrieval fails
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        try {
            const response = await axiosGet<SubscriptionPlansResponse>(
                `${config.api.baseUrl}/api/subscriptions/plans`
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to get subscription plans');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data.plans;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get subscription plans';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Get current user subscription details
     * Retrieves user's active subscription information
     * 
     * @returns {Promise<UserSubscription | null>} Promise resolving to user subscription or null if none
     * @throws {Error} If subscription retrieval fails
     */
    async getCurrentSubscription(): Promise<UserSubscription | null> {
        try {
            const response = await axiosGet<UserSubscriptionResponse>(
                `${config.api.baseUrl}/api/subscriptions/current`,
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to get current subscription');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data.subscription;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get current subscription';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Create new subscription with Razorpay integration
     * Initiates subscription creation and returns Razorpay order details
     * 
     * @param {string} planCode - Plan code (free, pro)
     * @param {string} billingCycle - Billing cycle (monthly, yearly)
     * @returns {Promise<CreateSubscriptionResponse['data']>} Promise resolving to Razorpay order details
     * @throws {Error} If subscription creation fails
     */
    async createSubscription(planCode: string, billingCycle: string = 'monthly'): Promise<CreateSubscriptionResponse['data']> {
        try {
            const response = await axiosPost<CreateSubscriptionResponse>(
                `${config.api.baseUrl}/api/subscriptions/create`,
                { planCode, billingCycle },
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to create subscription');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create subscription';
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Update/upgrade subscription to new plan
     * Changes user's current subscription to a different plan
     * 
     * @param {string | Object} newPlanCodeOrRequest - New plan code (free, pro) or request object
     * @returns {Promise<UpdateSubscriptionResponse['data']>} Promise resolving to upgrade details
     * @throws {Error} If subscription upgrade fails
     */
    async updateSubscription(newPlanCodeOrRequest: string | { planId?: number; planCode?: string; [key: string]: any }): Promise<UpdateSubscriptionResponse['data']> {
        try {
            let requestBody: any;
            
            if (typeof newPlanCodeOrRequest === 'string') {
                requestBody = { newPlanCode: newPlanCodeOrRequest };
            } else {
                // Handle object request with planId or planCode
                const { planId, planCode, ...rest } = newPlanCodeOrRequest;
                requestBody = {
                    newPlanCode: planCode,
                    planId,
                    ...rest
                };
            }
            
            const response = await axiosPost<UpdateSubscriptionResponse>(
                `${config.api.baseUrl}/api/subscriptions/upgrade`,
                requestBody,
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to upgrade subscription');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upgrade subscription';
            const statusCode = (error as any)?.status;
            const validationErrors = (error as any)?.validationErrors;
            throw new Error(formatErrorMessage(message, statusCode, validationErrors));
        } finally {
            // Debug logging onmitted for production
        }
    },

    /**
     * Get subscription transaction history
     * Retrieves user's subscription payment history with pagination
     * 
     * @param {Object} options - Query options for filtering and pagination
     * @param {number} [options.page=1] - Page number
     * @param {number} [options.limit=10] - Items per page
     * @param {string} [options.type] - Transaction type filter
     * @param {string} [options.status] - Transaction status filter
     * @returns {Promise<SubscriptionHistoryResponse['data']>} Promise resolving to transaction history
     * @throws {Error} If history retrieval fails
     */
    async getTransactions(options: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    } = {}): Promise<SubscriptionHistoryResponse['data']> {
        try {
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page.toString());
            if (options.limit) params.append('limit', options.limit.toString());
            if (options.type) params.append('type', options.type);
            if (options.status) params.append('status', options.status);
            if (options.dateFrom) params.append('dateFrom', options.dateFrom);
            if (options.dateTo) params.append('dateTo', options.dateTo);

            const response = await axiosGet<SubscriptionHistoryResponse>(
                `${config.api.baseUrl}/api/subscriptions/history?${params.toString()}`,
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to get subscription history');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get subscription history';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Get payment status for subscription polling
     * Retrieves current payment and subscription status for real-time updates
     * 
     * @param {string} subscriptionId - Subscription ID to check status for
     * @returns {Promise<PaymentStatusResponse['data']>} Promise resolving to payment status
     * @throws {Error} If status retrieval fails
     */
    async getPaymentStatus(subscriptionId: string): Promise<PaymentStatusResponse['data']> {
        try {
            const response = await axiosGet<PaymentStatusResponse>(
                `${config.api.baseUrl}/api/v1/subscriptions/${subscriptionId}/payment-status`,
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to get payment status');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get payment status';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Verify Razorpay payment and activate subscription
     * Confirms payment completion and activates the subscription
     * 
     * @param {string} razorpayPaymentId - Razorpay payment ID
     * @param {string} [subscriptionId] - Optional subscription ID for verification
     * @returns {Promise<VerifyPaymentResponse['data']>} Promise resolving to verification result
     * @throws {Error} If payment verification fails
     */
    async verifyPayment(razorpayPaymentId: string, subscriptionId?: string): Promise<VerifyPaymentResponse['data']> {
        try {
            const response = await axiosPost<VerifyPaymentResponse>(
                `${config.api.baseUrl}/api/subscriptions/verify-payment`,
                { 
                    razorpay_payment_id: razorpayPaymentId,
                    subscription_id: subscriptionId
                },
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to verify payment');
                (error as any).status = response.status;
                throw error;
            }
            
            return response.data!.data;
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to verify payment';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },

    /**
     * Cancel active subscription
     * Cancels user's current subscription
     * 
     * @param {Object} [request] - Optional cancellation request details
     * @returns {Promise<{ message: string }>} Promise resolving to cancellation confirmation
     * @throws {Error} If subscription cancellation fails
     */
    async cancelSubscription(request?: any): Promise<{ message: string }> {
        try {
            const response = await axiosPost<GenericApiResponse>(
                `${config.api.baseUrl}/api/subscriptions/cancel`,
                request || {},
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const error = new Error(response.error instanceof Error ? response.error.message : response.error || 'Failed to cancel subscription');
                (error as any).status = response.status;
                throw error;
            }
            
            return { message: response.data!.message };
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
            const statusCode = (error as any)?.status;
            throw new Error(formatErrorMessage(message, statusCode));
        } finally {
            // Debug logging omitted for production
        }
    },


    /**
     * Run subscription cleanup (admin/maintenance operation)
     * @returns {Promise<{ expired: number; cleaned: number; errors: string[] }>} Cleanup results
     */
    async runSubscriptionCleanup(): Promise<{ expired: number; cleaned: number; errors: string[] }> {
        try {
            const response = await axiosPost<{ 
                success: boolean; 
                data: { 
                    expired: number; 
                    cleaned: number; 
                    errors: string[]; 
                }; 
                error?: string 
            }>(
                `${config.api.baseUrl}/api/v1/subscription-cleanup/run`,
                {},
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const errorMessage = response.error || 'Failed to run subscription cleanup';
                throw new Error(typeof errorMessage === 'string' ? errorMessage : errorMessage.message);
            }
            
            return response.data!.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to run subscription cleanup';
            throw new Error(formatErrorMessage(message));
        }
    },

    /**
     * Expire unpaid subscriptions only
     * @returns {Promise<{ expired: number; errors: string[] }>} Expiry results
     */
    async expireUnpaidSubscriptions(): Promise<{ expired: number; errors: string[] }> {
        try {
            const response = await axiosPost<{ 
                success: boolean; 
                data: { 
                    expired: number; 
                    errors: string[]; 
                }; 
                error?: string 
            }>(
                `${config.api.baseUrl}/api/v1/subscription-cleanup/expire-unpaid`,
                {},
                { headers: getAuthHeaders() }
            );
            
            if (!response.success) {
                const errorMessage = response.error || 'Failed to expire unpaid subscriptions';
                throw new Error(typeof errorMessage === 'string' ? errorMessage : errorMessage.message);
            }
            
            return response.data!.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to expire unpaid subscriptions';
            throw new Error(formatErrorMessage(message));
        }
    },

    /**
     * Check subscription cleanup service health
     * @returns {Promise<{ message: string; timestamp: string; timeout_minutes: number }>} Health status
     */
    async getCleanupServiceHealth(): Promise<{ message: string; timestamp: string; timeout_minutes: number }> {
        try {
            const response = await axiosGet<{ 
                success: boolean; 
                message: string; 
                timeout_minutes: number; 
                timestamp: string; 
                error?: string 
            }>(
                `${config.api.baseUrl}/api/v1/subscription-cleanup/health`
            );
            
            if (!response.success) {
                const errorMessage = response.error || 'Failed to get cleanup service health';
                throw new Error(typeof errorMessage === 'string' ? errorMessage : errorMessage.message);
            }
            
            return {
                message: response.data!.message,
                timestamp: response.data!.timestamp,
                timeout_minutes: response.data!.timeout_minutes
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get cleanup service health';
            throw new Error(formatErrorMessage(message));
        }
    },

};