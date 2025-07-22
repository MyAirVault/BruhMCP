/**
 * Get system logs with filtering and pagination
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function getSystemLogs(req: Request, res: Response): Promise<void>;
/**
 * Get system health dashboard data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function getSystemLogsDashboard(req: Request, res: Response): Promise<void>;
/**
 * Export system logs
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function exportSystemLogs(req: Request, res: Response): Promise<void>;
/**
 * Get log maintenance status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function getLogMaintenanceStatus(req: Request, res: Response): Promise<void>;
/**
 * Trigger manual log maintenance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function triggerLogMaintenance(req: Request, res: Response): Promise<void>;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=systemLogs.d.ts.map