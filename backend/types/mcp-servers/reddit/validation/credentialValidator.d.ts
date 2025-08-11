export = createRedditValidator;
/**
 * Reddit validator factory - determines which validator to use based on credentials
 * @param {RedditOAuthCredentials | RedditAPIKeyCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Appropriate validator instance
 */
declare function createRedditValidator(credentials: RedditOAuthCredentials | RedditAPIKeyCredentials): BaseValidator;
declare namespace createRedditValidator {
    export { RedditOAuthCredentials, RedditAPIKeyCredentials, RedditServiceInfo, RedditValidationResult };
}
import { BaseValidator } from "../../../services/validation/baseValidator";
type RedditOAuthCredentials = {
    /**
     * - Reddit OAuth client ID
     */
    client_id: string;
    /**
     * - Reddit OAuth client secret
     */
    client_secret: string;
};
type RedditAPIKeyCredentials = {
    /**
     * - Reddit API key
     */
    api_key: string;
};
type RedditServiceInfo = {
    /**
     * - Service name
     */
    service: string;
    /**
     * - Authentication type
     */
    auth_type: string;
    /**
     * - OAuth client ID (for OAuth)
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
     * - Available permissions
     */
    permissions: string[];
};
type RedditValidationResult = {
    /**
     * - Whether credentials are valid
     */
    valid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - Field that caused validation failure
     */
    field?: string | undefined;
};
//# sourceMappingURL=credentialValidator.d.ts.map