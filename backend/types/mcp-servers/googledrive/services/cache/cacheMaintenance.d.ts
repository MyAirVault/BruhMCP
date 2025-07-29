/**
 * Clean up invalid or expired cache entries
 * @param {string} [reason] - Reason for cleanup (for logging)
 * @returns {{total_checked: number, expired_removed: number, invalid_removed: number, stale_removed: number}} Cleanup statistics
 */
export function cleanupInvalidCacheEntries(reason?: string | undefined): {
    total_checked: number;
    expired_removed: number;
    invalid_removed: number;
    stale_removed: number;
};
//# sourceMappingURL=cacheMaintenance.d.ts.map