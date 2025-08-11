/**
 * Check for cached credentials
 * @param {string} instanceId - The instance ID to check
 * @returns {import('./types.js').CachedCredential | null} Cached credential or null
 */
export function checkCachedCredentials(instanceId: string): import("./types.js").CachedCredential | null;
/**
 * Check if cached credential has a valid bearer token
 * @param {import('./types.js').CachedCredential | null} cachedCredential - Cached credential object
 * @returns {boolean} True if has valid bearer token
 */
export function hasCachedBearerToken(cachedCredential: import("./types.js").CachedCredential | null): boolean;
/**
 * Setup request with cached token and update usage
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {import('./types.js').CachedCredential} cachedCredential - Cached credential object
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export function setupRequestWithCachedToken(req: import("./types.js").ExpressRequest, cachedCredential: import("./types.js").CachedCredential, instanceId: string): Promise<void>;
/**
 * Get token information from instance or cached credential
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('./types.js').CachedCredential | null} cachedCredential - Cached credential object
 * @returns {{refreshToken: string | undefined, accessToken: string | undefined, tokenExpiresAt: number | null}} Token information
 */
export function getTokenInfo(instance: import("./types.js").DatabaseInstance, cachedCredential: import("./types.js").CachedCredential | null): {
    refreshToken: string | undefined;
    accessToken: string | undefined;
    tokenExpiresAt: number | null;
};
/**
 * Check if access token is still valid (Notion tokens don't expire)
 * @param {string | undefined} accessToken - Access token to check
 * @param {number | null} tokenExpiresAt - Token expiration timestamp
 * @param {string} serviceName - Service name (defaults to 'notion')
 * @returns {boolean} True if token is valid
 */
export function isAccessTokenValid(accessToken: string | undefined, tokenExpiresAt: number | null, serviceName?: string): boolean;
/**
 * Cache token and setup request
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - Access token to cache
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string | undefined} refreshToken - Refresh token
 * @param {import('./types.js').CachedCredential | null} cachedCredential - Existing cached credential
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export function cacheAndSetupToken(instanceId: string, accessToken: string, tokenExpiresAt: number, userId: string, req: import("./types.js").ExpressRequest, refreshToken: string | undefined, cachedCredential: import("./types.js").CachedCredential | null): Promise<void>;
/**
 * Cache new tokens from refresh operation
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @param {string} userId - User ID
 * @returns {void}
 */
export function cacheNewTokens(instanceId: string, newTokens: import("./types.js").NewTokens, userId: string): void;
/**
 * Setup request with new tokens from refresh
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @param {string} userId - User ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export function setupRequestWithNewTokens(req: import("./types.js").ExpressRequest, instanceId: string, newTokens: import("./types.js").NewTokens, userId: string): Promise<void>;
/**
 * Setup lightweight request for non-critical endpoints
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @returns {void}
 */
export function setupLightweightRequest(req: import("./types.js").ExpressRequest, instanceId: string, userId: string): void;
//# sourceMappingURL=credentialManagement.d.ts.map