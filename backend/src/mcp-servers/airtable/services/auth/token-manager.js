/**
 * Token Manager
 * Manages API tokens, validation, and lifecycle
 */

import { createLogger } from '../utils/logger.js';
import { validateToken, getTokenType, createSecureTokenDisplay } from '../utils/auth.js';
import { AirtableErrorHandler, AuthenticationError } from '../utils/error-handler.js';
import { deepClone } from '../utils/common.js';

const logger = createLogger('TokenManager');

export class TokenManager {
	constructor() {
		this.tokens = new Map();
		this.validationCache = new Map();
		this.cacheTimeout = 300000; // 5 minutes
		this.cleanupInterval = 60000; // 1 minute
		
		// Start cleanup interval
		this.startCleanup();
		
		logger.info('TokenManager initialized');
	}

	/**
	 * Add token to manager
	 * @param {string} instanceId - Instance ID
	 * @param {string} token - API token
	 * @param {Object} metadata - Token metadata
	 * @returns {Promise<Object>} Token info
	 */
	async addToken(instanceId, token, metadata = {}) {
		if (!instanceId || !token) {
			throw new Error('Instance ID and token are required');
		}

		try {
			// Validate token first
			const validation = await validateToken(token);
			
			const tokenInfo = {
				instanceId,
				token,
				type: validation.type,
				scopes: validation.scopes,
				userId: validation.userId,
				validation,
				metadata: {
					...metadata,
					addedAt: Date.now(),
					lastUsed: Date.now(),
					useCount: 0
				}
			};

			this.tokens.set(instanceId, tokenInfo);
			
			// Cache validation result
			this.validationCache.set(instanceId, {
				validation,
				timestamp: Date.now()
			});

			logger.info('Token added successfully', {
				instanceId,
				tokenType: validation.type,
				tokenDisplay: createSecureTokenDisplay(token)
			});

			return {
				instanceId,
				type: validation.type,
				scopes: validation.scopes,
				userId: validation.userId,
				addedAt: tokenInfo.metadata.addedAt
			};
		} catch (error) {
			const authError = AirtableErrorHandler.handle(error, {
				operation: 'addToken',
				instanceId
			});
			throw authError;
		}
	}

	/**
	 * Get token for instance
	 * @param {string} instanceId - Instance ID
	 * @returns {string|null} Token or null if not found
	 */
	getToken(instanceId) {
		const tokenInfo = this.tokens.get(instanceId);
		
		if (tokenInfo) {
			// Update usage statistics
			tokenInfo.metadata.lastUsed = Date.now();
			tokenInfo.metadata.useCount++;
			
			logger.debug('Token retrieved', {
				instanceId,
				useCount: tokenInfo.metadata.useCount
			});
			
			return tokenInfo.token;
		}

		logger.warn('Token not found', { instanceId });
		return null;
	}

	/**
	 * Get token info for instance
	 * @param {string} instanceId - Instance ID
	 * @returns {Object|null} Token info or null if not found
	 */
	getTokenInfo(instanceId) {
		const tokenInfo = this.tokens.get(instanceId);
		
		if (tokenInfo) {
			return {
				instanceId: tokenInfo.instanceId,
				type: tokenInfo.type,
				scopes: tokenInfo.scopes,
				userId: tokenInfo.userId,
				tokenDisplay: createSecureTokenDisplay(tokenInfo.token),
				metadata: deepClone(tokenInfo.metadata)
			};
		}

		return null;
	}

	/**
	 * Validate token for instance
	 * @param {string} instanceId - Instance ID
	 * @param {boolean} useCache - Whether to use cached validation
	 * @returns {Promise<Object>} Validation result
	 */
	async validateInstanceToken(instanceId, useCache = true) {
		const tokenInfo = this.tokens.get(instanceId);
		
		if (!tokenInfo) {
			throw new AuthenticationError(`No token found for instance ${instanceId}`);
		}

		// Check cache first if enabled
		if (useCache) {
			const cached = this.validationCache.get(instanceId);
			if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
				logger.debug('Token validation cache hit', { instanceId });
				return cached.validation;
			}
		}

		try {
			// Validate token
			const validation = await validateToken(tokenInfo.token);
			
			// Update token info
			tokenInfo.validation = validation;
			tokenInfo.metadata.lastValidated = Date.now();
			
			// Cache validation result
			this.validationCache.set(instanceId, {
				validation,
				timestamp: Date.now()
			});

			logger.debug('Token validated successfully', {
				instanceId,
				tokenType: validation.type
			});

			return validation;
		} catch (error) {
			const authError = AirtableErrorHandler.handle(error, {
				operation: 'validateInstanceToken',
				instanceId
			});
			throw authError;
		}
	}

	/**
	 * Remove token for instance
	 * @param {string} instanceId - Instance ID
	 * @returns {boolean} True if removed
	 */
	removeToken(instanceId) {
		const existed = this.tokens.has(instanceId);
		
		if (existed) {
			this.tokens.delete(instanceId);
			this.validationCache.delete(instanceId);
			
			logger.info('Token removed', { instanceId });
		}

		return existed;
	}

	/**
	 * Update token metadata
	 * @param {string} instanceId - Instance ID
	 * @param {Object} metadata - Metadata to update
	 * @returns {boolean} True if updated
	 */
	updateTokenMetadata(instanceId, metadata) {
		const tokenInfo = this.tokens.get(instanceId);
		
		if (tokenInfo) {
			tokenInfo.metadata = {
				...tokenInfo.metadata,
				...metadata,
				updatedAt: Date.now()
			};
			
			logger.debug('Token metadata updated', { instanceId });
			return true;
		}

		return false;
	}

	/**
	 * Check if token exists for instance
	 * @param {string} instanceId - Instance ID
	 * @returns {boolean} True if exists
	 */
	hasToken(instanceId) {
		return this.tokens.has(instanceId);
	}

	/**
	 * Get all instance IDs
	 * @returns {Array} Array of instance IDs
	 */
	getInstanceIds() {
		return Array.from(this.tokens.keys());
	}

	/**
	 * Get token count
	 * @returns {number} Number of tokens
	 */
	getTokenCount() {
		return this.tokens.size;
	}

	/**
	 * Get tokens by type
	 * @param {string} type - Token type
	 * @returns {Array} Array of token info objects
	 */
	getTokensByType(type) {
		const tokens = [];
		
		for (const [instanceId, tokenInfo] of this.tokens) {
			if (tokenInfo.type === type) {
				tokens.push({
					instanceId,
					type: tokenInfo.type,
					scopes: tokenInfo.scopes,
					userId: tokenInfo.userId,
					metadata: deepClone(tokenInfo.metadata)
				});
			}
		}

		return tokens;
	}

	/**
	 * Get tokens by user ID
	 * @param {string} userId - User ID
	 * @returns {Array} Array of token info objects
	 */
	getTokensByUserId(userId) {
		const tokens = [];
		
		for (const [instanceId, tokenInfo] of this.tokens) {
			if (tokenInfo.userId === userId) {
				tokens.push({
					instanceId,
					type: tokenInfo.type,
					scopes: tokenInfo.scopes,
					userId: tokenInfo.userId,
					metadata: deepClone(tokenInfo.metadata)
				});
			}
		}

		return tokens;
	}

	/**
	 * Refresh all token validations
	 * @returns {Promise<Object>} Refresh results
	 */
	async refreshAllValidations() {
		const results = {
			total: this.tokens.size,
			successful: 0,
			failed: 0,
			errors: []
		};

		for (const [instanceId, tokenInfo] of this.tokens) {
			try {
				await this.validateInstanceToken(instanceId, false);
				results.successful++;
			} catch (error) {
				results.failed++;
				results.errors.push({
					instanceId,
					error: error.message
				});
			}
		}

		logger.info('All token validations refreshed', {
			total: results.total,
			successful: results.successful,
			failed: results.failed
		});

		return results;
	}

	/**
	 * Clean up expired cache entries
	 */
	cleanup() {
		const now = Date.now();
		let cleanedCount = 0;

		// Clean validation cache
		for (const [instanceId, cached] of this.validationCache) {
			if (now - cached.timestamp > this.cacheTimeout) {
				this.validationCache.delete(instanceId);
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			logger.debug('Cache cleanup completed', { cleanedCount });
		}
	}

	/**
	 * Start cleanup interval
	 */
	startCleanup() {
		this.cleanupIntervalId = setInterval(() => {
			this.cleanup();
		}, this.cleanupInterval);

		logger.debug('Cleanup interval started');
	}

	/**
	 * Stop cleanup interval
	 */
	stopCleanup() {
		if (this.cleanupIntervalId) {
			clearInterval(this.cleanupIntervalId);
			this.cleanupIntervalId = null;
			logger.debug('Cleanup interval stopped');
		}
	}

	/**
	 * Get statistics
	 * @returns {Object} Statistics
	 */
	getStatistics() {
		const stats = {
			totalTokens: this.tokens.size,
			validationCacheSize: this.validationCache.size,
			tokensByType: {},
			tokensByUserId: {},
			usageStats: {
				totalUses: 0,
				averageUses: 0,
				mostUsedInstance: null,
				leastUsedInstance: null
			}
		};

		// Collect statistics
		let maxUses = 0;
		let minUses = Infinity;
		let totalUses = 0;

		for (const [instanceId, tokenInfo] of this.tokens) {
			// Count by type
			stats.tokensByType[tokenInfo.type] = (stats.tokensByType[tokenInfo.type] || 0) + 1;
			
			// Count by user ID
			stats.tokensByUserId[tokenInfo.userId] = (stats.tokensByUserId[tokenInfo.userId] || 0) + 1;
			
			// Usage statistics
			const useCount = tokenInfo.metadata.useCount;
			totalUses += useCount;
			
			if (useCount > maxUses) {
				maxUses = useCount;
				stats.usageStats.mostUsedInstance = instanceId;
			}
			
			if (useCount < minUses) {
				minUses = useCount;
				stats.usageStats.leastUsedInstance = instanceId;
			}
		}

		stats.usageStats.totalUses = totalUses;
		stats.usageStats.averageUses = this.tokens.size > 0 ? totalUses / this.tokens.size : 0;

		return stats;
	}

	/**
	 * Clear all tokens
	 */
	clearAllTokens() {
		const count = this.tokens.size;
		this.tokens.clear();
		this.validationCache.clear();
		
		logger.info('All tokens cleared', { count });
	}

	/**
	 * Export tokens (without sensitive data)
	 * @returns {Array} Array of token info
	 */
	exportTokens() {
		const exported = [];
		
		for (const [instanceId, tokenInfo] of this.tokens) {
			exported.push({
				instanceId,
				type: tokenInfo.type,
				scopes: tokenInfo.scopes,
				userId: tokenInfo.userId,
				tokenDisplay: createSecureTokenDisplay(tokenInfo.token),
				metadata: deepClone(tokenInfo.metadata)
			});
		}

		return exported;
	}

	/**
	 * Health check
	 * @returns {Object} Health status
	 */
	getHealthStatus() {
		return {
			status: 'healthy',
			tokenCount: this.tokens.size,
			cacheSize: this.validationCache.size,
			cleanupRunning: !!this.cleanupIntervalId,
			timestamp: Date.now()
		};
	}

	/**
	 * Shutdown token manager
	 */
	shutdown() {
		this.stopCleanup();
		this.clearAllTokens();
		
		logger.info('TokenManager shutdown completed');
	}
}