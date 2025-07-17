/**
 * Discord OAuth Validation Utilities
 * Validates OAuth tokens and responses
 * Based on Gmail MCP service architecture
 */

/**
 * Validates Discord OAuth token format
 * @param {string} token - Token to validate
 * @param {string} tokenType - Type of token (bearer, bot, refresh)
 * @returns {Object} Validation result
 */
export function validateTokenFormat(token, tokenType) {
	if (!token || typeof token !== 'string') {
		return {
			valid: false,
			error: 'Token must be a non-empty string',
		};
	}

	switch (tokenType) {
		case 'bearer':
			// Discord OAuth bearer tokens are typically 30+ characters
			if (token.length < 20) {
				return {
					valid: false,
					error: 'Bearer token is too short',
				};
			}
			break;

		case 'bot':
			// Discord bot tokens have specific format
			if (!token.startsWith('Bot ') && token.length < 50) {
				return {
					valid: false,
					error: 'Bot token must start with "Bot " or be properly formatted',
				};
			}
			break;

		case 'refresh':
			// Discord refresh tokens are typically 30+ characters
			if (token.length < 20) {
				return {
					valid: false,
					error: 'Refresh token is too short',
				};
			}
			break;

		default:
			return {
				valid: false,
				error: 'Unknown token type',
			};
	}

	return {
		valid: true,
	};
}

/**
 * Validates Discord OAuth scopes
 * @param {Array<string>} scopes - Array of scopes to validate
 * @returns {Object} Validation result
 */
export function validateOAuthScopes(scopes) {
	if (!Array.isArray(scopes)) {
		return {
			valid: false,
			error: 'Scopes must be an array',
		};
	}

	const validScopes = [
		'identify',
		'email',
		'connections',
		'guilds',
		'guilds.join',
		'guilds.members.read',
		'gdm.join',
		'messages.read',
		'rpc',
		'rpc.notifications.read',
		'rpc.voice.read',
		'rpc.voice.write',
		'rpc.activities.write',
		'bot',
		'webhook.incoming',
		'applications.builds.upload',
		'applications.builds.read',
		'applications.commands',
		'applications.store.update',
		'applications.entitlements',
		'activities.read',
		'activities.write',
		'relationships.read',
		'voice',
		'role_connections.write',
	];

	const invalidScopes = scopes.filter(scope => !validScopes.includes(scope));

	if (invalidScopes.length > 0) {
		return {
			valid: false,
			error: `Invalid scopes: ${invalidScopes.join(', ')}`,
			invalidScopes,
		};
	}

	return {
		valid: true,
	};
}

/**
 * Validates Discord OAuth response
 * @param {Object} oauthResponse - OAuth response to validate
 * @returns {Object} Validation result
 */
export function validateOAuthResponse(oauthResponse) {
	if (!oauthResponse || typeof oauthResponse !== 'object') {
		return {
			valid: false,
			error: 'OAuth response must be an object',
		};
	}

	// Check required fields
	const requiredFields = ['access_token', 'token_type'];
	const missingFields = requiredFields.filter(field => !oauthResponse[field]);

	if (missingFields.length > 0) {
		return {
			valid: false,
			error: `Missing required fields: ${missingFields.join(', ')}`,
		};
	}

	// Validate token type
	if (oauthResponse.token_type !== 'Bearer') {
		return {
			valid: false,
			error: 'Token type must be "Bearer"',
		};
	}

	// Validate access token format
	const tokenValidation = validateTokenFormat(oauthResponse.access_token, 'bearer');
	if (!tokenValidation.valid) {
		return {
			valid: false,
			error: `Invalid access token: ${tokenValidation.error}`,
		};
	}

	// Validate refresh token if present
	if (oauthResponse.refresh_token) {
		const refreshValidation = validateTokenFormat(oauthResponse.refresh_token, 'refresh');
		if (!refreshValidation.valid) {
			return {
				valid: false,
				error: `Invalid refresh token: ${refreshValidation.error}`,
			};
		}
	}

	// Validate expires_in if present
	if (oauthResponse.expires_in && (typeof oauthResponse.expires_in !== 'number' || oauthResponse.expires_in <= 0)) {
		return {
			valid: false,
			error: 'expires_in must be a positive number',
		};
	}

	// Validate scope if present
	if (oauthResponse.scope) {
		const scopes = oauthResponse.scope.split(' ');
		const scopeValidation = validateOAuthScopes(scopes);
		if (!scopeValidation.valid) {
			return {
				valid: false,
				error: `Invalid scope: ${scopeValidation.error}`,
			};
		}
	}

	return {
		valid: true,
	};
}

/**
 * Validates Discord user data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result
 */
export function validateUserData(userData) {
	if (!userData || typeof userData !== 'object') {
		return {
			valid: false,
			error: 'User data must be an object',
		};
	}

	// Check required fields
	const requiredFields = ['id', 'username'];
	const missingFields = requiredFields.filter(field => !userData[field]);

	if (missingFields.length > 0) {
		return {
			valid: false,
			error: `Missing required user fields: ${missingFields.join(', ')}`,
		};
	}

	// Validate user ID format (Discord snowflake)
	if (!/^\d{17,19}$/.test(userData.id)) {
		return {
			valid: false,
			error: 'Invalid Discord user ID format',
		};
	}

	// Validate username
	if (typeof userData.username !== 'string' || userData.username.length < 2 || userData.username.length > 32) {
		return {
			valid: false,
			error: 'Username must be 2-32 characters long',
		};
	}

	// Validate discriminator if present (legacy format)
	if (userData.discriminator && !/^\d{4}$/.test(userData.discriminator)) {
		return {
			valid: false,
			error: 'Discriminator must be 4 digits',
		};
	}

	// Validate email if present
	if (userData.email && !isValidEmail(userData.email)) {
		return {
			valid: false,
			error: 'Invalid email format',
		};
	}

	return {
		valid: true,
	};
}

/**
 * Validates Discord guild data
 * @param {Object} guildData - Guild data to validate
 * @returns {Object} Validation result
 */
export function validateGuildData(guildData) {
	if (!guildData || typeof guildData !== 'object') {
		return {
			valid: false,
			error: 'Guild data must be an object',
		};
	}

	// Check required fields
	const requiredFields = ['id', 'name'];
	const missingFields = requiredFields.filter(field => !guildData[field]);

	if (missingFields.length > 0) {
		return {
			valid: false,
			error: `Missing required guild fields: ${missingFields.join(', ')}`,
		};
	}

	// Validate guild ID format (Discord snowflake)
	if (!/^\d{17,19}$/.test(guildData.id)) {
		return {
			valid: false,
			error: 'Invalid Discord guild ID format',
		};
	}

	// Validate guild name
	if (typeof guildData.name !== 'string' || guildData.name.length < 2 || guildData.name.length > 100) {
		return {
			valid: false,
			error: 'Guild name must be 2-100 characters long',
		};
	}

	return {
		valid: true,
	};
}

/**
 * Validates Discord channel data
 * @param {Object} channelData - Channel data to validate
 * @returns {Object} Validation result
 */
export function validateChannelData(channelData) {
	if (!channelData || typeof channelData !== 'object') {
		return {
			valid: false,
			error: 'Channel data must be an object',
		};
	}

	// Check required fields
	const requiredFields = ['id', 'type'];
	const missingFields = requiredFields.filter(field => channelData[field] === undefined);

	if (missingFields.length > 0) {
		return {
			valid: false,
			error: `Missing required channel fields: ${missingFields.join(', ')}`,
		};
	}

	// Validate channel ID format (Discord snowflake)
	if (!/^\d{17,19}$/.test(channelData.id)) {
		return {
			valid: false,
			error: 'Invalid Discord channel ID format',
		};
	}

	// Validate channel type
	const validChannelTypes = [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15];
	if (!validChannelTypes.includes(channelData.type)) {
		return {
			valid: false,
			error: 'Invalid Discord channel type',
		};
	}

	return {
		valid: true,
	};
}

/**
 * Validates instance ID format
 * @param {string} instanceId - Instance ID to validate
 * @returns {Object} Validation result
 */
export function validateInstanceId(instanceId) {
	if (!instanceId || typeof instanceId !== 'string') {
		return {
			valid: false,
			error: 'Instance ID must be a non-empty string',
		};
	}

	// Validate UUID format
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(instanceId)) {
		return {
			valid: false,
			error: 'Instance ID must be a valid UUID',
		};
	}

	return {
		valid: true,
	};
}

/**
 * Validates token expiration
 * @param {number|string} expiresAt - Expiration timestamp or date string
 * @returns {Object} Validation result
 */
export function validateTokenExpiration(expiresAt) {
	if (!expiresAt) {
		return {
			valid: true,
			expired: false,
		};
	}

	let expirationTime;

	if (typeof expiresAt === 'string') {
		expirationTime = new Date(expiresAt).getTime();
	} else if (typeof expiresAt === 'number') {
		expirationTime = expiresAt;
	} else {
		return {
			valid: false,
			error: 'Invalid expiration format',
		};
	}

	if (isNaN(expirationTime)) {
		return {
			valid: false,
			error: 'Invalid expiration date',
		};
	}

	const now = Date.now();
	const expired = expirationTime < now;
	const expiringSoon = expirationTime < now + 5 * 60 * 1000; // 5 minutes

	return {
		valid: true,
		expired,
		expiringSoon,
		expiresAt: expirationTime,
		minutesUntilExpiry: Math.floor((expirationTime - now) / (60 * 1000)),
	};
}

/**
 * Helper function to validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validates Discord webhook URL
 * @param {string} webhookUrl - Webhook URL to validate
 * @returns {Object} Validation result
 */
export function validateWebhookUrl(webhookUrl) {
	if (!webhookUrl || typeof webhookUrl !== 'string') {
		return {
			valid: false,
			error: 'Webhook URL must be a non-empty string',
		};
	}

	try {
		const url = new URL(webhookUrl);

		// Check if it's a Discord webhook URL
		if (url.hostname !== 'discord.com' && url.hostname !== 'discordapp.com') {
			return {
				valid: false,
				error: 'URL must be a Discord webhook URL',
			};
		}

		// Check webhook path format
		const webhookPathRegex = /^\/api\/webhooks\/\d{17,19}\/[a-zA-Z0-9_-]+$/;
		if (!webhookPathRegex.test(url.pathname)) {
			return {
				valid: false,
				error: 'Invalid Discord webhook URL format',
			};
		}

		return {
			valid: true,
		};
	} catch (error) {
		return {
			valid: false,
			error: 'Invalid URL format',
		};
	}
}

/**
 * Validates Discord snowflake ID
 * @param {string} snowflake - Snowflake ID to validate
 * @returns {Object} Validation result
 */
export function validateSnowflakeId(snowflake) {
	if (!snowflake || typeof snowflake !== 'string') {
		return {
			valid: false,
			error: 'Snowflake ID must be a non-empty string',
		};
	}

	// Discord snowflakes are 17-19 digit numbers
	if (!/^\d{17,19}$/.test(snowflake)) {
		return {
			valid: false,
			error: 'Invalid Discord snowflake ID format',
		};
	}

	return {
		valid: true,
	};
}
