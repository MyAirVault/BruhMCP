import { Router } from 'express';
import { 
	getSystemLogs, 
	getSystemLogsDashboard, 
	exportSystemLogs,
	getLogMaintenanceStatus,
	triggerLogMaintenance 
} from '../controllers/admin/systemLogs.js';
import { 
	getPlanMonitoringStatus,
	triggerPlanExpirationAgent,
	updatePlanMonitoringConfig 
} from '../services/planMonitoringService.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(requireAuth);
router.use(requireAdmin);

// === System Logs Management ===

// GET /api/v1/admin/logs/system - Get system logs with filtering
router.get('/logs/system', getSystemLogs);

// GET /api/v1/admin/logs/dashboard - Get system logs dashboard data
router.get('/logs/dashboard', getSystemLogsDashboard);

// POST /api/v1/admin/logs/export - Export system logs
router.post('/logs/export', exportSystemLogs);

// GET /api/v1/admin/logs/maintenance - Get log maintenance status
router.get('/logs/maintenance', getLogMaintenanceStatus);

// POST /api/v1/admin/logs/maintenance/trigger - Trigger manual maintenance
router.post('/logs/maintenance/trigger', triggerLogMaintenance);

// === Plan Monitoring Management ===

// GET /api/v1/admin/plans/monitoring/status - Get plan monitoring service status
router.get('/plans/monitoring/status', getPlanMonitoringStatus);

// POST /api/v1/admin/plans/monitoring/trigger - Manually trigger plan expiration agent
router.post('/plans/monitoring/trigger', triggerPlanExpirationAgent);

// PUT /api/v1/admin/plans/monitoring/config - Update plan monitoring configuration
router.put('/plans/monitoring/config', updatePlanMonitoringConfig);

export default router;