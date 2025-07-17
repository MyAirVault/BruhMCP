/**
 * Reddit Rate Limiting Middleware
 * Implements rate limiting for Reddit API requests
 * Based on Discord MCP service architecture
 */

/**
 * In-memory rate limit storage
 * In production, this should be replaced with Redis or similar
 */
const rateLimitStore = new Map();

/**
 * Rate limit configuration
 * Based on Reddit API rate limits: 60 requests per minute for OAuth apps
 */
const RATE_LIMIT_CONFIG = {
	// General API rate limits
	global: {
		requests: 60,
		window: 60000, // 1 minute
	},
	// Per-route rate limits
	routes: {
		'/api/v1/me': {
			requests: 20,
			window: 60000,
		},
		'/api/submit': {
			requests: 5,
			window: 60000, // Strict limit for posting
		},
		'/api/comment': {
			requests: 10,
			window: 60000,
		},
		'/api/vote': {
			requests: 30,
			window: 60000,
		},
		'/api/compose': {
			requests: 5,
			window: 60000, // Strict limit for messaging
		},
		'/search': {
			requests: 30,
			window: 60000,
		},
		'/r/': {
			requests: 40,
			window: 60000,
		},
		'/message/': {
			requests: 20,
			window: 60000,
		},
	},
	// Per-instance rate limits
	instance: {
		requests: 100,
		window: 60000,
	},
};

/**
 * Creates rate limiting middleware
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware function
 */
export function createRateLimitMiddleware(options = {}) {
	const config = {
		...RATE_LIMIT_CONFIG.global,
		...options,
	};

	return (req, res, next) => {
		const instanceId = req.instanceId || req.params.instanceId;
		const route = getRoutePattern(req.path);
		const now = Date.now();

		// Check global rate limit
		const globalKey = `global:${instanceId}`;
		if (isRateLimited(globalKey, config, now)) {
			return sendRateLimitResponse(res, 'Global rate limit exceeded');
		}

		// Check route-specific rate limit
		const routeConfig = RATE_LIMIT_CONFIG.routes[route];
		if (routeConfig) {
			const routeKey = `route:${instanceId}:${route}`;
			if (isRateLimited(routeKey, routeConfig, now)) {
				return sendRateLimitResponse(res, `Route rate limit exceeded for ${route}`);
			}
		}

		// Check instance-specific rate limit
		const instanceKey = `instance:${instanceId}`;
		if (isRateLimited(instanceKey, RATE_LIMIT_CONFIG.instance, now)) {
			return sendRateLimitResponse(res, 'Instance rate limit exceeded');
		}

		// Record the request
		recordRequest(globalKey, config, now);
		if (routeConfig) {
			recordRequest(`route:${instanceId}:${route}`, routeConfig, now);
		}
		recordRequest(instanceKey, RATE_LIMIT_CONFIG.instance, now);

		// Add rate limit headers
		addRateLimitHeaders(res, globalKey, config, now);

		next();
	};
}

/**
 * Checks if a key is rate limited
 * @param {string} key - Rate limit key
 * @param {Object} config - Rate limit configuration
 * @param {number} now - Current timestamp
 * @returns {boolean} True if rate limited
 */
function isRateLimited(key, config, now) {
	const record = rateLimitStore.get(key);
	if (!record) {
		return false;
	}

	// Clean up old requests
	record.requests = record.requests.filter(timestamp => now - timestamp < config.window);

	return record.requests.length >= config.requests;
}

/**
 * Records a request for rate limiting
 * @param {string} key - Rate limit key
 * @param {Object} config - Rate limit configuration
 * @param {number} now - Current timestamp
 */
function recordRequest(key, config, now) {
	let record = rateLimitStore.get(key);
	if (!record) {
		record = {
			requests: [],
			firstRequest: now,
		};
		rateLimitStore.set(key, record);
	}

	// Add current request
	record.requests.push(now);

	// Clean up old requests
	record.requests = record.requests.filter(timestamp => now - timestamp < config.window);

	// Clean up old records
	if (now - record.firstRequest > config.window * 2) {
		rateLimitStore.delete(key);
	}
}

/**
 * Adds rate limit headers to response
 * @param {Object} res - Express response object
 * @param {string} key - Rate limit key
 * @param {Object} config - Rate limit configuration
 * @param {number} now - Current timestamp
 */
function addRateLimitHeaders(res, key, config, now) {
	const record = rateLimitStore.get(key);
	if (!record) {
		res.set({
			'X-RateLimit-Limit': config.requests.toString(),
			'X-RateLimit-Remaining': config.requests.toString(),
			'X-RateLimit-Reset': Math.ceil((now + config.window) / 1000).toString(),
		});
		return;
	}

	const remaining = Math.max(0, config.requests - record.requests.length);
	const oldestRequest = record.requests[0] || now;
	const resetTime = Math.ceil((oldestRequest + config.window) / 1000);

	res.set({
		'X-RateLimit-Limit': config.requests.toString(),
		'X-RateLimit-Remaining': remaining.toString(),
		'X-RateLimit-Reset': resetTime.toString(),
	});
}

/**
 * Sends rate limit exceeded response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
function sendRateLimitResponse(res, message) {
	res.status(429).json({
		success: false,
		error: message,
		code: 'RATE_LIMIT_EXCEEDED',
		retryAfter: Math.ceil(RATE_LIMIT_CONFIG.global.window / 1000),
		metadata: {
			service: 'reddit',
			timestamp: new Date().toISOString(),
		},
	});
}

/**
 * Gets route pattern for rate limiting
 * @param {string} path - Request path
 * @returns {string} Route pattern
 */
function getRoutePattern(path) {
	// Remove instance ID and normalize path
	const normalizedPath = path.replace(/^\/[^\/]+/, '');

	// Map common Reddit API patterns
	if (normalizedPath.includes('/api/submit')) {
		return '/api/submit';
	}
	if (normalizedPath.includes('/api/comment')) {
		return '/api/comment';
	}
	if (normalizedPath.includes('/api/vote')) {
		return '/api/vote';
	}
	if (normalizedPath.includes('/api/compose')) {
		return '/api/compose';
	}
	if (normalizedPath.includes('/api/v1/me')) {
		return '/api/v1/me';
	}
	if (normalizedPath.includes('/search')) {
		return '/search';
	}
	if (normalizedPath.includes('/r/')) {
		return '/r/';
	}
	if (normalizedPath.includes('/message/')) {
		return '/message/';
	}
	if (normalizedPath.startsWith('/mcp')) {
		return '/mcp';
	}
	if (normalizedPath.startsWith('/health')) {
		return '/health';
	}
	if (normalizedPath.startsWith('/tools')) {
		return '/tools';
	}

	// Default to the path itself
	return normalizedPath || '/';
}

/**
 * Creates Reddit API rate limit middleware
 * Handles Reddit-specific rate limiting (60 requests per minute)
 * @returns {Function} Express middleware function
 */
export function createRedditApiRateLimitMiddleware() {
	return createRateLimitMiddleware({
		requests: 60,
		window: 60000, // 1 minute
	});
}

/**
 * Creates strict rate limit middleware for sensitive operations
 * @returns {Function} Express middleware function
 */
export function createStrictRateLimitMiddleware() {
	return createRateLimitMiddleware({
		requests: 20,
		window: 60000, // 1 minute
	});
}

/**
 * Gets rate limit statistics
 * @returns {Object} Rate limit statistics
 */
export function getRateLimitStatistics() {
	const stats = {
		totalKeys: rateLimitStore.size,
		activeRateLimits: 0,
		keysByType: {
			global: 0,
			route: 0,
			instance: 0,
		},
		topKeys: [],
	};

	const now = Date.now();
	const keyStats = [];

	for (const [key, record] of rateLimitStore.entries()) {
		// Clean up old requests
		record.requests = record.requests.filter(timestamp => now - timestamp < 60000);

		if (record.requests.length > 0) {
			stats.activeRateLimits++;
			keyStats.push({
				key,
				requestCount: record.requests.length,
				lastRequest: Math.max(...record.requests),
			});
		}

		// Count by type
		if (key.startsWith('global:')) {
			stats.keysByType.global++;
		} else if (key.startsWith('route:')) {
			stats.keysByType.route++;
		} else if (key.startsWith('instance:')) {
			stats.keysByType.instance++;
		}
	}

	// Sort and get top keys
	keyStats.sort((a, b) => b.requestCount - a.requestCount);
	stats.topKeys = keyStats.slice(0, 10);

	return stats;
}

/**
 * Clears rate limit data for an instance
 * @param {string} instanceId - Instance ID
 */
export function clearInstanceRateLimit(instanceId) {
	const keysToDelete = [];

	for (const key of rateLimitStore.keys()) {
		if (key.includes(instanceId)) {
			keysToDelete.push(key);
		}
	}

	for (const key of keysToDelete) {
		rateLimitStore.delete(key);
	}

	console.log(`🧹 Cleared rate limit data for instance: ${instanceId} (${keysToDelete.length} keys)`);
}

/**
 * Clears all rate limit data
 */
export function clearAllRateLimits() {
	const count = rateLimitStore.size;
	rateLimitStore.clear();
	console.log(`🧹 Cleared all rate limit data (${count} keys)`);
}

/**
 * Updates rate limit configuration
 * @param {Object} newConfig - New rate limit configuration
 */
export function updateRateLimitConfig(newConfig) {
	Object.assign(RATE_LIMIT_CONFIG, newConfig);
	console.log('⚙️  Updated rate limit configuration:', RATE_LIMIT_CONFIG);
}

/**
 * Gets rate limit configuration
 * @returns {Object} Current rate limit configuration
 */
export function getRateLimitConfig() {
	return { ...RATE_LIMIT_CONFIG };
}

/**
 * Checks if an instance is currently rate limited
 * @param {string} instanceId - Instance ID
 * @returns {boolean} True if rate limited
 */
export function isInstanceRateLimited(instanceId) {
	const now = Date.now();
	const globalKey = `global:${instanceId}`;
	const instanceKey = `instance:${instanceId}`;

	return (
		isRateLimited(globalKey, RATE_LIMIT_CONFIG.global, now) ||
		isRateLimited(instanceKey, RATE_LIMIT_CONFIG.instance, now)
	);
}

/**
 * Gets remaining requests for an instance
 * @param {string} instanceId - Instance ID
 * @returns {Object} Remaining request information
 */
export function getInstanceRemainingRequests(instanceId) {
	const now = Date.now();
	const globalKey = `global:${instanceId}`;
	const instanceKey = `instance:${instanceId}`;

	const globalRecord = rateLimitStore.get(globalKey);
	const instanceRecord = rateLimitStore.get(instanceKey);

	const globalRemaining = globalRecord
		? Math.max(0, RATE_LIMIT_CONFIG.global.requests - globalRecord.requests.length)
		: RATE_LIMIT_CONFIG.global.requests;

	const instanceRemaining = instanceRecord
		? Math.max(0, RATE_LIMIT_CONFIG.instance.requests - instanceRecord.requests.length)
		: RATE_LIMIT_CONFIG.instance.requests;

	return {
		global: {
			remaining: globalRemaining,
			limit: RATE_LIMIT_CONFIG.global.requests,
			window: RATE_LIMIT_CONFIG.global.window,
		},
		instance: {
			remaining: instanceRemaining,
			limit: RATE_LIMIT_CONFIG.instance.requests,
			window: RATE_LIMIT_CONFIG.instance.window,
		},
		effectiveRemaining: Math.min(globalRemaining, instanceRemaining),
	};
}