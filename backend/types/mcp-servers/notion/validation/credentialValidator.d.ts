export = createNotionValidator;
/**
 * Notion validator factory
 * @param {OAuthCredentials|NotionBearerTokenCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
declare function createNotionValidator(credentials: OAuthCredentials | NotionBearerTokenCredentials): BaseValidator;
declare namespace createNotionValidator {
    export { OAuthCredentials, NotionOAuthCredentials, NotionBearerTokenCredentials };
}
import { BaseValidator } from "../../../services/validation/baseValidator";
/**
 * Credentials object for OAuth authentication
 */
type OAuthCredentials = {
    /**
     * - Authentication type ('oauth' or 'api_key')
     */
    auth_type: string;
    /**
     * - OAuth client ID (required for oauth)
     */
    client_id?: string | undefined;
    /**
     * - OAuth client secret (required for oauth)
     */
    client_secret?: string | undefined;
    /**
     * - Access token (optional for oauth)
     */
    access_token?: string | undefined;
    /**
     * - Refresh token (optional for oauth)
     */
    refresh_token?: string | undefined;
    /**
     * - API key (required for api_key auth type)
     */
    api_key?: string | undefined;
};
/**
 * OAuth credentials for Notion validator
 */
type NotionOAuthCredentials = {
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
 * Bearer token credentials for Notion validator
 */
type NotionBearerTokenCredentials = {
    /**
     * - Bearer token
     */
    bearer_token?: string | undefined;
    /**
     * - Access token
     */
    access_token?: string | undefined;
    /**
     * - API key
     */
    api_key?: string | undefined;
};
//# sourceMappingURL=credentialValidator.d.ts.map