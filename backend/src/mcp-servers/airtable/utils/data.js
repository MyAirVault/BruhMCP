/**
 * Data Utilities
 * Utilities for data manipulation, formatting, and transformation
 */

/**
 * Deep clone an object
 * @param {Date} obj - Date object to clone
 * @returns {Date} Cloned date
 */
function cloneDate(obj) {
	return new Date(obj.getTime());
}

/**
 * Deep clone an array
 * @param {Object[]} obj - Array to clone
 * @returns {Object[]} Cloned array
 */
function cloneArray(obj) {
	return obj.map(item => deepClone(item));
}

/**
 * Deep clone a regular expression
 * @param {RegExp} obj - RegExp to clone
 * @returns {RegExp} Cloned regex
 */
function cloneRegExp(obj) {
	return new RegExp(obj);
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (obj instanceof Date) {
		return cloneDate(obj);
	}

	if (Array.isArray(obj)) {
		return cloneArray(obj);
	}

	if (obj instanceof RegExp) {
		return cloneRegExp(obj);
	}

	if (typeof obj === 'object') {
		const cloned = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				(/** @type {Record<string, Object>} */ (cloned))[key] = deepClone(obj[key]);
			}
		}
		return cloned;
	}

	return obj;
}

/**
 * Deep merge objects
 * @template T
 * @param {Record<string, T>} target - Target object
 * @param {...Record<string, T>} sources - Source objects to merge
 * @returns {Record<string, T>} Merged object
 */
function deepMerge(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject((/** @type {Record<string, Object>} */ (source))[key])) {
				if (!(/** @type {Record<string, Object>} */ (target))[key]) Object.assign(target, { [key]: {} });
				deepMerge((/** @type {Record<string, Object>} */ (target))[key], (/** @type {Record<string, Object>} */ (source))[key]);
			} else {
				Object.assign(target, { [key]: (/** @type {Record<string, Object>} */ (source))[key] });
			}
		}
	}

	return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 * @param {Object | null | undefined | string | number | boolean} item - Item to check
 * @returns {boolean} True if object
 */
function isObject(item) {
	return !!(item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Chunk array into smaller arrays
 * @template T
 * @param {Array<T>} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array<Array<T>>} Array of chunks
 */
function chunkArray(array, size) {
	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * Flatten nested array
 * @param {Object[]} arr - Array to flatten
 * @param {number} [depth] - Depth to flatten (default: Infinity)
 * @returns {Object[]} Flattened array
 */
function flattenArray(arr, depth = Infinity) {
	return depth > 0 ? arr.reduce((/** @type {Object[]} */ acc, val) => {
		if (Array.isArray(val)) {
			return acc.concat(flattenArray(val, depth - 1));
		} else {
			return acc.concat([val]);
		}
	}, /** @type {Object[]} */ ([])) : arr.slice();
}

/**
 * Remove duplicates from array
 * @template T
 * @param {Array<T>} array - Array to deduplicate
 * @param {((item: T) => string | number) | null} [keyFn] - Key function for objects
 * @returns {Array<T>} Array without duplicates
 */
function uniqueArray(array, keyFn = null) {
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
 * @param {Object[]} array - Array to group
 * @param {((item: Object) => string) | string} keyFn - Key function or property name
 * @returns {Record<string, Object[]>} Grouped object
 */
function groupBy(array, keyFn) {
	const getKey = typeof keyFn === 'function' ? keyFn : (/** @type {Object} */ item) => (/** @type {Record<string, string>} */ (item))[/** @type {string} */ (keyFn)];
	
	return array.reduce((/** @type {Record<string, Object[]>} */ groups, item) => {
		const key = getKey(item);
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(item);
		return groups;
	}, /** @type {Record<string, Object[]>} */ ({}));
}

/**
 * @typedef {Object} SortKey
 * @property {string | ((item: Object) => string | number)} key - Sort key or function
 * @property {'asc' | 'desc'} [direction] - Sort direction
 */

/**
 * Sort array by multiple keys
 * @template T
 * @param {Array<T>} array - Array to sort
 * @param {Array<SortKey>} sortKeys - Array of sort configurations
 * @returns {Array<T>} Sorted array
 */
function multiSort(array, sortKeys) {
	return array.sort((a, b) => {
		for (const { key, direction = 'asc' } of sortKeys) {
			const aVal = typeof key === 'function' ? key(/** @type {Object} */ (a)) : (/** @type {Record<string, string | number>} */ (a))[/** @type {string} */ (key)];
			const bVal = typeof key === 'function' ? key(/** @type {Object} */ (b)) : (/** @type {Record<string, string | number>} */ (b))[/** @type {string} */ (key)];
			
			if (aVal < bVal) return direction === 'asc' ? -1 : 1;
			if (aVal > bVal) return direction === 'asc' ? 1 : -1;
		}
		return 0;
	});
}

/**
 * Pick specific properties from object
 * @template {Record<string, string | number | boolean | Object>} T
 * @template {keyof T} K
 * @param {T} obj - Source object
 * @param {Array<K>} keys - Keys to pick
 * @returns {Pick<T, K>} Object with picked properties
 */
function pick(obj, keys) {
	/** @type {Partial<T>} */
	const result = {};
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return /** @type {Pick<T, K>} */ (result);
}

/**
 * Omit specific properties from object
 * @template {Record<string, string | number | boolean | Object>} T
 * @template {keyof T} K
 * @param {T} obj - Source object
 * @param {Array<K>} keys - Keys to omit
 * @returns {Omit<T, K>} Object without omitted properties
 */
function omit(obj, keys) {
	const result = { ...obj };
	for (const key of keys) {
		delete result[/** @type {string} */ (key)];
	}
	return result;
}

/**
 * Get nested property value safely
 * @param {Record<string, Object>} obj - Source object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {Object | null} [defaultValue] - Default value if path not found
 * @returns {Object | null | undefined} Property value or default
 */
function get(obj, path, defaultValue) {
	const keys = path.split('.');
	let result = /** @type {Object} */ (obj);
	
	for (const key of keys) {
		if (result == null || typeof result !== 'object') {
			return defaultValue;
		}
		result = /** @type {Object} */ ((/** @type {Record<string, Object>} */ (result))[key]);
	}
	
	return result !== undefined ? result : defaultValue;
}

/**
 * Set nested property value safely
 * @param {Record<string, Object>} obj - Target object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {Object} value - Value to set
 * @returns {Record<string, Object>} Modified object
 */
function set(obj, path, value) {
	const keys = path.split('.');
	const lastKey = keys.pop();
	/** @type {Record<string, Object>} */
	let current = obj;
	
	for (const key of keys) {
		if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
		}
		current = /** @type {Record<string, Object>} */ (current[key]);
	}
	
	if (lastKey) {
		current[lastKey] = value;
	}
	return obj;
}

/**
 * Transform object keys
 * @param {Object | Object[]} obj - Source object
 * @param {(key: string) => string} transformFn - Key transformation function
 * @returns {Object | Object[]} Object with transformed keys
 */
function transformKeys(obj, transformFn) {
	if (Array.isArray(obj)) {
		return obj.map(item => transformKeys(item, transformFn));
	}
	
	if (obj !== null && typeof obj === 'object') {
		/** @type {Record<string, Object>} */
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
function camelToSnake(str) {
	return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
function snakeToCamel(str) {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

module.exports = {
	deepClone,
	deepMerge,
	isObject,
	chunkArray,
	flattenArray,
	uniqueArray,
	groupBy,
	multiSort,
	pick,
	omit,
	get,
	set,
	transformKeys,
	camelToSnake,
	snakeToCamel
};