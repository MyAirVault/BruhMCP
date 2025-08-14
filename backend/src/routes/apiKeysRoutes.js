// @ts-check

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const { Router } = require('express');
const { getAPIKeys } = require('../controllers/apiKeys/getAPIKeys.js');
const { storeAPIKeyHandler } = require('../controllers/apiKeys/storeAPIKey.js');
const { deleteAPIKeyHandler } = require('../controllers/apiKeys/deleteAPIKey.js');
const { authenticate } = require('../middleware/auth.js');

const router = Router();

// All API key routes require authentication
router.use(authenticate);

// GET /api/v1/api-keys - Get user's API keys
router.get('/', getAPIKeys);

// POST /api/v1/api-keys - Store API key
router.post('/', storeAPIKeyHandler);

// DELETE /api/v1/api-keys/:id - Delete API key
router.delete('/:id', deleteAPIKeyHandler);

module.exports = router;
