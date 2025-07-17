/**
 * Starts the credential watcher service
 */
export function startCredentialWatcher(): void;
/**
 * Stops the credential watcher service
 */
export function stopCredentialWatcher(): void;
/**
 * Gets watcher statistics
 * @returns {Object} Watcher statistics
 */
export function getWatcherStatistics(): Object;
/**
 * Forces a watcher cycle to run immediately
 */
export function forceWatcherCycle(): Promise<void>;
/**
 * Updates watcher configuration
 * @param {Object} newConfig - New configuration options
 */
export function updateWatcherConfig(newConfig: Object): void;
/**
 * Resets watcher statistics
 */
export function resetWatcherStatistics(): void;
/**
 * Checks if an instance needs immediate refresh
 * @param {string} instanceId - Instance ID to check
 * @returns {Promise<boolean>} True if immediate refresh is needed
 */
export function needsImmediateRefresh(instanceId: string): Promise<boolean>;
/**
 * Manually triggers refresh for a specific instance
 * @param {string} instanceId - Instance ID to refresh
 * @returns {Promise<boolean>} True if refresh was successful
 */
export function refreshInstanceToken(instanceId: string): Promise<boolean>;
/**
 * Gets health status of the credential watcher
 * @returns {Object} Health status
 */
export function getWatcherHealth(): Object;
//# sourceMappingURL=credential-watcher.d.ts.map