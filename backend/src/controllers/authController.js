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
			return ErrorResponses.validation(
				res,
				'Invalid request parameters',
				formatZodErrors(validationResult.error)
			);
		}

		const { email } = validationResult.data;

		// Check email format more strictly
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return ErrorResponses.invalidInput(res, 'Invalid email format');
		}

		// Request token from auth service
		/** @type {AuthRequestTokenResult} */
		const result = await authService.requestToken(email);

		if (!result.success || !result.token) {
			return ErrorResponses.internal(res, 'Failed to generate authentication token');
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
			return ErrorResponses.internal(res, 'Failed to send magic link email');
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

		return res.status(200).json(response);
	} catch (error) {
		console.error('Error in requestToken:', error);
		return ErrorResponses.internal(res, 'An unexpected error occurred');
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
			return ErrorResponses.validation(
				res,
				'Invalid request parameters',
				formatZodErrors(validationResult.error)
			);
		}

		const { token } = validationResult.data;

		// Verify token with auth service
		/** @type {AuthVerifyTokenResult} */
		const result = await authService.verifyToken(token);

		if (!result.success) {
			if (result.error === 'TOKEN_NOT_FOUND') {
				return ErrorResponses.invalidToken(res, 'Authentication token not found');
			} else if (result.error === 'TOKEN_EXPIRED') {
				return ErrorResponses.invalidToken(res, 'Authentication token expired');
			} else {
				return ErrorResponses.invalidInput(res, 'Token verification failed');
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
		return res.status(200).json({
			success: true,
			message: 'Authentication successful',
			user: result.user,
		});
	} catch (error) {
		console.error('Error in verifyToken:', error);
		return ErrorResponses.internal(res, 'An unexpected error occurred');
	}
}

/**
 * Get current user information
 * @param {import('express').Request & { user: { id: string; email: string } }} req
 * @param {import('express').Response} res
 */
export async function getCurrentUser(req, res) {
	try {
		// User is already available via authenticate middleware
		return res.status(200).json({
			success: true,
			user: {
				id: req.user.id,
				email: req.user.email,
			},
		});
	} catch (error) {
		console.error('Error in getCurrentUser:', error);
		return ErrorResponses.internal(res, 'An unexpected error occurred');
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
			return ErrorResponses.unauthorized(res, 'User authentication required');
		}

		const planSummary = await getUserPlanSummary(userId);
		
		return res.status(200).json({
			success: true,
			data: planSummary
		});
	} catch (error) {
		console.error('Error getting user plan:', error);
		return ErrorResponses.internal(res, 'Failed to retrieve plan information');
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

		return res.status(200).json({
			success: true,
			message: 'Logged out successfully',
		});
	} catch (error) {
		console.error('Error in logout:', error);
		return ErrorResponses.internal(res, 'An unexpected error occurred');
	}
}
