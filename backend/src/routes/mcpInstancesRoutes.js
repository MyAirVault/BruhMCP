import { Router } from 'express';
import { createMCP } from '../controllers/mcpInstances/createMCP.js';
import { getMCPInstances } from '../controllers/mcpInstances/getMCPInstances.js';
import { getMCPInstance } from '../controllers/mcpInstances/getMCPInstance.js';
import { toggleMCP } from '../controllers/mcpInstances/toggleMCP.js';
import { deleteMCP } from '../controllers/mcpInstances/deleteMCP.js';
import { renewMCP } from '../controllers/mcpInstances/renewMCP.js';
import { editMCP } from '../controllers/mcpInstances/editMCP.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All MCP instance routes require authentication
router.use(requireAuth);

// POST /api/v1/mcps - Create new MCP instance
router.post('/', createMCP);

// GET /api/v1/mcps - Get user's MCP instances
router.get('/', getMCPInstances);

// GET /api/v1/mcps/:id - Get specific MCP instance
router.get('/:id', getMCPInstance);

// PUT /api/v1/mcps/:id/renew - Renew MCP instance
router.put('/:id/renew', renewMCP);

// PUT /api/v1/mcps/:id/toggle - Toggle MCP instance active/inactive
router.put('/:id/toggle', toggleMCP);

// PUT /api/v1/mcps/:id/edit - Edit MCP instance details
router.put('/:id/edit', editMCP);

// DELETE /api/v1/mcps/:id - Delete MCP instance
router.delete('/:id', deleteMCP);

export default router;
