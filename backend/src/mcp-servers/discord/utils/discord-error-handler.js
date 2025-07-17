/**
 * Discord Error Handler
 * Comprehensive error handling for Discord API operations
 * Based on Gmail MCP service architecture
 */

/**
 * Discord API Error Types
 */
export const DISCORD_ERROR_TYPES = {
	// Authentication errors
	INVALID_TOKEN: 'INVALID_TOKEN',
	EXPIRED_TOKEN: 'EXPIRED_TOKEN',
	INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

	// API errors
	RATE_LIMITED: 'RATE_LIMITED',
	INVALID_REQUEST: 'INVALID_REQUEST',
	RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
	FORBIDDEN: 'FORBIDDEN',

	// Network errors
	NETWORK_ERROR: 'NETWORK_ERROR',
	SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
	TIMEOUT: 'TIMEOUT',

	// Application errors
	UNKNOWN_ERROR: 'UNKNOWN_ERROR',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
};

/**
 * Parse Discord API error
 * @param {Error} error - Error object
 * @returns {Object} Parsed error information
 */
export function parseDiscordError(error) {
	const message = error.message ? error.message.toLowerCase() : '';
	const statusCode = error.statusCode || 500;

	// Parse authentication errors
	if (message.includes('unauthorized') || statusCode === 401) {
		return {
			type: DISCORD_ERROR_TYPES.INVALID_TOKEN,
			requiresReauth: true,
			userMessage: 'Your Discord authentication is invalid. Please re-authenticate.',
			shouldRetry: false,
			httpStatus: 401,
			logLevel: 'warn',
		};
	}

	if (message.includes('forbidden') || statusCode === 403) {
		return {
			type: DISCORD_ERROR_TYPES.INSUFFICIENT_PERMISSIONS,
			requiresReauth: false,
			userMessage: 'You do not have permission to perform this action.',
			shouldRetry: false,
			httpStatus: 403,
			logLevel: 'warn',
		};
	}

	// Parse rate limiting errors
	if (message.includes('rate limit') || statusCode === 429) {
		const retryAfter = extractRetryAfter(error);
		return {
			type: DISCORD_ERROR_TYPES.RATE_LIMITED,
			requiresReauth: false,
			userMessage: `Discord API rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`,
			shouldRetry: true,
			retryAfter: retryAfter,
			httpStatus: 429,
			logLevel: 'warn',
		};
	}

	// Parse not found errors
	if (message.includes('not found') || statusCode === 404) {
		return {
			type: DISCORD_ERROR_TYPES.RESOURCE_NOT_FOUND,
			requiresReauth: false,
			userMessage: 'The requested Discord resource was not found.',
			shouldRetry: false,
			httpStatus: 404,
			logLevel: 'info',
		};
	}

	// Parse validation errors
	if (message.includes('invalid') || message.includes('validation')) {
		return {
			type: DISCORD_ERROR_TYPES.VALIDATION_ERROR,
			requiresReauth: false,
			userMessage: 'Invalid request parameters provided.',
			shouldRetry: false,
			httpStatus: 400,
			logLevel: 'info',
		};
	}

	// Parse network errors
	if (message.includes('network') || message.includes('timeout') || message.includes('econnreset')) {
		return {
			type: DISCORD_ERROR_TYPES.NETWORK_ERROR,
			requiresReauth: false,
			userMessage: 'Network error occurred. Please try again.',
			shouldRetry: true,
			retryAfter: 5,
			httpStatus: 502,
			logLevel: 'error',
		};
	}

	// Parse service unavailable errors
	if (message.includes('service unavailable') || statusCode === 503) {
		return {
			type: DISCORD_ERROR_TYPES.SERVICE_UNAVAILABLE,
			requiresReauth: false,
			userMessage: 'Discord service is temporarily unavailable. Please try again later.',
			shouldRetry: true,
			retryAfter: 30,
			httpStatus: 503,
			logLevel: 'error',
		};
	}

	// Default to unknown error
	return {
		type: DISCORD_ERROR_TYPES.UNKNOWN_ERROR,
		requiresReauth: false,
		userMessage: 'An unexpected error occurred. Please try again.',
		shouldRetry: false,
		httpStatus: 500,
		logLevel: 'error',
	};
}

/**
 * Handle Discord OAuth error
 * @param {Error} error - OAuth error
 * @param {string} instanceId - Instance ID
 * @param {string} operation - Operation that failed
 * @returns {Object} Error response
 */
export function handleDiscordOAuthError(error, instanceId, operation) {
	const parsedError = parseDiscordError(error);

	console.log(
		`${parsedError.logLevel === 'error' ? '❌' : '⚠️'} Discord OAuth error for instance ${instanceId} during ${operation}:`,
		error.message
	);

	const errorResponse = {
		error: {
			type: parsedError.type,
			message: parsedError.userMessage,
			requiresReauth: parsedError.requiresReauth,
			shouldRetry: parsedError.shouldRetry,
			httpStatus: parsedError.httpStatus,
		},
		metadata: {
			instanceId,
			operation,
			errorType: parsedError.type,
			originalError: error.message,
			timestamp: new Date().toISOString(),
		},
	};

	if (parsedError.retryAfter) {
		errorResponse.error.retryAfter = parsedError.retryAfter;
	}

	return errorResponse;
}

/**
 * Extract retry-after value from error
 * @param {Error} error - Error object
 * @returns {number} Retry after seconds
 */
function extractRetryAfter(error) {
	// Try to extract from error message
	const retryMatch = error.message.match(/retry after (\d+)/i);
	if (retryMatch) {
		return parseInt(retryMatch[1], 10);
	}

	// Try to extract from status code
	if (error.statusCode === 429) {
		return 60; // Default 1 minute for rate limiting
	}

	return 5; // Default 5 seconds
}

/**
 * Check if error requires re-authentication
 * @param {Error} error - Error object
 * @returns {boolean} True if re-auth required
 */
export function requiresReauthentication(error) {
	const parsedError = parseDiscordError(error);
	return parsedError.requiresReauth;
}

/**
 * Check if error is retryable
 * @param {Error} error - Error object
 * @returns {boolean} True if retryable
 */
export function isRetryableError(error) {
	const parsedError = parseDiscordError(error);
	return parsedError.shouldRetry;
}

/**
 * Get retry delay for error
 * @param {Error} error - Error object
 * @param {number} attempt - Retry attempt number
 * @returns {number} Delay in seconds
 */
export function getRetryDelay(error, attempt = 1) {
	const parsedError = parseDiscordError(error);

	if (parsedError.retryAfter) {
		return parsedError.retryAfter;
	}

	// Exponential backoff with jitter
	const baseDelay = Math.min(Math.pow(2, attempt), 60); // Max 60 seconds
	const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter

	return Math.floor(baseDelay + jitter);
}

/**
 * Format error for logging
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @returns {string} Formatted error message
 */
export function formatErrorForLogging(error, context = '') {
	const parsedError = parseDiscordError(error);

	return `[${parsedError.type}] ${context ? `${context}: ` : ''}${error.message} (HTTP ${parsedError.httpStatus})`;
}

/**
 * Create user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly message
 */
export function createUserFriendlyMessage(error) {
	const parsedError = parseDiscordError(error);
	return parsedError.userMessage;
}

/**
 * Discord API error codes mapping
 */
export const DISCORD_API_ERROR_CODES = {
	10001: 'Unknown account',
	10003: 'Unknown channel',
	10004: 'Unknown guild',
	10008: 'Unknown message',
	10013: 'Unknown user',
	10014: 'Unknown emoji',
	10015: 'Unknown webhook',
	10026: 'Unknown ban',
	10027: 'Unknown SKU',
	10028: 'Unknown Store Listing',
	10029: 'Unknown entitlement',
	10030: 'Unknown build',
	10031: 'Unknown lobby',
	10032: 'Unknown branch',
	10033: 'Unknown store directory layout',
	10036: 'Unknown redistributable',
	10038: 'Unknown gift code',
	10049: 'Unknown stream',
	10050: 'Unknown premium server subscribe cooldown',
	10057: 'Unknown guild template',
	10059: 'Unknown discoverable server category',
	10060: 'Unknown sticker',
	10061: 'Unknown interaction',
	10062: 'Unknown application command',
	10063: 'Unknown application command permissions',
	10065: 'Unknown Stage Instance',
	10066: 'Unknown Guild Member Verification Form',
	10067: 'Unknown Guild Welcome Screen',
	10068: 'Unknown Guild Scheduled Event',
	10069: 'Unknown Guild Scheduled Event User',
	20001: 'Bots cannot use this endpoint',
	20002: 'Only bots can use this endpoint',
	20009: 'Explicit content cannot be sent to the desired recipient(s)',
	20012: 'You are not authorized to perform this action on this application',
	20016: 'This action cannot be performed due to slowmode rate limit',
	20018: 'Only the owner of this account can perform this action',
	20019: 'This message cannot be edited due to announcement rate limits',
	20022: 'The channel you are writing has hit the write rate limit',
	20026: 'The write action you are performing on the server has hit the write rate limit',
	20028: 'The write action you are performing on the channel has hit the write rate limit',
	20031: 'Words not allowed',
	20035: 'Guild premium subscription level too low',
	30001: 'Maximum number of guilds reached (100)',
	30002: 'Maximum number of friends reached (1000)',
	30003: 'Maximum number of pins reached for the channel (50)',
	30005: 'Maximum number of guild roles reached (250)',
	30010: 'Maximum number of reactions reached (20)',
	30013: 'Maximum number of guild channels reached (500)',
	30015: 'Maximum number of attachments in a message reached (10)',
	30016: 'Maximum number of invites reached (1000)',
	30018: 'Maximum number of animated emojis reached',
	30019: 'Maximum number of server members reached',
	30030: 'Maximum number of server categories has been reached (5)',
	30033: 'A server with that template code already exists',
	30034: 'Maximum number of thread participants has been reached (1000)',
	30035: 'Maximum number of bans for non-guild members have been exceeded',
	30037: 'Maximum number of bans fetches has been reached',
	30038: 'Maximum number of uncompleted guild scheduled events reached (100)',
	30039: 'Maximum number of stickers reached',
	30040: 'Maximum number of prune requests has been reached. Try again later',
	30042: 'Maximum number of guild widget settings updates has been reached. Try again later',
	30046: 'Maximum number of edits to messages older than 1 hour reached. Try again later',
	30047: 'Maximum number of pinned threads in a forum channel has been reached',
	30048: 'Maximum number of tags in a forum channel has been reached',
	30052: 'Bitrate is too high for channel of this type',
	40001: 'Unauthorized. Provide a valid token and try again',
	40002: 'You need to verify your account in order to perform this action',
	40003: 'You are opening direct messages too fast',
	40004: 'Send messages has been temporarily disabled',
	40005: 'Request entity too large. Try sending something smaller in size',
	40006: 'This feature has been temporarily disabled server-side',
	40007: 'The user is banned from this guild',
	40012: 'Connection has been revoked',
	50001: 'Missing access',
	50002: 'Invalid account type',
	50003: 'Cannot execute action on a DM channel',
	50004: 'Guild widget disabled',
	50005: 'Cannot edit a message authored by another user',
	50006: 'Cannot send an empty message',
	50007: 'Cannot send messages to this user',
	50008: 'Cannot send messages in a voice channel',
	50009: 'Channel verification level is too high for you to gain access',
	50010: 'OAuth2 application does not have a bot',
	50011: 'OAuth2 application limit reached',
	50012: 'Invalid OAuth2 state',
	50013: 'You lack permissions to perform that action',
	50014: 'Invalid authentication token provided',
	50015: 'Note was too long',
	50016: 'Provided too few or too many messages to delete. Must provide at least 2 and fewer than 100 messages to delete',
	50019: 'A message can only be pinned to the channel it was sent in',
	50020: 'Invite code was either invalid or taken',
	50021: 'Cannot execute action on a system message',
	50024: 'Cannot execute action on this channel type',
	50025: 'Invalid OAuth2 access token provided',
	50026: 'Missing required OAuth2 scope',
	50027: 'Invalid webhook token provided',
	50028: 'Invalid role',
	50033: 'Invalid Recipient(s)',
	50034: 'A message provided was too old to bulk delete',
	50035: 'Invalid form body (returned for both application/json and multipart/form-data bodies), or invalid Content-Type provided',
	50036: "An invite was accepted to a guild the application's bot is not in",
	50041: 'Invalid API version provided',
	50045: 'File uploaded exceeds the maximum size',
	50046: 'Invalid file uploaded',
	50054: 'Cannot self-redeem this gift',
	50055: 'Invalid Guild',
	50068: 'Invalid message type',
	50070: 'Payment source required to redeem gift',
	50074: 'Cannot delete a channel required for Community guilds',
	50080: 'Invalid sticker sent',
	50081: 'Tried to perform an operation on an archived thread, such as editing a message or adding a user to the thread',
	50083: 'Invalid thread notification settings',
	50084: 'before value is earlier than the thread creation date',
	50085: 'Community server channels must be text channels',
	50086: 'The entity type of the event is different from the entity you are trying to start the event for',
	50095: 'This server is not available in your location',
	50097: 'This server needs monetization enabled in order to perform this action',
	50101: 'This server needs more boosts to perform this action',
	50109: 'The request body contains invalid JSON',
	50132: 'Ownership cannot be transferred to a bot user',
	50138: 'Failed to resize asset below the maximum size: 262144',
	50146: 'Uploaded file not found',
	60003: 'Two factor is required for this operation',
	80004: 'No users with DiscordTag exist',
	90001: 'Reaction was blocked',
	130000: 'API resource is currently overloaded. Try again a little later',
	150006: 'The Stage is already open',
	160002: 'Cannot reply without permission to read message history',
	160004: 'A thread has already been created for this message',
	160005: 'Thread is locked',
	160006: 'Maximum number of active threads reached',
	160007: 'Maximum number of active announcement threads reached',
	170001: 'Invalid JSON for uploaded Lottie file',
	170002: 'Uploaded Lotties cannot contain rasterized images such as PNG or JPEG',
	170003: 'Sticker maximum framerate exceeded',
	170004: 'Sticker frame count exceeds maximum of 1000 frames',
	170005: 'Lottie animation maximum dimensions exceeded',
	170006: 'Sticker frame rate is either too small or too large',
	170007: 'Sticker animation duration exceeds maximum of 5 seconds',
	180000: 'Cannot update a finished event',
	180002: 'Failed to create stage needed for stage event',
	200000: 'Message was blocked by automatic moderation',
	200001: 'Title was blocked by automatic moderation',
	220003: 'This message cannot be edited',
	240000: 'Cannot enable onboarding, requirements are not met',
};

/**
 * Get error message from Discord API error code
 * @param {number} code - Discord API error code
 * @returns {string} Error message
 */
export function getDiscordAPIErrorMessage(code) {
	return DISCORD_API_ERROR_CODES[code] || 'Unknown Discord API error';
}
