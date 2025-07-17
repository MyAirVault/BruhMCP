/**
 * Global Variable Manager for GitHub MCP Service
 * Manages global variables and session state for GitHub operations
 */

import { createLogger } from '../../utils/logger.js';
import { createCache } from '../../utils/common.js';

const logger = createLogger('global-variable-manager');

export class GlobalVariableManager {
	constructor() {
		this.variables = new Map();
		this.cache = createCache(3600000); // 1 hour cache
		this.sessionData = new Map();
		this.eventListeners = new Map();
		
		// Initialize default variables
		this.initializeDefaults();
		
		logger.info('GlobalVariableManager initialized');
	}

	/**
	 * Initialize default variables
	 */
	initializeDefaults() {
		// GitHub API defaults
		this.setVariable('github.api.baseUrl', 'https://api.github.com');
		this.setVariable('github.api.version', '2022-11-28');
		this.setVariable('github.api.userAgent', 'GitHub-MCP-Server/1.0');
		this.setVariable('github.api.timeout', 30000);
		this.setVariable('github.api.retryAttempts', 3);
		this.setVariable('github.api.retryDelay', 1000);
		
		// Pagination defaults
		this.setVariable('github.pagination.defaultPerPage', 30);
		this.setVariable('github.pagination.maxPerPage', 100);
		this.setVariable('github.pagination.defaultPage', 1);
		
		// Rate limiting
		this.setVariable('github.rateLimit.checkEnabled', true);
		this.setVariable('github.rateLimit.respectRetryAfter', true);
		this.setVariable('github.rateLimit.bufferPercentage', 10);
		
		// Response optimization
		this.setVariable('github.response.optimizationEnabled', true);
		this.setVariable('github.response.simplificationEnabled', true);
		this.setVariable('github.response.cacheEnabled', true);
		this.setVariable('github.response.defaultFormat', 'json');
		
		// Search defaults
		this.setVariable('github.search.defaultSort', 'updated');
		this.setVariable('github.search.defaultOrder', 'desc');
		this.setVariable('github.search.maxResults', 1000);
		
		// Repository defaults
		this.setVariable('github.repository.defaultBranch', 'main');
		this.setVariable('github.repository.defaultVisibility', 'public');
		this.setVariable('github.repository.defaultLicense', 'mit');
		
		// Issue defaults
		this.setVariable('github.issue.defaultState', 'open');
		this.setVariable('github.issue.defaultSort', 'created');
		this.setVariable('github.issue.defaultDirection', 'desc');
		
		// Pull request defaults
		this.setVariable('github.pullRequest.defaultState', 'open');
		this.setVariable('github.pullRequest.defaultSort', 'created');
		this.setVariable('github.pullRequest.defaultDirection', 'desc');
		this.setVariable('github.pullRequest.defaultMergeMethod', 'merge');
		
		// Commit defaults
		this.setVariable('github.commit.defaultSort', 'author-date');
		this.setVariable('github.commit.defaultDirection', 'desc');
		this.setVariable('github.commit.maxCommits', 250);
		
		// Content defaults
		this.setVariable('github.content.defaultEncoding', 'utf-8');
		this.setVariable('github.content.maxFileSize', 1048576); // 1MB
		this.setVariable('github.content.binaryThreshold', 65536); // 64KB
		
		// Security settings
		this.setVariable('github.security.validateSSL', true);
		this.setVariable('github.security.logSensitiveData', false);
		this.setVariable('github.security.maskTokens', true);
		
		// Performance settings
		this.setVariable('github.performance.measureEnabled', true);
		this.setVariable('github.performance.slowThreshold', 5000);
		this.setVariable('github.performance.logSlowRequests', true);
		
		// Debugging
		this.setVariable('github.debug.enabled', false);
		this.setVariable('github.debug.logRequests', false);
		this.setVariable('github.debug.logresponses', false);
		this.setVariable('github.debug.logErrors', true);
		
		logger.debug('Default variables initialized', {
			count: this.variables.size
		});
	}

	/**
	 * Set a global variable
	 * @param {string} key - Variable key
	 * @param {*} value - Variable value
	 * @param {Object} options - Set options
	 */
	setVariable(key, value, options = {}) {
		const {
			persistent = false,
			ttl = null,
			namespace = 'default',
			readonly = false,
			sensitive = false
		} = options;

		const variable = {
			key,
			value,
			persistent,
			ttl,
			namespace,
			readonly,
			sensitive,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		// Check if variable is readonly
		const existing = this.variables.get(key);
		if (existing && existing.readonly) {
			throw new Error(`Variable '${key}' is readonly and cannot be modified`);
		}

		this.variables.set(key, variable);

		// Set TTL if specified
		if (ttl) {
			setTimeout(() => {
				this.deleteVariable(key);
			}, ttl);
		}

		// Trigger change event
		this.triggerEvent('variableChanged', { key, value, oldValue: existing?.value });

		logger.debug('Variable set', {
			key,
			namespace,
			persistent,
			readonly,
			sensitive,
			hasValue: value !== undefined && value !== null
		});
	}

	/**
	 * Get a global variable
	 * @param {string} key - Variable key
	 * @param {*} defaultValue - Default value if not found
	 * @returns {*} Variable value
	 */
	getVariable(key, defaultValue = undefined) {
		const variable = this.variables.get(key);
		
		if (!variable) {
			return defaultValue;
		}

		// Check if variable has expired
		if (variable.ttl && Date.now() > new Date(variable.createdAt).getTime() + variable.ttl) {
			this.deleteVariable(key);
			return defaultValue;
		}

		return variable.value;
	}

	/**
	 * Delete a global variable
	 * @param {string} key - Variable key
	 * @returns {boolean} True if deleted
	 */
	deleteVariable(key) {
		const variable = this.variables.get(key);
		
		if (!variable) {
			return false;
		}

		if (variable.readonly) {
			throw new Error(`Variable '${key}' is readonly and cannot be deleted`);
		}

		const deleted = this.variables.delete(key);
		
		if (deleted) {
			this.triggerEvent('variableDeleted', { key, value: variable.value });
			
			logger.debug('Variable deleted', { key });
		}

		return deleted;
	}

	/**
	 * Check if variable exists
	 * @param {string} key - Variable key
	 * @returns {boolean} True if exists
	 */
	hasVariable(key) {
		return this.variables.has(key);
	}

	/**
	 * Get all variables in namespace
	 * @param {string} namespace - Namespace
	 * @returns {Object} Variables object
	 */
	getNamespaceVariables(namespace = 'default') {
		const result = {};
		
		for (const [key, variable] of this.variables) {
			if (variable.namespace === namespace) {
				result[key] = variable.value;
			}
		}

		return result;
	}

	/**
	 * Clear all variables in namespace
	 * @param {string} namespace - Namespace
	 * @returns {number} Number of variables cleared
	 */
	clearNamespace(namespace = 'default') {
		let cleared = 0;
		
		for (const [key, variable] of this.variables) {
			if (variable.namespace === namespace && !variable.readonly) {
				this.variables.delete(key);
				cleared++;
			}
		}

		if (cleared > 0) {
			this.triggerEvent('namespaceCleard', { namespace, count: cleared });
			
			logger.debug('Namespace cleared', { namespace, count: cleared });
		}

		return cleared;
	}

	/**
	 * Set session data
	 * @param {string} sessionId - Session ID
	 * @param {string} key - Data key
	 * @param {*} value - Data value
	 */
	setSessionData(sessionId, key, value) {
		if (!this.sessionData.has(sessionId)) {
			this.sessionData.set(sessionId, new Map());
		}

		const session = this.sessionData.get(sessionId);
		session.set(key, {
			value,
			timestamp: Date.now()
		});

		logger.debug('Session data set', { sessionId, key, hasValue: value !== undefined });
	}

	/**
	 * Get session data
	 * @param {string} sessionId - Session ID
	 * @param {string} key - Data key
	 * @param {*} defaultValue - Default value
	 * @returns {*} Data value
	 */
	getSessionData(sessionId, key, defaultValue = undefined) {
		const session = this.sessionData.get(sessionId);
		
		if (!session) {
			return defaultValue;
		}

		const data = session.get(key);
		
		if (!data) {
			return defaultValue;
		}

		return data.value;
	}

	/**
	 * Clear session data
	 * @param {string} sessionId - Session ID
	 */
	clearSessionData(sessionId) {
		const cleared = this.sessionData.delete(sessionId);
		
		if (cleared) {
			logger.debug('Session data cleared', { sessionId });
		}
	}

	/**
	 * Get all session IDs
	 * @returns {Array<string>} Session IDs
	 */
	getSessionIds() {
		return Array.from(this.sessionData.keys());
	}

	/**
	 * Cache a value
	 * @param {string} key - Cache key
	 * @param {*} value - Value to cache
	 * @param {number} ttl - Time to live in milliseconds
	 */
	cacheValue(key, value, ttl = 3600000) {
		this.cache.set(key, value);
		
		if (ttl > 0) {
			setTimeout(() => {
				this.cache.delete(key);
			}, ttl);
		}

		logger.debug('Value cached', { key, ttl });
	}

	/**
	 * Get cached value
	 * @param {string} key - Cache key
	 * @param {*} defaultValue - Default value
	 * @returns {*} Cached value
	 */
	getCachedValue(key, defaultValue = undefined) {
		const value = this.cache.get(key);
		return value !== null ? value : defaultValue;
	}

	/**
	 * Clear cache
	 */
	clearCache() {
		this.cache.clear();
		logger.debug('Cache cleared');
	}

	/**
	 * Add event listener
	 * @param {string} event - Event name
	 * @param {Function} callback - Callback function
	 */
	addEventListener(event, callback) {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, new Set());
		}

		this.eventListeners.get(event).add(callback);
		
		logger.debug('Event listener added', { event });
	}

	/**
	 * Remove event listener
	 * @param {string} event - Event name
	 * @param {Function} callback - Callback function
	 */
	removeEventListener(event, callback) {
		const listeners = this.eventListeners.get(event);
		
		if (listeners) {
			listeners.delete(callback);
			
			if (listeners.size === 0) {
				this.eventListeners.delete(event);
			}
		}
	}

	/**
	 * Trigger event
	 * @param {string} event - Event name
	 * @param {*} data - Event data
	 */
	triggerEvent(event, data) {
		const listeners = this.eventListeners.get(event);
		
		if (listeners) {
			for (const callback of listeners) {
				try {
					callback(data);
				} catch (error) {
					logger.error('Error in event listener', { 
						event, 
						error: error.message 
					});
				}
			}
		}
	}

	/**
	 * Get variable metadata
	 * @param {string} key - Variable key
	 * @returns {Object} Variable metadata
	 */
	getVariableMetadata(key) {
		const variable = this.variables.get(key);
		
		if (!variable) {
			return null;
		}

		return {
			key: variable.key,
			namespace: variable.namespace,
			persistent: variable.persistent,
			readonly: variable.readonly,
			sensitive: variable.sensitive,
			ttl: variable.ttl,
			createdAt: variable.createdAt,
			updatedAt: variable.updatedAt,
			hasValue: variable.value !== undefined && variable.value !== null
		};
	}

	/**
	 * Get all variable keys
	 * @param {string} namespace - Optional namespace filter
	 * @returns {Array<string>} Variable keys
	 */
	getVariableKeys(namespace = null) {
		const keys = [];
		
		for (const [key, variable] of this.variables) {
			if (!namespace || variable.namespace === namespace) {
				keys.push(key);
			}
		}

		return keys;
	}

	/**
	 * Export variables to JSON
	 * @param {Object} options - Export options
	 * @returns {string} JSON string
	 */
	exportVariables(options = {}) {
		const {
			namespace = null,
			includeSensitive = false,
			includeReadonly = true,
			includePersistent = true
		} = options;

		const exported = {};

		for (const [key, variable] of this.variables) {
			// Filter by namespace
			if (namespace && variable.namespace !== namespace) {
				continue;
			}

			// Filter by sensitive
			if (variable.sensitive && !includeSensitive) {
				continue;
			}

			// Filter by readonly
			if (variable.readonly && !includeReadonly) {
				continue;
			}

			// Filter by persistent
			if (variable.persistent && !includePersistent) {
				continue;
			}

			exported[key] = {
				value: variable.value,
				namespace: variable.namespace,
				persistent: variable.persistent,
				readonly: variable.readonly,
				createdAt: variable.createdAt,
				updatedAt: variable.updatedAt
			};
		}

		return JSON.stringify(exported, null, 2);
	}

	/**
	 * Import variables from JSON
	 * @param {string} jsonString - JSON string
	 * @param {Object} options - Import options
	 */
	importVariables(jsonString, options = {}) {
		const {
			overwrite = false,
			namespace = null
		} = options;

		try {
			const variables = JSON.parse(jsonString);
			let imported = 0;

			for (const [key, variable] of Object.entries(variables)) {
				// Skip if variable exists and overwrite is false
				if (!overwrite && this.hasVariable(key)) {
					continue;
				}

				// Apply namespace filter
				if (namespace && variable.namespace !== namespace) {
					continue;
				}

				this.setVariable(key, variable.value, {
					persistent: variable.persistent,
					namespace: variable.namespace,
					readonly: variable.readonly
				});

				imported++;
			}

			logger.info('Variables imported', { imported, total: Object.keys(variables).length });
		} catch (error) {
			logger.error('Failed to import variables', { error: error.message });
			throw new Error(`Failed to import variables: ${error.message}`);
		}
	}

	/**
	 * Get statistics
	 * @returns {Object} Statistics
	 */
	getStatistics() {
		const variableStats = {
			total: this.variables.size,
			persistent: 0,
			readonly: 0,
			sensitive: 0,
			namespaces: new Set()
		};

		for (const variable of this.variables.values()) {
			if (variable.persistent) variableStats.persistent++;
			if (variable.readonly) variableStats.readonly++;
			if (variable.sensitive) variableStats.sensitive++;
			variableStats.namespaces.add(variable.namespace);
		}

		return {
			variables: {
				...variableStats,
				namespaces: Array.from(variableStats.namespaces)
			},
			sessions: {
				total: this.sessionData.size,
				ids: Array.from(this.sessionData.keys())
			},
			cache: {
				size: this.cache.size()
			},
			events: {
				types: Array.from(this.eventListeners.keys()),
				totalListeners: Array.from(this.eventListeners.values())
					.reduce((total, listeners) => total + listeners.size, 0)
			}
		};
	}

	/**
	 * Clear all data
	 */
	clear() {
		// Clear non-readonly variables
		for (const [key, variable] of this.variables) {
			if (!variable.readonly) {
				this.variables.delete(key);
			}
		}

		// Clear session data
		this.sessionData.clear();

		// Clear cache
		this.cache.clear();

		// Clear event listeners
		this.eventListeners.clear();

		logger.info('Global variable manager cleared');
	}

	/**
	 * Reset to defaults
	 */
	reset() {
		this.clear();
		this.initializeDefaults();
		
		logger.info('Global variable manager reset to defaults');
	}
}

export default GlobalVariableManager;