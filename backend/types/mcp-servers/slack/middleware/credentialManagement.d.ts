/**
 * Check cached credentials for an instance
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').CachedCredential|undefined} Cached credential object or undefined if not found
 */
export function checkCachedCredentials(instanceId: string): import("./types.js").CachedCredential | undefined;
/**
 * Validate if cached credentials have a valid bearer token
 * @param {import('./types.js').CachedCredential} [cachedCredential] - The cached credential object
 * @returns {cachedCredential is import('./types.js').CachedCredential} True if cached credential has valid bearer token
 */
export function hasCachedBearerToken(cachedCredential?: import("./types.js").CachedCredential): cachedCredential is import("./types.js").CachedCredential;
/**
 * Set up request with cached bearer token and update usage
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {import('./types.js').CachedCredential} cachedCredential - The cached credential object
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export function setupRequestWithCachedToken(req: import("./types.js").ExpressRequest, cachedCredential: import("./types.js").CachedCredential, instanceId: string): Promise<void>;
/**
 * Get token information from cached credentials or database instance
 * @param {import('./types.js').DatabaseInstance} instance - The database instance object
 * @param {import('./types.js').CachedCredential} [cachedCredential] - The cached credential object
 * @returns {import('./types.js').TokenInfo} Object containing token information
 */
export function getTokenInfo(instance: import("./types.js").DatabaseInstance, cachedCredential?: import("./types.js").CachedCredential): import("./types.js").TokenInfo;
/**
 * Check if an access token is still valid
 * @param {string} [accessToken] - The access token
 * @param {number} [tokenExpiresAt] - Token expiration timestamp
 * @returns {boolean} True if token is valid and not expired
 */
export function isAccessTokenValid(accessToken?: string, tokenExpiresAt?: number): boolean;
/**
 * Cache access token if not already cached and set up request
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - The access token
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - Associated user ID
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} [refreshToken] - The refresh token
 * @param {import('./types.js').CachedCredential} [cachedCredential] - Existing cached credential
 * @param {string} [teamId] - Slack team ID
 * @returns {Promise<void>} Promise that resolves when caching and setup is complete
 */
export function cacheAndSetupToken(instanceId: string, accessToken: string, tokenExpiresAt: number, userId: string, req: import("./types.js").ExpressRequest, refreshToken?: string, cachedCredential?: import("./types.js").CachedCredential, teamId?: string): Promise<void>;
/**
 * Cache new tokens after successful refresh
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - The new access token
 * @param {string} refreshToken - The refresh token (new or existing)
 * @param {number} expiresAt - Token expiration timestamp
 * @param {string} userId - Associated user ID
 * @param {string} [teamId] - Slack team ID
 * @returns {void}
 */
export function cacheNewTokens(instanceId: string, accessToken: string, refreshToken: string, expiresAt: number, userId: string, teamId?: string): void;
/**
 * Set up request with new tokens after refresh
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} accessToken - The new access token
 * @param {string} instanceId - The instance ID
 * @param {string} userId - Associated user ID
 * @param {string} [teamId] - Slack team ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export function setupRequestWithNewTokens(req: import("./types.js").ExpressRequest, accessToken: string, instanceId: string, userId: string, teamId?: string): Promise<void>;
/**
 * Set up lightweight request for non-critical endpoints
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} instanceId - The instance ID
 * @param {string} userId - Associated user ID
 * @param {string} [teamId] - Slack team ID
 * @returns {void}
 */
export function setupLightweightRequest(req: import("./types.js").ExpressRequest, instanceId: string, userId: string, teamId?: string): void;
//# sourceMappingURL=credentialManagement.d.ts.map