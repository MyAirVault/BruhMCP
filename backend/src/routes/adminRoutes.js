import { Router } from 'express';
import { 
	getSystemLogs, 
	getSystemLogsDashboard, 
	exportSystemLogs,
	getLogMaintenanceStatus,
	triggerLogMaintenance 
} from '../controllers/admin/systemLogs.js';
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

export default router;