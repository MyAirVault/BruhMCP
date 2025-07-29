// @ts-check
const { v4: uuidv4 } = require('uuid');
const { findOrCreateUser } = require('../db/queries/userQueries.js');
const { generateJWT } = require('../utils/jwt.js');
const { setInterval } = require('node:timers');

class AuthService {
	constructor() {
		/** @type {Map<string, import('../types/index.js').AuthTokenData>} */
		this.authTokens = new Map();

		// Start cleanup intervals
		this.startCleanupTasks();
	}

	/**
	 * Generate a UUID token
	 */
	generateToken() {
		return uuidv4();
	}

	/**
	 * Request authentication token for email
	 * @param {string} email
	 */
	async requestToken(email) {
		const token = this.generateToken();
		const now = new Date();
		const expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

		const tokenData = {
			email,
			expiry,
			createdAt: now,
		};

		this.authTokens.set(token, tokenData);

		// Log token for development (as specified in docs)
		console.log(`Auth token for ${email}: ${token}`);

		return {
			token,
			success: true,
		};
	}

	/**
	 * Verify authentication token and create user session
	 * @param {string} token
	 */
	async verifyToken(token) {
		const tokenData = this.authTokens.get(token);

		if (!tokenData) {
			return {
				success: false,
				error: 'TOKEN_NOT_FOUND',
			};
		}

		// Check if token is expired
		if (new Date() > tokenData.expiry) {
			this.authTokens.delete(token);
			return {
				success: false,
				error: 'TOKEN_EXPIRED',
			};
		}

		try {
			// Find or create user
			const user = await findOrCreateUser(tokenData.email);

			// Generate JWT
			const jwtToken = generateJWT(user);

			// Remove used token
			this.authTokens.delete(token);

			return {
				success: true,
				jwtToken,
				user,
			};
		} catch (error) {
			console.error('Error in verifyToken:', error);
			return {
				success: false,
				error: 'USER_CREATION_FAILED',
			};
		}
	}

	/**
	 * Clean up expired tokens
	 */
	cleanup() {
		const now = new Date();

		// Clean up expired tokens
		for (const [token, tokenData] of this.authTokens.entries()) {
			if (now > tokenData.expiry) {
				this.authTokens.delete(token);
			}
		}
	}

	/**
	 * Start background cleanup tasks
	 */
	startCleanupTasks() {
		// Clean up expired tokens every 5 minutes
		setInterval(
			() => {
				this.cleanup();
			},
			5 * 60 * 1000
		);

		// Log cleanup status every hour (for monitoring)
		setInterval(
			() => {
				console.log(`Auth cleanup: ${this.authTokens.size} tokens`);
			},
			60 * 60 * 1000
		);
	}
}

// Export singleton instance
const authService = new AuthService();
module.exports = { authService };
