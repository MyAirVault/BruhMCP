/**
 * Webhook Validation Middleware
 * @fileoverview Middleware for validating webhook signatures and payloads
 */

/**
 * @typedef {import('express').Request & {rawBody?: string}} RequestWithRawBody
 */

/**
 * Middleware to capture raw body for webhook signature verification
 * This must be applied before express.json() middleware for webhook routes
 * @param {RequestWithRawBody} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function captureRawBody(req, _res, next) {
	if (req.path.includes('/webhooks/')) {
		let rawBody = '';
		
		req.on('data', chunk => {
			rawBody += chunk;
		});
		
		req.on('end', () => {
			req.rawBody = rawBody;
			next();
		});
	} else {
		next();
	}
}

/**
 * @typedef {Map<string, number[]>} WebhookRateLimitStore
 */

/**
 * @typedef {typeof globalThis & {webhookRateLimitStore?: WebhookRateLimitStore}} GlobalWithWebhookStore
 */

/**
 * Rate limiting for webhook endpoints
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function webhookRateLimit(req, res, next) {
	// Basic rate limiting for webhooks
	// In production, consider using express-rate-limit or similar
	const ip = req.ip || req.connection?.remoteAddress || 'unknown';
	const now = Date.now();
	
	// Allow up to 100 webhook requests per minute per IP
	const maxRequests = 100;
	const windowMs = 60 * 1000; // 1 minute
	
	const globalWithStore = /** @type {GlobalWithWebhookStore} */ (global);
	
	if (!globalWithStore.webhookRateLimitStore) {
		globalWithStore.webhookRateLimitStore = new Map();
	}
	
	const requests = globalWithStore.webhookRateLimitStore.get(ip) || [];
	const recentRequests = requests.filter((timestamp) => now - timestamp < windowMs);
	
	if (recentRequests.length >= maxRequests) {
		console.warn(`Webhook rate limit exceeded for IP: ${ip}`);
		return res.status(429).json({
			error: {
				code: 'RATE_LIMIT_EXCEEDED',
				message: 'Too many webhook requests'
			}
		});
	}
	
	recentRequests.push(now);
	globalWithStore.webhookRateLimitStore.set(ip, recentRequests);
	
	next();
}

/**
 * @typedef {Object} BillingConfigValidation
 * @property {boolean} valid - Whether the configuration is valid
 * @property {string[]} [missingVars] - Array of missing environment variable names
 * @property {string} message - Validation message
 */

/**
 * Validate required environment variables for billing
 * @returns {BillingConfigValidation} Validation result
 */
export function validateBillingConfig() {
	const requiredVars = [
		'RAZORPAY_KEY_ID',
		'RAZORPAY_KEY_SECRET',
		'RAZORPAY_WEBHOOK_SECRET'
	];
	
	const missing = requiredVars.filter(varName => !process.env[varName]);
	
	if (missing.length > 0) {
		return {
			valid: false,
			missingVars: missing,
			message: `Missing required environment variables: ${missing.join(', ')}`
		};
	}
	
	return {
		valid: true,
		message: 'Billing configuration is valid'
	};
}

/**
 * Middleware to check billing configuration on startup
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function checkBillingConfig(_req, res, next) {
	const validation = validateBillingConfig();
	
	if (!validation.valid) {
		console.error('❌ Billing configuration error:', validation.message);
		return res.status(500).json({
			error: {
				code: 'BILLING_CONFIG_ERROR',
				message: 'Billing service not properly configured',
				details: validation.missingVars
			}
		});
	}
	
	next();
}