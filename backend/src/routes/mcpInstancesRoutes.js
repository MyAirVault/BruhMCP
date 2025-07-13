import { Router } from 'express';
import { createMCP, validateMCPCredentials } from '../controllers/mcpInstances/crud/createMCP.js';
import { getMCPInstances } from '../controllers/mcpInstances/crud/getMCPInstances.js';
import { getMCPInstance } from '../controllers/mcpInstances/crud/getMCPInstance.js';
import { deleteMCP } from '../controllers/mcpInstances/crud/deleteMCP.js';
import { getMCPLogs } from '../controllers/mcpInstances/logging/getMCPLogs.js';
import { exportMCPLogs } from '../controllers/mcpInstances/logging/exportMCPLogs.js';
// Lifecycle management
import { toggleInstanceStatus } from '../controllers/mcpInstances/lifecycle/toggleInstanceStatus.js';
import { renewInstance } from '../controllers/mcpInstances/lifecycle/renewInstance.js';
// Instance editing
import { updateInstanceName } from '../controllers/mcpInstances/editing/updateInstanceName.js';
import { updateInstanceCredentials, validateInstanceCredentialsOnly } from '../controllers/mcpInstances/editing/updateInstanceCredentials.js';
import { updateInstance } from '../controllers/mcpInstances/editing/updateInstance.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All MCP instance routes require authentication
router.use(requireAuth);

// POST /api/v1/mcps - Create new MCP instance
router.post('/', createMCP);

// POST /api/v1/mcps/validate-credentials - Validate MCP credentials
router.post('/validate-credentials', validateMCPCredentials);

// GET /api/v1/mcps - Get user's MCP instances
router.get('/', getMCPInstances);

// GET /api/v1/mcps/:id - Get specific MCP instance
router.get('/:id', getMCPInstance);


// DELETE /api/v1/mcps/:id - Delete MCP instance
router.delete('/:id', deleteMCP);

// GET /api/v1/mcps/:id/logs - Get MCP instance logs
router.get('/:id/logs', getMCPLogs);

// POST /api/v1/mcps/:id/logs/export - Export MCP instance logs
router.post('/:id/logs/export', exportMCPLogs);

// === New Instance Lifecycle Management Routes ===

// PATCH /api/v1/mcps/:id/status - Toggle instance status (active/inactive)
router.patch('/:id/status', toggleInstanceStatus);

// PATCH /api/v1/mcps/:id/renew - Renew expired instance with new expiration
router.patch('/:id/renew', renewInstance);

// === New Instance Editing Routes ===

// PATCH /api/v1/mcps/:id/name - Update instance custom name only
router.patch('/:id/name', updateInstanceName);

// PATCH /api/v1/mcps/:id/credentials - Update instance credentials with validation
router.patch('/:id/credentials', updateInstanceCredentials);

// POST /api/v1/mcps/:id/credentials/validate - Validate credentials without updating
router.post('/:id/credentials/validate', validateInstanceCredentialsOnly);

// PATCH /api/v1/mcps/:id - Combined update (name and/or credentials)
router.patch('/:id', updateInstance);

export default router;
