// @ts-check

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

import { Router } from 'express';
import { getAPIKeys } from '../controllers/apiKeys/getAPIKeys.js';
import { storeAPIKeyHandler } from '../controllers/apiKeys/storeAPIKey.js';
import { deleteAPIKeyHandler } from '../controllers/apiKeys/deleteAPIKey.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All API key routes require authentication
router.use(requireAuth);

// GET /api/v1/api-keys - Get user's API keys
router.get('/', getAPIKeys);

// POST /api/v1/api-keys - Store API key
router.post('/', storeAPIKeyHandler);

// DELETE /api/v1/api-keys/:id - Delete API key
router.delete('/:id', deleteAPIKeyHandler);

export default router;
