// @ts-check
import { Router } from 'express';
import { requestToken, verifyToken, getCurrentUser, getUserPlan, logout } from '../controllers/authController.js';
import { authRateLimiter } from '../utils/rateLimiter.js';
import { authenticate } from '../middleware/authMiddleware.js';

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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns current authenticated user's information
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /auth/plan:
 *   get:
 *     summary: Get current user's plan information
 *     description: Returns current authenticated user's plan details and usage
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Plan information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: object
 *                     activeInstances:
 *                       type: number
 *                     maxInstances:
 *                       type: number
 *                     canCreate:
 *                       type: boolean
 *       401:
 *         description: Not authenticated
 */
router.get('/plan', authenticate, getUserPlan);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clear authentication cookie and logout user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Internal server error
 */
router.post('/logout', logout);

export default router;
