/**
 * Checks for cached credentials
 * @param {string} instanceId - Instance ID
 * @returns {import('./types.js').CachedCredential|null} Cached credential or null
 */
export function checkCachedCredentials(instanceId: string): import("./types.js").CachedCredential | null;
/**
 * Checks if cached credential has a bearer token
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {boolean} Whether bearer token exists
 */
export function hasCachedBearerToken(cachedCredential: import("./types.js").CachedCredential | null): boolean;
/**
 * Sets up request with cached token
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @param {import('./types.js').CachedCredential} cachedCredential - Cached credential
 * @param {string} instanceId - Instance ID
 * @returns {Promise<void>}
 */
export function setupRequestWithCachedToken(req: import("./types.js").ExpressRequest, cachedCredential: import("./types.js").CachedCredential, instanceId: string): Promise<void>;
/**
 * Gets token information from instance or cache
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {{refreshToken: string|undefined, accessToken: string|undefined, tokenExpiresAt: number|undefined}}
 */
export function getTokenInfo(instance: import("./types.js").DatabaseInstance, cachedCredential: import("./types.js").CachedCredential | null): {
    refreshToken: string | undefined;
    accessToken: string | undefined;
    tokenExpiresAt: number | undefined;
};
/**
 * Checks if access token is still valid
 * @param {string|undefined} accessToken - Access token
 * @param {number|undefined} tokenExpiresAt - Token expiration timestamp
 * @returns {boolean} Whether token is valid
 */
export function isAccessTokenValid(accessToken: string | undefined, tokenExpiresAt: number | undefined): boolean;
/**
 * Caches token and sets up request
 * @param {string} instanceId - Instance ID
 * @param {string} accessToken - Access token
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @param {string|undefined} refreshToken - Refresh token
 * @param {import('./types.js').CachedCredential|null} existingCache - Existing cache
 * @returns {Promise<void>}
 */
export function cacheAndSetupToken(instanceId: string, accessToken: string, tokenExpiresAt: number, userId: string, req: import("./types.js").ExpressRequest, refreshToken: string | undefined, existingCache: import("./types.js").CachedCredential | null): Promise<void>;
/**
 * Sets up request for lightweight authentication (no token needed)
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {void}
 */
export function setupLightweightRequest(req: import("./types.js").ExpressRequest, instanceId: string, userId: string): void;
//# sourceMappingURL=credentialManagement.d.ts.map