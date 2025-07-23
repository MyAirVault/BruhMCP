/**
 * Start the credential watcher background process
 * Runs every 30 seconds to maintain cache health
 */
export function startCredentialWatcher(): void;
/**
 * Stop the credential watcher background process
 */
export function stopCredentialWatcher(): void;
/**
 * Check if credential watcher is running
 * @returns {boolean} True if watcher is active
 */
export function isCredentialWatcherRunning(): boolean;
/**
 * Force immediate cache maintenance check (for testing/manual triggers)
 * @returns {Promise<void>}
 */
export function forceMaintenanceCheck(): Promise<void>;
/**
 * Get watcher status and configuration
 * @returns {Object} Watcher status information
 */
export function getWatcherStatus(): Object;
export type CacheEntry = import("./credential-cache.js").CacheEntry;
export type CacheStatistics = import("./credential-cache.js").CacheStatistics;
//# sourceMappingURL=credential-watcher.d.ts.map