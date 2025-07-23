// @ts-check
import { z } from 'zod';
import { authService } from '../services/authService.js';
import { emailService } from '../services/emailService.js';
import { ErrorResponses, formatZodErrors } from '../utils/errorResponse.js';
import { getUserPlanSummary } from '../utils/planLimits.js';

/**
 * @typedef {import('../types/auth.d.ts').AuthRequestTokenResult} AuthRequestTokenResult
 * @typedef {import('../types/auth.d.ts').AuthVerifyTokenResult} AuthVerifyTokenResult
 */

// Zod validation schemas
const authRequestSchema = z.object({
	email: z.string().email('Invalid email format').min(1, 'Email is required'),
});

const authVerifySchema = z.object({
	token: z.string().uuid('Token must be a valid UUID'),
});

/**
 * Request authentication token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function requestToken(req, res) {
	try {
		// Validate request body
		const validationResult = authRequestSchema.safeParse(req.body);

		if (!validationResult.success) {
			ErrorResponses.validation(res, 'Invalid request parameters', formatZodErrors(validationResult.error));
			return;
		}

		const { email } = validationResult.data;

		// Check email format more strictly
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			ErrorResponses.invalidInput(res, 'Invalid email format');
			return;
		}

		// Request token from auth service
		/** @type {AuthRequestTokenResult} */
		const result = await authService.requestToken(email);

		if (!result.success || !result.token) {
			ErrorResponses.internal(res, 'Failed to generate authentication token');
			return;
		}

		// Send magic link via email
		const emailResult = await emailService.sendMagicLink(email, result.token);

		// Log magic link to console in development mode
		if (process.env.NODE_ENV !== 'production') {
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
			const magicLink = `${frontendUrl}/verify?token=${result.token}`;
			console.log(`\n🔗 Magic link for ${email}: ${magicLink}\n`);
		}

		// Check if email was sent successfully
		if (!emailResult.success) {
			console.error('Failed to send magic link email:', emailResult.error);
			ErrorResponses.internal(res, 'Failed to send magic link email');
			return;
		}

		// Return success response
		/** @type {any} */
		const response = {
			success: true,
			message: 'Magic link sent to your email address.',
			email: email,
		};

		// In development mode, also include the token for testing
		if (process.env.NODE_ENV !== 'production') {
			response.token = result.token;
		}

		res.status(200).json(response);
		return;
	} catch (error) {
		console.error('Error in requestToken:', error);
		ErrorResponses.internal(res, 'An unexpected error occurred');
		return;
	}
}

/**
 * Verify authentication token and create session
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function verifyToken(req, res) {
	try {
		// Validate request body
		const validationResult = authVerifySchema.safeParse(req.body);

		if (!validationResult.success) {
			ErrorResponses.validation(res, 'Invalid request parameters', formatZodErrors(validationResult.error));
			return;
		}

		const { token } = validationResult.data;

		// Verify token with auth service
		/** @type {AuthVerifyTokenResult} */
		const result = await authService.verifyToken(token);

		if (!result.success) {
			if (result.error === 'TOKEN_NOT_FOUND') {
				ErrorResponses.invalidToken(res, 'Authentication token not found');
				return;
			} else if (result.error === 'TOKEN_EXPIRED') {
				ErrorResponses.invalidToken(res, 'Authentication token expired');
				return;
			} else {
				ErrorResponses.invalidInput(res, 'Token verification failed');
				return;
			}
		}

		// Set JWT as HTTP-only cookie
		res.cookie('authToken', result.jwtToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		// Return success response
		res.status(200).json({
			success: true,
			message: 'Authentication successful',
			user: result.user,
		});
		return;
	} catch (error) {
		console.error('Error in verifyToken:', error);
		ErrorResponses.internal(res, 'An unexpected error occurred');
		return;
	}
}

/**
 * Get current user information
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getCurrentUser(req, res) {
	try {
		// User is already available via authenticate middleware
		res.status(200).json({
			success: true,
			user: {
				id: req.user?.id,
				email: req.user?.email,
			},
		});

		return;
	} catch (error) {
		console.error('Error in getCurrentUser:', error);
		ErrorResponses.internal(res, 'An unexpected error occurred');
		return;
	}
}

/**
 * Get current user's plan summary with usage information
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function getUserPlan(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			ErrorResponses.unauthorized(res, 'User authentication required');
			return;
		}

		const planSummary = await getUserPlanSummary(userId);

		res.status(200).json({
			success: true,
			data: planSummary,
		});
		return;
	} catch (error) {
		console.error('Error getting user plan:', error);
		ErrorResponses.internal(res, 'Failed to retrieve plan information');
		return;
	}
}

/**
 * Logout user and clear authentication cookie
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export async function logout(_req, res) {
	try {
		// Clear the authentication cookie
		res.clearCookie('authToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		});

		res.status(200).json({
			success: true,
			message: 'Logged out successfully',
		});
		return;
	} catch (error) {
		console.error('Error in logout:', error);
		ErrorResponses.internal(res, 'An unexpected error occurred');
		return;
	}
}
