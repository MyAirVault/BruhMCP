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
 * Force refresh all cached tokens (for testing/maintenance)
 * @returns {Promise<Object>} Refresh results
 */
export function forceRefreshAllTokens(): Promise<Object>;
/**
 * Manually trigger a watcher cycle
 * @returns {Promise<void>}
 */
export function triggerWatcherCycle(): Promise<void>;
/**
 * Reset watcher statistics
 */
export function resetWatcherStats(): void;
//# sourceMappingURL=credential-watcher.d.ts.map