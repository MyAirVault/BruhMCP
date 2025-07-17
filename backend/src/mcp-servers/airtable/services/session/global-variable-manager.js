/**
 * Global Variable Manager
 * Manages global variables and configuration for Airtable operations
 */

import { createLogger } from '../../utils/logger.js';
import { deepClone } from '../../utils/common.js';

const logger = createLogger('GlobalVariableManager');

export class GlobalVariableManager {
	constructor() {
		this.variables = new Map();
		this.watchers = new Map();
		this.defaultVariables = {
			maxRecordsPerPage: 100,
			maxBatchSize: 10,
			defaultTimeout: 30000,
			retryAttempts: 3,
			cacheTimeout: 300000, // 5 minutes
			rateLimitDelay: 200, // 5 requests per second
			optimizeResponses: true,
			simplifyResponses: true,
			enableMetrics: true,
			logLevel: 'info'
		};

		this.initialize();
	}

	/**
	 * Initialize with default variables
	 */
	initialize() {
		for (const [key, value] of Object.entries(this.defaultVariables)) {
			this.variables.set(key, value);
		}

		logger.info('Global variable manager initialized', {
			variableCount: this.variables.size
		});
	}

	/**
	 * Get variable value
	 * @param {string} key - Variable key
	 * @param {any} defaultValue - Default value if not found
	 * @returns {any} Variable value
	 */
	get(key, defaultValue = undefined) {
		const value = this.variables.get(key);
		
		if (value === undefined) {
			if (defaultValue !== undefined) {
				logger.debug('Variable not found, using default', { key, defaultValue });
				return defaultValue;
			}
			logger.warn('Variable not found', { key });
			return undefined;
		}

		return deepClone(value);
	}

	/**
	 * Set variable value
	 * @param {string} key - Variable key
	 * @param {any} value - Variable value
	 * @param {Object} options - Set options
	 */
	set(key, value, options = {}) {
		const { notify = true, validate = true } = options;

		// Validate value if requested
		if (validate && !this.validateValue(key, value)) {
			throw new Error(`Invalid value for variable ${key}: ${value}`);
		}

		const oldValue = this.variables.get(key);
		this.variables.set(key, deepClone(value));

		logger.debug('Variable set', { key, value, oldValue });

		// Notify watchers
		if (notify) {
			this.notifyWatchers(key, value, oldValue);
		}
	}

	/**
	 * Set multiple variables
	 * @param {Object} vars - Variables object
	 * @param {Object} options - Set options
	 */
	setMany(vars, options = {}) {
		const { notify = true, validate = true } = options;

		for (const [key, value] of Object.entries(vars)) {
			this.set(key, value, { notify: false, validate });
		}

		if (notify) {
			// Notify all watchers after all variables are set
			for (const [key, value] of Object.entries(vars)) {
				this.notifyWatchers(key, value, undefined);
			}
		}
	}

	/**
	 * Delete variable
	 * @param {string} key - Variable key
	 * @returns {boolean} True if deleted
	 */
	delete(key) {
		const existed = this.variables.has(key);
		
		if (existed) {
			const oldValue = this.variables.get(key);
			this.variables.delete(key);
			
			logger.debug('Variable deleted', { key, oldValue });
			
			// Notify watchers
			this.notifyWatchers(key, undefined, oldValue);
		}

		return existed;
	}

	/**
	 * Check if variable exists
	 * @param {string} key - Variable key
	 * @returns {boolean} True if exists
	 */
	has(key) {
		return this.variables.has(key);
	}

	/**
	 * Get all variables
	 * @returns {Object} All variables
	 */
	getAll() {
		const all = {};
		for (const [key, value] of this.variables) {
			all[key] = deepClone(value);
		}
		return all;
	}

	/**
	 * Get variable keys
	 * @returns {Array} Array of keys
	 */
	getKeys() {
		return Array.from(this.variables.keys());
	}

	/**
	 * Clear all variables
	 */
	clear() {
		const keys = this.getKeys();
		this.variables.clear();
		
		logger.info('All variables cleared', { keysCleared: keys.length });

		// Notify watchers
		for (const key of keys) {
			this.notifyWatchers(key, undefined, undefined);
		}
	}

	/**
	 * Reset to default variables
	 */
	reset() {
		this.clear();
		this.initialize();
		
		logger.info('Variables reset to defaults');
	}

	/**
	 * Watch variable changes
	 * @param {string} key - Variable key to watch
	 * @param {Function} callback - Callback function
	 * @returns {string} Watcher ID
	 */
	watch(key, callback) {
		if (typeof callback !== 'function') {
			throw new Error('Callback must be a function');
		}

		const watcherId = `${key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		if (!this.watchers.has(key)) {
			this.watchers.set(key, new Map());
		}

		this.watchers.get(key).set(watcherId, callback);

		logger.debug('Variable watcher added', { key, watcherId });

		return watcherId;
	}

	/**
	 * Unwatch variable changes
	 * @param {string} key - Variable key
	 * @param {string} watcherId - Watcher ID
	 * @returns {boolean} True if unwatched
	 */
	unwatch(key, watcherId) {
		if (!this.watchers.has(key)) {
			return false;
		}

		const keyWatchers = this.watchers.get(key);
		const existed = keyWatchers.delete(watcherId);

		if (keyWatchers.size === 0) {
			this.watchers.delete(key);
		}

		if (existed) {
			logger.debug('Variable watcher removed', { key, watcherId });
		}

		return existed;
	}

	/**
	 * Notify watchers of variable change
	 * @param {string} key - Variable key
	 * @param {any} newValue - New value
	 * @param {any} oldValue - Old value
	 */
	notifyWatchers(key, newValue, oldValue) {
		if (!this.watchers.has(key)) {
			return;
		}

		const keyWatchers = this.watchers.get(key);
		
		for (const [watcherId, callback] of keyWatchers) {
			try {
				callback(newValue, oldValue, key);
			} catch (error) {
				logger.error('Watcher callback error', {
					key,
					watcherId,
					error: error.message
				});
			}
		}
	}

	/**
	 * Validate variable value
	 * @param {string} key - Variable key
	 * @param {any} value - Value to validate
	 * @returns {boolean} True if valid
	 */
	validateValue(key, value) {
		const validators = {
			maxRecordsPerPage: (val) => Number.isInteger(val) && val > 0 && val <= 100,
			maxBatchSize: (val) => Number.isInteger(val) && val > 0 && val <= 10,
			defaultTimeout: (val) => Number.isInteger(val) && val > 0,
			retryAttempts: (val) => Number.isInteger(val) && val >= 0,
			cacheTimeout: (val) => Number.isInteger(val) && val >= 0,
			rateLimitDelay: (val) => Number.isInteger(val) && val >= 0,
			optimizeResponses: (val) => typeof val === 'boolean',
			simplifyResponses: (val) => typeof val === 'boolean',
			enableMetrics: (val) => typeof val === 'boolean',
			logLevel: (val) => ['debug', 'info', 'warn', 'error'].includes(val)
		};

		const validator = validators[key];
		if (!validator) {
			// No validator, assume valid
			return true;
		}

		const isValid = validator(value);
		if (!isValid) {
			logger.warn('Variable validation failed', { key, value });
		}

		return isValid;
	}

	/**
	 * Get configuration object for specific component
	 * @param {string} component - Component name
	 * @returns {Object} Configuration object
	 */
	getConfig(component) {
		const config = {};

		switch (component) {
			case 'api':
				config.timeout = this.get('defaultTimeout');
				config.retryAttempts = this.get('retryAttempts');
				config.rateLimitDelay = this.get('rateLimitDelay');
				break;

			case 'cache':
				config.timeout = this.get('cacheTimeout');
				config.enabled = this.get('cacheTimeout') > 0;
				break;

			case 'optimization':
				config.enabled = this.get('optimizeResponses');
				config.simplify = this.get('simplifyResponses');
				break;

			case 'pagination':
				config.maxRecordsPerPage = this.get('maxRecordsPerPage');
				config.maxBatchSize = this.get('maxBatchSize');
				break;

			case 'logging':
				config.level = this.get('logLevel');
				config.enableMetrics = this.get('enableMetrics');
				break;

			default:
				logger.warn('Unknown component configuration requested', { component });
				break;
		}

		return config;
	}

	/**
	 * Create scoped variable manager
	 * @param {string} scope - Scope name
	 * @returns {Object} Scoped manager
	 */
	createScope(scope) {
		const scopedManager = {
			get: (key, defaultValue) => this.get(`${scope}.${key}`, defaultValue),
			set: (key, value, options) => this.set(`${scope}.${key}`, value, options),
			delete: (key) => this.delete(`${scope}.${key}`),
			has: (key) => this.has(`${scope}.${key}`),
			watch: (key, callback) => this.watch(`${scope}.${key}`, callback),
			unwatch: (key, watcherId) => this.unwatch(`${scope}.${key}`, watcherId)
		};

		logger.debug('Scoped variable manager created', { scope });

		return scopedManager;
	}

	/**
	 * Import variables from object
	 * @param {Object} vars - Variables to import
	 * @param {Object} options - Import options
	 */
	import(vars, options = {}) {
		const { merge = true, validate = true } = options;

		if (!merge) {
			this.clear();
		}

		for (const [key, value] of Object.entries(vars)) {
			try {
				this.set(key, value, { notify: false, validate });
			} catch (error) {
				logger.error('Failed to import variable', { key, value, error: error.message });
			}
		}

		logger.info('Variables imported', { 
			importCount: Object.keys(vars).length,
			merged: merge
		});
	}

	/**
	 * Export variables to object
	 * @param {Array} keys - Keys to export (optional)
	 * @returns {Object} Exported variables
	 */
	export(keys = null) {
		const exported = {};
		const keysToExport = keys || this.getKeys();

		for (const key of keysToExport) {
			if (this.has(key)) {
				exported[key] = this.get(key);
			}
		}

		logger.debug('Variables exported', { exportCount: Object.keys(exported).length });

		return exported;
	}

	/**
	 * Get variable statistics
	 * @returns {Object} Statistics
	 */
	getStats() {
		return {
			totalVariables: this.variables.size,
			totalWatchers: Array.from(this.watchers.values()).reduce((sum, watchers) => sum + watchers.size, 0),
			watchedVariables: this.watchers.size,
			memoryUsage: this.calculateMemoryUsage()
		};
	}

	/**
	 * Calculate rough memory usage
	 * @returns {number} Memory usage in bytes
	 */
	calculateMemoryUsage() {
		try {
			const data = {
				variables: this.getAll(),
				watchers: this.watchers.size
			};
			return JSON.stringify(data).length;
		} catch (error) {
			logger.warn('Failed to calculate memory usage', { error: error.message });
			return 0;
		}
	}
}