/**
 * Get system logs with filtering and pagination
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function getSystemLogs(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
/**
 * Get system health dashboard data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function getSystemLogsDashboard(req: Request, res: Response): Promise<void>;
/**
 * Export system logs
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function exportSystemLogs(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
/**
 * Get log maintenance status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function getLogMaintenanceStatus(req: Request, res: Response): Promise<void>;
/**
 * Trigger manual log maintenance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function triggerLogMaintenance(req: Request, res: Response): Promise<void>;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=systemLogs.d.ts.map