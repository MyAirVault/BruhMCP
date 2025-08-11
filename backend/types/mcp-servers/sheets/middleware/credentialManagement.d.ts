/**
 * Check for cached credentials
 * @param {string} instanceId - Instance ID
 * @returns {import('./types.js').CachedCredential|null} Cached credential or null
 */
export function checkCachedCredentials(instanceId: string): import("./types.js").CachedCredential | null;
/**
 * Check if cached credential has valid bearer token
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {boolean} Whether credential has bearer token
 */
export function hasCachedBearerToken(cachedCredential: import("./types.js").CachedCredential | null): boolean;
/**
 * Get token information from instance and cache
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {import('./types.js').TokenInfo} Token information
 */
export function getTokenInfo(instance: import("./types.js").DatabaseInstance, cachedCredential: import("./types.js").CachedCredential | null): import("./types.js").TokenInfo;
/**
 * Check if access token is valid
 * @param {string|undefined} accessToken - Access token
 * @param {number|null} tokenExpiresAt - Token expiration timestamp
 * @returns {boolean} Whether token is valid
 */
export function isAccessTokenValid(accessToken: string | undefined, tokenExpiresAt: number | null): boolean;
/**
 * Setup lightweight request (without OAuth)
 * @param {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} req - Express request
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 */
export function setupLightweightRequest(req: import("express").Request & {
    bearerToken?: string;
    instanceId?: string;
    userId?: string;
    oauth?: Object;
}, instanceId: string, userId: string): void;
/**
 * Setup request with cached token
 * @param {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} req - Express request
 * @param {import('./types.js').CachedCredential} cachedCredential - Cached credential
 * @param {string} instanceId - Instance ID
 * @returns {Promise<void>}
 */
export function setupRequestWithCachedToken(req: import("express").Request & {
    bearerToken?: string;
    instanceId?: string;
    userId?: string;
    oauth?: Object;
}, cachedCredential: import("./types.js").CachedCredential, instanceId: string): Promise<void>;
/**
 * Cache token and setup request
 * @param {string} instanceId - Instance ID
 * @param {string} accessToken - Access token
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @param {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} req - Express request
 * @param {string|undefined} refreshToken - Refresh token
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Existing cached credential
 * @returns {Promise<void>}
 */
export function cacheAndSetupToken(instanceId: string, accessToken: string, tokenExpiresAt: number, userId: string, req: import("express").Request & {
    bearerToken?: string;
    instanceId?: string;
    userId?: string;
    oauth?: Object;
}, refreshToken: string | undefined, cachedCredential: import("./types.js").CachedCredential | null): Promise<void>;
//# sourceMappingURL=credentialManagement.d.ts.map