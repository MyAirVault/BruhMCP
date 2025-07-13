import loggingService from '../services/logging/loggingService.js';

/**
 * Admin authorization middleware
 * Ensures user has administrative privileges
 */

/**
 * Require admin privileges
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 */
export function requireAdmin(req, res, next) {
	try {
		const user = req.user;
		
		if (!user) {
			loggingService.logSuspiciousActivity('Admin access without authentication', {
				ip: req.ip,
				userAgent: req.get('User-Agent'),
				endpoint: req.originalUrl
			});

			return res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'Authentication required for admin access'
				}
			});
		}

		// Check if user has admin role
		// This assumes user object has an 'is_admin' or 'role' field
		const isAdmin = user.is_admin === true || user.role === 'admin' || user.role === 'administrator';

		if (!isAdmin) {
			loggingService.logSuspiciousActivity('Unauthorized admin access attempt', {
				userId: user.id,
				ip: req.ip,
				userAgent: req.get('User-Agent'),
				endpoint: req.originalUrl,
				severity: 'high'
			});

			return res.status(403).json({
				error: {
					code: 'FORBIDDEN',
					message: 'Administrative privileges required'
				}
			});
		}

		// Log successful admin access
		loggingService.security('info', 'Admin access granted', {
			userId: user.id,
			action: 'admin_access',
			endpoint: req.originalUrl,
			ip: req.ip,
			userAgent: req.get('User-Agent')
		});

		next();

	} catch (error) {
		loggingService.logError(error, {
			operation: 'admin_authorization',
			userId: req.user?.id,
			ip: req.ip,
			critical: true
		});

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Authorization check failed'
			}
		});
	}
}

/**
 * Optional admin check (doesn't block non-admin users)
 * Adds admin status to request object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 */
export function checkAdmin(req, res, next) {
	try {
		const user = req.user;
		
		if (user) {
			const isAdmin = user.is_admin === true || user.role === 'admin' || user.role === 'administrator';
			req.isAdmin = isAdmin;
		} else {
			req.isAdmin = false;
		}

		next();

	} catch (error) {
		req.isAdmin = false;
		next();
	}
}