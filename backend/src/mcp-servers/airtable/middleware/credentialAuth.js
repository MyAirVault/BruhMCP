/**
 * Credential-based authentication middleware with caching
 * Phase 2: Token Management and Caching System implementation
 *
 * Primary middleware that checks credential cache first, falls back to database lookup
 */

import { getCachedCredential, setCachedCredential } from '../services/credentialCache.js';
import { validateInstanceAccess, getApiKeyForInstance, updateAirtableUsageTracking, getAirtableInstanceCredentials } from '../services/instanceUtils.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @typedef {Object} CachedCredential
 * @property {string} api_key - API key
 * @property {string} expires_at - Expiration timestamp
 * @property {string} user_id - User ID
 */

/**
 * @typedef {Object} InstanceData
 * @property {string} user_id - User ID
 * @property {string} [expires_at] - Expiration timestamp
 * @property {string} [api_key] - API key
 * @property {string} status - Instance status
 * @property {string} [client_id] - Client ID for OAuth
 * @property {string} [client_secret] - Client secret for OAuth
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {number} [statusCode] - HTTP status code for error
 */

/**
 * @typedef {Request & {airtableApiKey?: string, instanceId?: string, userId?: string, instance?: InstanceData, cacheHit?: boolean}} AuthenticatedRequest
 */

/**
 * @typedef {import('http').IncomingMessage & {headers: Record<string, string | undefined>}} RequestWithHeaders
 */

/**
 * Create credential authentication middleware with caching
 * This is the new primary middleware that replaces instance-auth for better performance
 * @returns {(req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response>} Express middleware function
 */
export function createCredentialAuthMiddleware() {
	return async (req, res, next) => {
		try {
			const { instanceId } = req.params;

			// Validate instance ID format
			if (!instanceId) {
				 res.status(400).json({
					error: 'Instance ID is required',
					message: 'URL must include instance ID: /:instanceId/endpoint',
				});
				return
			}

			// Validate UUID format
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			if (!uuidRegex.test(instanceId)) {
				 res.status(400).json({
					error: 'Invalid instance ID format',
					message: 'Instance ID must be a valid UUID',
				});
				return

			}

			// Step 1: Check credential cache first (fast path)
			const rawCachedCredential = getCachedCredential(instanceId);
			/** @type {CachedCredential | null} */
			const cachedCredential = /** @type {CachedCredential | null} */ (rawCachedCredential);

			if (cachedCredential) {
				// Cache hit - use cached credential without database lookup
				req.airtableApiKey = cachedCredential.api_key;
				req.instanceId = instanceId;
				req.userId = cachedCredential.user_id;
				req.cacheHit = true;

				// Update usage tracking asynchronously (non-blocking)
				updateAirtableUsageTracking(instanceId, cachedCredential.user_id).catch(/** @param {Error} error */ error => {
					console.error(`Failed to update usage tracking for cached credential ${instanceId}:`, error);
				});

				return next();
			}

			// Step 2: Cache miss - fall back to database lookup (slow path)
			console.log(`🔍 Cache miss for instance: ${instanceId}, querying database`);

			const rawInstance = await getAirtableInstanceCredentials(instanceId);
			/** @type {InstanceData | null} */
			const instance = /** @type {InstanceData | null} */ (rawInstance);

			// Validate instance access
			const validation = validateInstanceAccess(instance);

			if (!validation.isValid) {
				 res.status(validation.statusCode || 400).json({
					error: validation.error,
					message: 'Instance access denied',
					instanceId: instanceId,
				});
				return
			}

			if (!instance) {
				 res.status(404).json({
					error: 'Instance not found',
					message: 'Instance not found in database',
					instanceId: instanceId,
				});
				return
			}

			// Get API key for external service calls
			const rawApiKey = getApiKeyForInstance(instance);
			/** @type {string | null} */
			const apiKey = /** @type {string | null} */ (rawApiKey);

			if (!apiKey) {
				 res.status(500).json({
					error: 'No API key found',
					message: 'Instance has no valid API key',
					instanceId: instanceId,
				});
				return
			}

			// Step 3: Cache the credential for future requests
			if (instance && apiKey) {
				setCachedCredential(instanceId, {
					api_key: apiKey,
					expires_at: instance.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default 24h expiry
					user_id: instance.user_id,
				});
			}

			// Attach instance data to request for use in handlers
			req.airtableApiKey = apiKey;
			req.instanceId = instanceId;
			if (instance) {
				req.userId = instance.user_id;
				req.instance = instance;
			}
			req.cacheHit = false;

			// Update usage tracking asynchronously (non-blocking)
			if (instance) {
				updateAirtableUsageTracking(instanceId, instance.user_id).catch(/** @param {Error} error */ error => {
					console.error(`Failed to update usage tracking for ${instanceId}:`, error);
				});
			}

			next();
		} catch (error) {
			console.error('Credential authentication error:', error);
			 res.status(500).json({
				error: 'Authentication failed',
				message: 'Failed to validate instance credentials',
				instanceId: req.params.instanceId,
			});
			return
		}
	};
}

/**
 * Create middleware for endpoints that require instance validation but not credential caching
 * Used for health checks and discovery endpoints that don't need API keys
 * @returns {(req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response>} Express middleware function
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
					 res.status(400).json({
						error: 'Invalid instance ID format',
						message: 'Instance ID must be a valid UUID',
					});
					return
				}

				// Check cache first for basic validation
				const rawCachedCredential = getCachedCredential(instanceId);
				/** @type {CachedCredential | null} */
				const cachedCredential = /** @type {CachedCredential | null} */ (rawCachedCredential);

				if (cachedCredential) {
					req.instanceId = instanceId;
					req.userId = cachedCredential.user_id;
					req.cacheHit = true;
					return next();
				}

				// If not cached, do basic database check without caching the result
				const rawInstance = await getAirtableInstanceCredentials(instanceId);
				/** @type {InstanceData | null} */
				const instance = /** @type {InstanceData | null} */ (rawInstance);
				const validation = validateInstanceAccess(instance);

				if (!validation.isValid) {
					 res.status(validation.statusCode || 400).json({
						error: validation.error,
						message: 'Instance access denied',
						instanceId: instanceId,
					});
					return
				}

				if (!instance) {
					res.status(404).json({
						error: 'Instance not found',
						message: 'Instance not found in database',
						instanceId: instanceId,
					});
					return 
				}

				req.instanceId = instanceId;
				if (instance) {
					req.userId = instance.user_id;
				}
				req.cacheHit = false;
			}

			next();
		} catch (error) {
			console.error('Lightweight authentication error:', error);
			 res.status(500).json({
				error: 'Authentication failed',
				message: 'Failed to validate instance',
				instanceId: req.params.instanceId,
			});
			return 
		}
	};
}

/**
 * Create debugging middleware that logs cache performance
 * @returns {(req: AuthenticatedRequest, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createCachePerformanceMiddleware() {
	return (req, res, next) => {
		const startTime = Date.now();

		// Override res.json to capture response timing
		/** @type {Function} */
		const originalJson = res.json;
		res.json = function (/** @type {Object} */ data) {
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
