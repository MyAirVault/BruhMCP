// @ts-check

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

import { Router } from 'express';
import { getMCPTypes } from '../controllers/mcpTypes/getMCPTypes.js';
import { getMCPTypeByNameHandler } from '../controllers/mcpTypes/getMCPTypeByName.js';

const router = Router();

// GET /api/v1/mcp-types - List all MCP types
router.get('/', getMCPTypes);

// GET /api/v1/mcp-types/:name - Get specific MCP type by name
router.get('/:name', getMCPTypeByNameHandler);

export default router;
