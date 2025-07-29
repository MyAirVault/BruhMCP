export = createGoogleDriveValidator;
/**
 * Google Drive validator factory
 * @param {MixedCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
declare function createGoogleDriveValidator(credentials: {
    /**
     * - OAuth Client ID (camelCase)
     */
    clientId?: string | undefined;
    /**
     * - OAuth Client ID (snake_case)
     */
    client_id?: string | undefined;
    /**
     * - OAuth Client Secret (camelCase)
     */
    clientSecret?: string | undefined;
    /**
     * - OAuth Client Secret (snake_case)
     */
    client_secret?: string | undefined;
    /**
     * - OAuth Refresh Token (camelCase)
     */
    refreshToken?: string | undefined;
    /**
     * - OAuth Refresh Token (snake_case)
     */
    refresh_token?: string | undefined;
    /**
     * - OAuth Access Token (camelCase)
     */
    accessToken?: string | undefined;
    /**
     * - OAuth Access Token (snake_case)
     */
    access_token?: string | undefined;
}): BaseValidator;
declare namespace createGoogleDriveValidator {
    export { OAuthCredentials, ValidationResult, TokenValidationResult, InstanceConfig };
}
import { BaseValidator } from "../../../services/validation/baseValidator";
/**
 * OAuth credentials interface
 */
type OAuthCredentials = {
    /**
     * - OAuth Client ID
     */
    clientId: string;
    /**
     * - OAuth Client Secret
     */
    clientSecret: string;
    /**
     * - OAuth Refresh Token (optional)
     */
    refreshToken?: string | undefined;
    /**
     * - OAuth Access Token (optional)
     */
    accessToken?: string | undefined;
};
/**
 * Validation result interface
 */
type ValidationResult = {
    /**
     * - Whether validation passed
     */
    valid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - Success message if validation passed
     */
    message?: string | undefined;
    /**
     * - Additional validation details
     */
    details?: Object | undefined;
};
/**
 * Token validation result interface
 */
type TokenValidationResult = {
    /**
     * - Whether token is valid
     */
    valid: boolean;
    /**
     * - Token validation details
     */
    details?: Object | undefined;
};
/**
 * Instance configuration interface
 */
type InstanceConfig = {
    /**
     * - Instance UUID
     */
    instanceId: string;
    /**
     * - User UUID
     */
    userId: string;
    /**
     * - Service name
     */
    serviceName: string;
    /**
     * - OAuth credentials
     */
    credentials: OAuthCredentials;
};
//# sourceMappingURL=credentialValidator.d.ts.map