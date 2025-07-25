// @ts-check

/**
 * Local Development Mode Configuration
 * @fileoverview Environment detection and configuration for local development features
 */

/**
 * Check if application is running in local development mode
 * @returns {boolean}
 */
export const isLocalMode = () => {
    return process.env.LOCAL_DEV === 'true';
};

/**
 * Get default local development user email
 * @returns {string}
 */
export const getDefaultLocalUserEmail = () => {
    return process.env.LOCAL_USER_EMAIL || 'dev@localhost.com';
};

/**
 * Check if SMTP should be disabled in local mode
 * @returns {boolean}
 */
export const isSmtpDisabled = () => {
    return isLocalMode();
};

/**
 * Get local mode configuration object
 * @returns {Object}
 */
export const getLocalModeConfig = () => {
    return {
        isLocalMode: isLocalMode(),
        smtpDisabled: isSmtpDisabled(),
        defaultUserEmail: getDefaultLocalUserEmail(),
        authMethod: isLocalMode() ? 'email_password' : 'magic_link'
    };
};