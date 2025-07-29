// @ts-check

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const { Router } = require('express');
const { createMCP } = require('../controllers/mcpInstances/crud/createMCP.js');
const { getMCPInstances } = require('../controllers/mcpInstances/crud/getMCPInstances.js');
const { getMCPInstance } = require('../controllers/mcpInstances/crud/getMCPInstance.js');
const { deleteMCP } = require('../controllers/mcpInstances/crud/deleteMCP.js');
const { getMCPLogs } = require('../controllers/mcpInstances/logging/getMCPLogs.js');
const { exportMCPLogs } = require('../controllers/mcpInstances/logging/exportMCPLogs.js');
// Lifecycle management
const { toggleInstanceStatus } = require('../controllers/mcpInstances/lifecycle/toggleInstanceStatus.js');
const { renewInstance } = require('../controllers/mcpInstances/lifecycle/renewInstance.js');
// Instance editing
const { updateInstanceName } = require('../controllers/mcpInstances/editing/updateInstanceName.js');
const {
	updateInstanceCredentials,
	validateInstanceCredentialsOnly,
} = require('../controllers/mcpInstances/editing/updateInstanceCredentials.js');
const { updateInstance } = require('../controllers/mcpInstances/editing/updateInstance.js');
const { requireAuth } = require('../middleware/authMiddleware.js');

const router = Router();

// All MCP instance routes require authentication
router.use(requireAuth);

// POST /api/v1/mcps - Create new MCP instance
router.post('/', createMCP);


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

module.exports = router;
