// @ts-check
import { Router } from 'express';
import { 
  requestToken, 
  verifyToken
} from '../controllers/authController.js';
import { authRateLimiter } from '../utils/rateLimiter.js';

const router = Router();

/**
 * @swagger
 * /auth/request:
 *   post:
 *     summary: Request authentication token
 *     description: Generate authentication token for email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Token generated successfully
 *       400:
 *         description: Invalid request parameters
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/request', authRateLimiter, requestToken);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify authentication token
 *     description: Verify token and create session
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid token format
 *       401:
 *         description: Token not found or expired
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/verify', authRateLimiter, verifyToken);

export default router;