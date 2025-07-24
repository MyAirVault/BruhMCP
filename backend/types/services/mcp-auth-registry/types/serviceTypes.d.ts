export type ValidationResult = {
    /**
     * - Whether validation succeeded
     */
    success: boolean;
    /**
     * - Human readable message
     */
    message: string;
    /**
     * - Optional additional data
     */
    data?: Object | undefined;
};
export type InstanceResult = {
    /**
     * - Whether instance creation succeeded
     */
    success: boolean;
    /**
     * - Created instance ID
     */
    instanceId?: string | undefined;
    /**
     * - Human readable message
     */
    message: string;
    /**
     * - Optional instance data
     */
    data?: Object | undefined;
};
export type OAuthResult = {
    /**
     * - Whether OAuth initiation succeeded
     */
    success: boolean;
    /**
     * - OAuth authorization URL
     */
    authUrl?: string | undefined;
    /**
     * - OAuth state parameter
     */
    state?: string | undefined;
    /**
     * - Human readable message
     */
    message: string;
};
export type RevokeResult = {
    /**
     * - Whether revocation succeeded
     */
    success: boolean;
    /**
     * - Human readable message
     */
    message: string;
};
export type ServiceType = "apikey" | "oauth" | "hybrid";
/**
 * - Dynamic collection of service functions
 */
export type ServiceFunctions = {
    [x: string]: Function;
};
export type ServiceRegistryEntry = {
    /**
     * - Service authentication type
     */
    type: ServiceType;
    /**
     * - Available service functions
     */
    functions: ServiceFunctions;
    /**
     * - Service directory path
     */
    path: string;
    /**
     * - Whether service is available
     */
    isActive: boolean;
};
export type ServiceRegistryMap = {
    [x: string]: ServiceRegistryEntry;
};
export type CredentialsData = {
    /**
     * - API key for API key services
     */
    apiKey?: string | undefined;
    /**
     * - API token for token-based services
     */
    apiToken?: string | undefined;
    /**
     * - OAuth client ID
     */
    clientId?: string | undefined;
    /**
     * - OAuth client secret
     */
    clientSecret?: string | undefined;
    /**
     * - Additional service-specific data
     */
    additionalData?: Object | undefined;
};
export type InstanceData = {
    /**
     * - Service credentials
     */
    credentials: CredentialsData;
    /**
     * - Custom instance name
     */
    customName?: string | undefined;
    /**
     * - Additional instance metadata
     */
    metadata?: Object | undefined;
};
export type ServiceError = {
    /**
     * - Error code
     */
    code: string;
    /**
     * - Error message
     */
    message: string;
    /**
     * - Service that caused the error
     */
    serviceName?: string | undefined;
    /**
     * - Function that caused the error
     */
    functionName?: string | undefined;
    /**
     * - Original error object
     */
    originalError?: Error | undefined;
};
//# sourceMappingURL=serviceTypes.d.ts.map