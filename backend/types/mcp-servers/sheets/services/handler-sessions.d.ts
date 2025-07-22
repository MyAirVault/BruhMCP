/**
 * Create a new handler session for an instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} oauth - OAuth configuration object with bearer token
 * @returns {Promise<Object>} Handler session object
 */
export function createHandlerSession(instanceId: string, oauth: Object): Promise<Object>;
/**
 * Get existing handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Handler session or null if not found
 */
export function getHandlerSession(instanceId: string): Object | null;
/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} oauth - OAuth configuration object with bearer token
 * @returns {Promise<Object>} Handler session object
 */
export function getOrCreateHandlerSession(instanceId: string, oauth: Object): Promise<Object>;
/**
 * Remove a specific handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was removed, false if not found
 */
export function removeHandlerSession(instanceId: string): boolean;
/**
 * Get statistics about current handler sessions
 * @returns {Object} Session statistics
 */
export function getSessionStatistics(): Object;
/**
 * Start the session cleanup service
 * Called when the server starts
 */
export function startSessionCleanup(): void;
/**
 * Stop the session cleanup service
 * Called during graceful shutdown
 */
export function stopSessionCleanup(): void;
/**
 * Integration with credential cache invalidation
 * When credentials are invalidated, also remove the handler session
 * @param {string} instanceId - UUID of the service instance
 */
export function invalidateHandlerSession(instanceId: string): void;
/**
 * Update bearer token in existing session
 * Called when OAuth tokens are refreshed
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newBearerToken - New bearer token
 */
export function updateSessionBearerToken(instanceId: string, newBearerToken: string): boolean;
/**
 * Clear all handler sessions (for testing/restart)
 */
export function clearAllSessions(): void;
//# sourceMappingURL=handler-sessions.d.ts.map