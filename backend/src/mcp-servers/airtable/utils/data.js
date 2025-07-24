/**
 * Data Utilities
 * Utilities for data manipulation, formatting, and transformation
 */

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime());
	}

	if (obj instanceof Array) {
		return obj.map(item => deepClone(item));
	}

	if (obj instanceof RegExp) {
		return new RegExp(obj);
	}

	if (typeof obj === 'object') {
		const cloned = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				cloned[key] = deepClone(obj[key]);
			}
		}
		return cloned;
	}

	return obj;
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects to merge
 * @returns {Object} Merged object
 */
export function deepMerge(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				deepMerge(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}

	return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 * @param {any} item - Item to check
 * @returns {boolean} True if object
 */
export function isObject(item) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array[]} Array of chunks
 */
export function chunkArray(array, size) {
	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * Flatten nested array
 * @param {Array} arr - Array to flatten
 * @param {number} [depth] - Depth to flatten (default: Infinity)
 * @returns {Array} Flattened array
 */
export function flattenArray(arr, depth = Infinity) {
	return depth > 0 ? arr.reduce((acc, val) => 
		acc.concat(Array.isArray(val) ? flattenArray(val, depth - 1) : val), [])
		: arr.slice();
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array to deduplicate
 * @param {Function} [keyFn] - Key function for objects
 * @returns {Array} Array without duplicates
 */
export function uniqueArray(array, keyFn = null) {
	if (!keyFn) {
		return Array.from(new Set(array));
	}

	const seen = new Set();
	return array.filter(item => {
		const key = keyFn(item);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

/**
 * Group array items by key
 * @param {Array} array - Array to group
 * @param {Function|string} keyFn - Key function or property name
 * @returns {Object} Grouped object
 */
export function groupBy(array, keyFn) {
	const getKey = typeof keyFn === 'function' ? keyFn : item => item[keyFn];
	
	return array.reduce((groups, item) => {
		const key = getKey(item);
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(item);
		return groups;
	}, {});
}

/**
 * Sort array by multiple keys
 * @param {Array} array - Array to sort
 * @param {Array} sortKeys - Array of sort configurations
 * @returns {Array} Sorted array
 */
export function multiSort(array, sortKeys) {
	return array.sort((a, b) => {
		for (const { key, direction = 'asc' } of sortKeys) {
			const aVal = typeof key === 'function' ? key(a) : a[key];
			const bVal = typeof key === 'function' ? key(b) : b[key];
			
			if (aVal < bVal) return direction === 'asc' ? -1 : 1;
			if (aVal > bVal) return direction === 'asc' ? 1 : -1;
		}
		return 0;
	});
}

/**
 * Pick specific properties from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to pick
 * @returns {Object} Object with picked properties
 */
export function pick(obj, keys) {
	const result = {};
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return result;
}

/**
 * Omit specific properties from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to omit
 * @returns {Object} Object without omitted properties
 */
export function omit(obj, keys) {
	const result = { ...obj };
	for (const key of keys) {
		delete result[key];
	}
	return result;
}

/**
 * Get nested property value safely
 * @param {Object} obj - Source object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Property value or default
 */
export function get(obj, path, defaultValue = undefined) {
	const keys = path.split('.');
	let result = obj;
	
	for (const key of keys) {
		if (result == null || typeof result !== 'object') {
			return defaultValue;
		}
		result = result[key];
	}
	
	return result !== undefined ? result : defaultValue;
}

/**
 * Set nested property value safely
 * @param {Object} obj - Target object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} value - Value to set
 * @returns {Object} Modified object
 */
export function set(obj, path, value) {
	const keys = path.split('.');
	const lastKey = keys.pop();
	let current = obj;
	
	for (const key of keys) {
		if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
		}
		current = current[key];
	}
	
	current[lastKey] = value;
	return obj;
}

/**
 * Transform object keys
 * @param {Object} obj - Source object
 * @param {Function} transformFn - Key transformation function
 * @returns {Object} Object with transformed keys
 */
export function transformKeys(obj, transformFn) {
	if (Array.isArray(obj)) {
		return obj.map(item => transformKeys(item, transformFn));
	}
	
	if (obj !== null && typeof obj === 'object') {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			const newKey = transformFn(key);
			result[newKey] = transformKeys(value, transformFn);
		}
		return result;
	}
	
	return obj;
}

/**
 * Convert camelCase to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
export function camelToSnake(str) {
	return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export function snakeToCamel(str) {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}