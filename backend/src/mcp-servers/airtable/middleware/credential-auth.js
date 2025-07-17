/**
 * Credential-based authentication middleware with caching
 * Phase 2: Token Management and Caching System implementation
 *
 * Primary middleware that checks credential cache first, falls back to database lookup
 */

import { getCachedCredential, setCachedCredential } from '../services/credential-cache.js';
import {
	getInstanceCredentials,
	validateInstanceAccess,
	updateUsageTracking,
	getApiKeyForInstance,
} from '../services/database.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * Create credential authentication middleware with caching
 * This is the new primary middleware that replaces instance-auth for better performance
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} Express middleware function
 */
export function createCredentialAuthMiddleware() {
	return async (req, res, next) => {
		try {
			const { instanceId } = req.params;

			// Validate instance ID format
			if (!instanceId) {
				return res.status(400).json({
					error: 'Instance ID is required',
					message: 'URL must include instance ID: /:instanceId/endpoint',
				});
			}

			// Validate UUID format
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			if (!uuidRegex.test(instanceId)) {
				return res.status(400).json({
					error: 'Invalid instance ID format',
					message: 'Instance ID must be a valid UUID',
				});
			}

			// Step 1: Check credential cache first (fast path)
			const cachedCredential = getCachedCredential(instanceId);

			if (cachedCredential) {
				// Cache hit - use cached credential without database lookup
				req.figmaApiKey = cachedCredential.credential;
				req.instanceId = instanceId;
				req.userId = cachedCredential.user_id;
				req.cacheHit = true;

				// Update usage tracking asynchronously (non-blocking)
				updateUsageTracking(instanceId).catch(error => {
					console.error(`Failed to update usage tracking for cached credential ${instanceId}:`, error);
				});

				return next();
			}

			// Step 2: Cache miss - fall back to database lookup (slow path)
			console.log(`🔍 Cache miss for instance: ${instanceId}, querying database`);

			const instance = await getInstanceCredentials(instanceId);

			// Validate instance access
			const validation = validateInstanceAccess(instance);

			if (!validation.isValid) {
				return res.status(validation.statusCode).json({
					error: validation.error,
					message: 'Instance access denied',
					instanceId: instanceId,
				});
			}

			// Get API key for external service calls
			const apiKey = getApiKeyForInstance(instance);

			// Step 3: Cache the credential for future requests
			setCachedCredential(instanceId, {
				api_key: apiKey,
				expires_at: instance.expires_at,
				user_id: instance.user_id,
			});

			// Attach instance data to request for use in handlers
			req.figmaApiKey = apiKey;
			req.instanceId = instanceId;
			req.userId = instance.user_id;
			req.instance = instance;
			req.cacheHit = false;

			// Update usage tracking asynchronously (non-blocking)
			updateUsageTracking(instanceId).catch(error => {
				console.error(`Failed to update usage tracking for ${instanceId}:`, error);
			});

			next();
		} catch (error) {
			console.error('Credential authentication error:', error);
			return res.status(500).json({
				error: 'Authentication failed',
				message: 'Failed to validate instance credentials',
				instanceId: req.params.instanceId,
			});
		}
	};
}

/**
 * Create middleware for endpoints that require instance validation but not credential caching
 * Used for health checks and discovery endpoints that don't need API keys
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} Express middleware function
 */
export function createLightweightAuthMiddleware() {
	return async (req, res, next) => {
		try {
			const { instanceId } = req.params;

			// For lightweight endpoints, we may still want to extract instanceId
			if (instanceId) {
				// Validate UUID format
				const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				if (!uuidRegex.test(instanceId)) {
					return res.status(400).json({
						error: 'Invalid instance ID format',
						message: 'Instance ID must be a valid UUID',
					});
				}

				// Check cache first for basic validation
				const cachedCredential = getCachedCredential(instanceId);

				if (cachedCredential) {
					req.instanceId = instanceId;
					req.userId = cachedCredential.user_id;
					req.cacheHit = true;
					return next();
				}

				// If not cached, do basic database check without caching the result
				const instance = await getInstanceCredentials(instanceId);
				const validation = validateInstanceAccess(instance);

				if (!validation.isValid) {
					return res.status(validation.statusCode).json({
						error: validation.error,
						message: 'Instance access denied',
						instanceId: instanceId,
					});
				}

				req.instanceId = instanceId;
				req.userId = instance.user_id;
				req.cacheHit = false;
			}

			next();
		} catch (error) {
			console.error('Lightweight authentication error:', error);
			return res.status(500).json({
				error: 'Authentication failed',
				message: 'Failed to validate instance',
				instanceId: req.params.instanceId,
			});
		}
	};
}

/**
 * Create debugging middleware that logs cache performance
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createCachePerformanceMiddleware() {
	return (req, res, next) => {
		const startTime = Date.now();

		// Override res.json to capture response timing
		const originalJson = res.json;
		res.json = function (data) {
			const duration = Date.now() - startTime;
			const cacheStatus = req.cacheHit ? 'HIT' : 'MISS';

			console.log(
				`📊 ${req.method} ${req.originalUrl} - Cache: ${cacheStatus}, Duration: ${duration}ms, Instance: ${req.instanceId || 'N/A'}`
			);

			return originalJson.call(this, data);
		};

		next();
	};
}
