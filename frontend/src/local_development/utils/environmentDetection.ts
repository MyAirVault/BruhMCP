/**
 * Environment Detection Utilities for Local Development
 * @fileoverview Utilities to detect if the app is running in local development mode
 */

export interface EnvironmentInfo {
    isLocalMode: boolean;
    authMethod: 'email_password' | 'magic_link';
    smtpDisabled: boolean;
    defaultUserEmail?: string;
}

/**
 * Check if the application is running in local development mode
 * @returns Promise<EnvironmentInfo>
 */
export const checkEnvironment = async (): Promise<EnvironmentInfo> => {
    try {
        const response = await fetch('/api/local-auth/environment', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return {
                isLocalMode: true,
                authMethod: 'email_password',
                smtpDisabled: data.smtpDisabled || false,
                defaultUserEmail: data.defaultUserEmail,
                ...data
            };
        }
    } catch (error) {
        // Local auth endpoint not available - must be production
        console.log('Local development mode not detected, using production auth');
    }
    
    // Default to production mode
    return {
        isLocalMode: false,
        authMethod: 'magic_link',
        smtpDisabled: false
    };
};

/**
 * Check if local mode is enabled (cached version)
 * @returns boolean
 */
export const isLocalModeEnabled = (): boolean => {
    // Check if we have LOCAL_DEV indicator set by environment check
    return (window as any).__LOCAL_DEV_MODE__ === true;
};

/**
 * Set local mode indicator (called by environment check)
 * @param enabled boolean
 */
export const setLocalModeIndicator = (enabled: boolean): void => {
    (window as any).__LOCAL_DEV_MODE__ = enabled;
};