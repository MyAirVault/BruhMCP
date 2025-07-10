// @ts-check
import { z } from 'zod';
import { authService } from '../services/authService.js';

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
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid request parameters',
					details: validationResult.error.errors.map(err => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
			});
		}

		const { email } = validationResult.data;

		// Check email format more strictly
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				error: {
					code: 'INVALID_EMAIL',
					message: 'Invalid email format',
				},
			});
		}

		// Request token from auth service
		const result = await authService.requestToken(email);

		if (!result.success) {
			return res.status(500).json({
				error: {
					code: 'TOKEN_GENERATION_FAILED',
					message: 'Failed to generate authentication token',
				},
			});
		}

		// Log magic link to console
		const magicLink = `http://localhost:${process.env.PORT || 5000}/verify?token=${result.token}`;
		console.log(`\n🔗 Magic link for ${email}: ${magicLink}\n`);

		// Return success response
		const response = {
			success: true,
			message: 'Magic link generated. Check console for link.',
			email: email,
		};

		// In development mode, also include the token for testing
		if (process.env.NODE_ENV !== 'production') {
			response.token = result.token;
		}

		return res.status(200).json(response);
	} catch (error) {
		console.error('Error in requestToken:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'An unexpected error occurred',
			},
		});
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
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid request parameters',
					details: validationResult.error.errors.map(err => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
			});
		}

		const { token } = validationResult.data;

		// Verify token with auth service
		const result = await authService.verifyToken(token);

		if (!result.success) {
			const statusCode = result.error === 'TOKEN_NOT_FOUND' ? 401 : result.error === 'TOKEN_EXPIRED' ? 401 : 400;

			return res.status(statusCode).json({
				error: {
					code: result.error,
					message:
						result.error === 'TOKEN_NOT_FOUND'
							? 'Authentication token not found'
							: result.error === 'TOKEN_EXPIRED'
								? 'Authentication token expired'
								: 'Token verification failed',
				},
			});
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
			user: {
				id: result.user.id,
				email: result.user.email,
			},
		});
	} catch (error) {
		console.error('Error in verifyToken:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'An unexpected error occurred',
			},
		});
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
		return res.status(200).json({
			success: true,
			user: {
				id: req.user.id,
				email: req.user.email,
			},
		});
	} catch (error) {
		console.error('Error in getCurrentUser:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'An unexpected error occurred',
			},
		});
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
		return res.status(500).json({
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'An unexpected error occurred',
			},
		});
	}
}
