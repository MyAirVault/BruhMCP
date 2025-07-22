/**
 * Express route handlers for plan monitoring management
 */
/**
 * Get plan monitoring service status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function getPlanMonitoringStatus(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Manually trigger plan expiration agent
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function triggerPlanExpirationAgent(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Update plan monitoring service configuration
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function updatePlanMonitoringConfig(req: import("express").Request, res: import("express").Response): Promise<void>;
export default planMonitoringService;
declare const planMonitoringService: PlanMonitoringService;
/**
 * Plan monitoring service instance
 */
declare class PlanMonitoringService {
    scheduledJob: NodeJS.Timeout | null;
    isRunning: boolean;
    intervalMinutes: number;
    /**
     * Start the plan monitoring service
     * @param {number} intervalMinutes - How often to check for expired plans (default: 60 minutes)
     */
    start(intervalMinutes?: number): void;
    /**
     * Stop the plan monitoring service
     */
    stop(): void;
    /**
     * Restart the plan monitoring service with new interval
     * @param {number} intervalMinutes - New interval in minutes
     */
    restart(intervalMinutes?: number): void;
    /**
     * Run the plan expiration agent manually (one-time execution)
     * @returns {Promise<Object>} Execution result
     */
    runOnce(): Promise<Object>;
    /**
     * Check current status of the monitoring service
     * @returns {Object} Service status information
     */
    getStatus(): Object;
    /**
     * Get summary of users that need processing
     * @returns {Promise<Object>} Summary of expired users
     */
    getExpiredUsersSummary(): Promise<Object>;
}
//# sourceMappingURL=planMonitoringService.d.ts.map