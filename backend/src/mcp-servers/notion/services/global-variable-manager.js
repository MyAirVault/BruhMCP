/**
 * Global Variable Manager for Figma Response Deduplication
 * Reduces response size through variable extraction
 */

import crypto from 'crypto';

/**
 * Manages global variables for deduplicating repeated content in Figma responses
 */
class GlobalVariableManager {
	constructor() {
		this.variables = {
			styles: {},
			fills: {},
			strokes: {},
			effects: {},
			layouts: {},
			textStyles: {},
		};
		this.counters = {
			style: 0,
			fill: 0,
			stroke: 0,
			effect: 0,
			layout: 0,
			textStyle: 0,
		};
	}

	/**
	 * Find existing variable or create new one for given value
	 * @param {any} value - Value to store or find
	 * @param {string} prefix - Variable type prefix
	 * @returns {string} Variable ID
	 */
	findOrCreateVariable(value, prefix) {
		if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
			return null;
		}

		// Generate hash for the value to check for duplicates
		const valueHash = this.generateHash(value);

		// Check if we already have this value
		const existingVariable = this.findExistingVariable(valueHash, prefix);
		if (existingVariable) {
			return existingVariable;
		}

		// Create new variable
		const variableId = this.generateVariableId(prefix);
		this.storeVariable(variableId, value, prefix, valueHash);

		return variableId;
	}

	/**
	 * Find existing variable by hash
	 * @param {string} hash - Value hash
	 * @param {string} prefix - Variable type prefix
	 * @returns {string|null} Variable ID if found
	 */
	findExistingVariable(hash, prefix) {
		const categoryName = this.getCategoryName(prefix);
		const category = this.variables[categoryName];

		for (const [varId, data] of Object.entries(category)) {
			if (data._hash === hash) {
				return varId;
			}
		}

		return null;
	}

	/**
	 * Store variable in appropriate category
	 * @param {string} variableId - Variable ID
	 * @param {any} value - Value to store
	 * @param {string} prefix - Variable type prefix
	 * @param {string} hash - Value hash
	 */
	storeVariable(variableId, value, prefix, hash) {
		const categoryName = this.getCategoryName(prefix);

		this.variables[categoryName][variableId] = {
			...value,
			_hash: hash,
			_type: prefix,
		};
	}

	/**
	 * Generate unique variable ID
	 * @param {string} prefix - Variable type prefix
	 * @returns {string} Variable ID
	 */
	generateVariableId(prefix) {
		this.counters[prefix] = (this.counters[prefix] || 0) + 1;
		return `${prefix}_${this.counters[prefix]}`;
	}

	/**
	 * Generate hash for value deduplication
	 * @param {any} value - Value to hash
	 * @returns {string} Hash string
	 */
	generateHash(value) {
		const normalizedValue = this.normalizeValue(value);
		return crypto.createHash('md5').update(JSON.stringify(normalizedValue)).digest('hex');
	}

	/**
	 * Normalize value for consistent hashing
	 * @param {any} value - Value to normalize
	 * @returns {any} Normalized value
	 */
	normalizeValue(value) {
		if (Array.isArray(value)) {
			return value.map(item => this.normalizeValue(item));
		}

		if (value && typeof value === 'object') {
			const normalized = {};
			// Sort keys for consistent hashing
			Object.keys(value)
				.sort()
				.forEach(key => {
					if (key.startsWith('_')) return; // Skip internal properties
					normalized[key] = this.normalizeValue(value[key]);
				});
			return normalized;
		}

		return value;
	}

	/**
	 * Get category name for variable type
	 * @param {string} prefix - Variable type prefix
	 * @returns {string} Category name
	 */
	getCategoryName(prefix) {
		const categoryMap = {
			style: 'textStyles',
			fill: 'fills',
			stroke: 'strokes',
			effect: 'effects',
			layout: 'layouts',
			textStyle: 'textStyles',
		};
		return categoryMap[prefix] || 'styles';
	}

	/**
	 * Get variable by ID
	 * @param {string} variableId - Variable ID
	 * @returns {any} Variable value
	 */
	getVariable(variableId) {
		for (const category of Object.values(this.variables)) {
			if (category[variableId]) {
				const { _hash, _type, ...value } = category[variableId];
				return value;
			}
		}
		return null;
	}

	/**
	 * Get all variables organized by category
	 * @returns {object} All variables
	 */
	getAllVariables() {
		const result = {};

		for (const [categoryName, category] of Object.entries(this.variables)) {
			if (Object.keys(category).length > 0) {
				result[categoryName] = {};
				for (const [varId, data] of Object.entries(category)) {
					const { _hash, _type, ...value } = data;
					result[categoryName][varId] = value;
				}
			}
		}

		return result;
	}

	/**
	 * Get statistics about variable usage
	 * @returns {object} Usage statistics
	 */
	getStatistics() {
		const stats = {
			totalVariables: 0,
			categoryCounts: {},
			estimatedSavings: 0,
		};

		for (const [categoryName, category] of Object.entries(this.variables)) {
			const count = Object.keys(category).length;
			stats.categoryCounts[categoryName] = count;
			stats.totalVariables += count;
		}

		return stats;
	}

	/**
	 * Clear all variables
	 */
	clear() {
		this.variables = {
			styles: {},
			fills: {},
			strokes: {},
			effects: {},
			layouts: {},
			textStyles: {},
		};
		this.counters = {
			style: 0,
			fill: 0,
			stroke: 0,
			effect: 0,
			layout: 0,
			textStyle: 0,
		};
	}
}

export { GlobalVariableManager };
