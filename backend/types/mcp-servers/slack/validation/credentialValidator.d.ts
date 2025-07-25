export default createSlackValidator;
/**
 * Slack OAuth credentials object
 */
export type SlackOAuthCredentials = {
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
};
/**
 * Slack Bot Token credentials object
 */
export type SlackBotTokenCredentials = {
    /**
     * - Slack bot token (starts with xoxb-)
     */
    bot_token: string;
};
/**
 * Slack User Token credentials object
 */
export type SlackUserTokenCredentials = {
    /**
     * - Slack user token (starts with xoxp-)
     */
    user_token: string;
};
/**
 * Slack service information object
 */
export type SlackServiceInfo = {
    /**
     * - Service name
     */
    service: string;
    /**
     * - Authentication type
     */
    auth_type: string;
    /**
     * - OAuth client ID (for OAuth validation)
     */
    client_id?: string | undefined;
    /**
     * - Type of validation performed
     */
    validation_type: string;
    /**
     * - Additional information
     */
    note: string;
    /**
     * - List of required permissions/scopes
     */
    permissions: string[];
};
/**
 * Generic credentials object that could be any of the Slack credential types
 */
export type SlackCredentials = SlackOAuthCredentials | SlackBotTokenCredentials | SlackUserTokenCredentials;
/**
 * Slack validator factory - determines which validator to use based on credentials
 * @param {Object} credentials - Credentials to validate
 * @returns {BaseValidator} Appropriate validator instance
 */
declare function createSlackValidator(credentials: Object): BaseValidator;
import { BaseValidator } from '../../../services/validation/baseValidator.js';
//# sourceMappingURL=credentialValidator.d.ts.map