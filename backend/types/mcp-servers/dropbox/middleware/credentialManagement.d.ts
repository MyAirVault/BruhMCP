/**
 * Check cached credentials for an instance
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').CachedCredential|undefined} Cached credential object or undefined if not found
 */
export function checkCachedCredentials(instanceId: string): import('./types.js').CachedCredential | undefined;
/**
 * Validate if cached credentials have a valid bearer token
 * @param {import('./types.js').CachedCredential} [cachedCredential] - The cached credential object
 * @returns {cachedCredential is import('./types.js').CachedCredential} True if cached credential has valid bearer token
 */
export function hasCachedBearerToken(cachedCredential?: import("./types.js").CachedCredential | undefined): cachedCredential is import("./types.js").CachedCredential;
/**
 * Set up request with cached bearer token and update usage
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {import('./types.js').CachedCredential} cachedCredential - The cached credential object
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export function setupRequestWithCachedToken(req: import('./types.js').ExpressRequest, cachedCredential: import('./types.js').CachedCredential, instanceId: string): Promise<void>;
/**
 * Get token information from cached credentials or database instance
 * @param {import('./types.js').CachedCredential} [cachedCredential] - Cached credential object
 * @param {import('./types.js').DatabaseInstance} [instance] - Database instance record
 * @returns {{refreshToken: string, expiresAt: number} | undefined} Token information or undefined if not available
 */
export function getTokenInfo(cachedCredential?: import("./types.js").CachedCredential | undefined, instance?: import("./types.js").DatabaseInstance | undefined): {
    refreshToken: string;
    expiresAt: number;
} | undefined;
/**
 * Cache new tokens after successful refresh
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - New access token
 * @param {string} refreshToken - New refresh token
 * @param {number} expiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @returns {void}
 */
export function cacheNewTokens(instanceId: string, accessToken: string, refreshToken: string, expiresAt: number, userId: string): void;
/**
 * Set up request with new tokens after refresh
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} accessToken - New access token
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export function setupRequestWithNewTokens(req: import('./types.js').ExpressRequest, accessToken: string, instanceId: string, userId: string): Promise<void>;
/**
 * Check if token is expired or will expire soon
 * @param {number} expiresAt - Token expiration timestamp
 * @param {number} [bufferMinutes=10] - Minutes before expiry to consider token as expired
 * @returns {boolean} True if token is expired or will expire soon
 */
export function isTokenExpired(expiresAt: number, bufferMinutes?: number | undefined): boolean;
/**
 * Validate instance and user authorization
 * @param {import('./types.js').DatabaseInstance | null} instance - Database instance record
 * @param {string} expectedUserId - Expected user ID
 * @returns {boolean} True if instance exists and belongs to the user
 */
export function validateInstanceOwnership(instance: import('./types.js').DatabaseInstance | null, expectedUserId: string): boolean;
//# sourceMappingURL=credentialManagement.d.ts.map