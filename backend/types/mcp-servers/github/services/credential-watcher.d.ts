/**
 * Start the credential watcher service
 */
export function startCredentialWatcher(): void;
/**
 * Stop the credential watcher service
 */
export function stopCredentialWatcher(): void;
/**
 * Get watcher status and statistics
 * @returns {Object} Watcher status information
 */
export function getWatcherStatus(): Object;
/**
 * Force refresh a specific instance token
 * @param {string} instanceId - Instance ID to refresh
 * @returns {boolean} True if refresh was successful
 */
export function forceRefreshInstanceToken(instanceId: string): boolean;
/**
 * Manual cleanup of invalid cache entries
 * @returns {number} Number of entries removed
 */
export function manualCleanup(): number;
//# sourceMappingURL=credential-watcher.d.ts.map