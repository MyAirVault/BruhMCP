// @ts-check

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const { Router } = require('express');
const { getMCPTypes } = require('../controllers/mcpTypes/getMCPTypes.js');
const { getMCPTypeByNameHandler } = require('../controllers/mcpTypes/getMCPTypeByName.js');

const router = Router();

// GET /api/v1/mcp-types - List all MCP types
router.get('/', getMCPTypes);

// GET /api/v1/mcp-types/:name - Get specific MCP type by name
router.get('/:name', getMCPTypeByNameHandler);

module.exports = router;
