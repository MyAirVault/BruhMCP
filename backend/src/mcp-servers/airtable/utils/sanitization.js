/**
 * Airtable Sanitization Utilities
 * Data sanitization and security utilities for Airtable operations
 */

// Simple logging for sanitization to avoid circular dependency
const logger = {
  debug: (msg, meta = {}) => console.log(`🔍 AirtableSanitize: ${msg}`, meta),
  warn: (msg, meta = {}) => console.warn(`⚠️ AirtableSanitize: ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`❌ AirtableSanitize: ${msg}`, meta)
};

/**
 * HTML entities to escape
 */
const HTML_ENTITIES = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'/': '&#x2F;'
};

/**
 * SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
	/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
	/(-{2,}|\/\*|\*\/)/g,
	/(;|\||`)/g,
	/(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/gi
];

/**
 * XSS patterns
 */
const XSS_PATTERNS = [
	/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
	/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
	/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
	/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
	/javascript:/gi,
	/on\w+\s*=/gi,
	/expression\s*\(/gi,
	/vbscript:/gi,
	/data:text\/html/gi
];

/**
 * Dangerous file extensions
 */
const DANGEROUS_EXTENSIONS = [
	'.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
	'.msi', '.dll', '.scf', '.lnk', '.inf', '.reg', '.doc', '.docm', '.xls',
	'.xlsm', '.ppt', '.pptm', '.pdf', '.rtf', '.zip', '.rar', '.7z'
];

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string}
 */
export function sanitizeInput(input, options = {}) {
	if (typeof input !== 'string') {
		return input;
	}

	const {
		removeHtml = true,
		removeSqlInjection = true,
		removeXss = true,
		trimWhitespace = true,
		maxLength = 10000,
		allowedChars = null
	} = options;

	let sanitized = input;

	// Trim whitespace
	if (trimWhitespace) {
		sanitized = sanitized.trim();
	}

	// Limit length
	if (maxLength && sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength);
		logger.warn('Input truncated due to length limit', {
			originalLength: input.length,
			maxLength,
			truncated: true
		});
	}

	// Remove HTML tags
	if (removeHtml) {
		sanitized = sanitized.replace(/<[^>]*>/g, '');
	}

	// Remove XSS patterns
	if (removeXss) {
		XSS_PATTERNS.forEach(pattern => {
			sanitized = sanitized.replace(pattern, '');
		});
	}

	// Remove SQL injection patterns
	if (removeSqlInjection) {
		SQL_INJECTION_PATTERNS.forEach(pattern => {
			sanitized = sanitized.replace(pattern, '');
		});
	}

	// Apply allowed characters filter
	if (allowedChars) {
		const allowedPattern = new RegExp(`[^${allowedChars}]`, 'g');
		sanitized = sanitized.replace(allowedPattern, '');
	}

	// Log if sanitization occurred
	if (sanitized !== input) {
		logger.debug('Input sanitized', {
			originalLength: input.length,
			sanitizedLength: sanitized.length,
			modified: true
		});
	}

	return sanitized;
}

/**
 * Escape HTML entities
 * @param {string} input - Input string
 * @returns {string}
 */
export function escapeHtml(input) {
	if (typeof input !== 'string') {
		return input;
	}

	return input.replace(/[&<>"'\/]/g, char => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize Airtable field name
 * @param {string} fieldName - Field name to sanitize
 * @returns {string}
 */
export function sanitizeFieldName(fieldName) {
	if (typeof fieldName !== 'string') {
		throw new Error('Field name must be a string');
	}

	// Remove dangerous characters but keep alphanumeric, spaces, and common punctuation
	const sanitized = sanitizeInput(fieldName, {
		allowedChars: 'a-zA-Z0-9\\s\\-_\\(\\)\\[\\]\\{\\}\\.\\,\\:',
		maxLength: 100
	});

	if (!sanitized) {
		throw new Error('Field name cannot be empty after sanitization');
	}

	return sanitized;
}

/**
 * Sanitize Airtable record fields
 * @param {Record<string, any>} fields - Record fields to sanitize
 * @returns {Record<string, string | number | boolean | string[] | null | undefined>}
 */
export function sanitizeRecordFields(fields) {
	if (!fields || typeof fields !== 'object') {
		throw new Error('Fields must be an object');
	}

	const sanitizedFields = {};

	for (const [key, value] of Object.entries(fields)) {
		// Sanitize field name
		const sanitizedKey = sanitizeFieldName(key);

		// Sanitize field value based on type
		let sanitizedValue;

		if (value === null || value === undefined) {
			sanitizedValue = value;
		} else if (typeof value === 'string') {
			sanitizedValue = sanitizeInput(value, {
				maxLength: 50000 // Airtable's max field length
			});
		} else if (Array.isArray(value)) {
			sanitizedValue = value.map(item => {
				if (typeof item === 'string') {
					return sanitizeInput(item);
				} else if (typeof item === 'object' && item !== null) {
					return sanitizeObject(item);
				}
				return item;
			});
		} else if (typeof value === 'object') {
			sanitizedValue = sanitizeObject(value);
		} else {
			sanitizedValue = value;
		}

		sanitizedFields[sanitizedKey] = sanitizedValue;
	}

	return sanitizedFields;
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {number} depth - Current depth (to prevent infinite recursion)
 * @returns {Object}
 */
export function sanitizeObject(obj, depth = 0) {
	if (depth > 5) {
		logger.warn('Object sanitization depth limit reached');
		return obj;
	}

	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	const sanitized = {};

	for (const [key, value] of Object.entries(obj)) {
		const sanitizedKey = sanitizeInput(key, { maxLength: 100 });

		if (typeof value === 'string') {
			sanitized[sanitizedKey] = sanitizeInput(value);
		} else if (Array.isArray(value)) {
			sanitized[sanitizedKey] = value.map(item => {
				if (typeof item === 'string') {
					return sanitizeInput(item);
				} else if (typeof item === 'object' && item !== null) {
					return sanitizeObject(item, depth + 1);
				}
				return item;
			});
		} else if (typeof value === 'object' && value !== null) {
			sanitized[sanitizedKey] = sanitizeObject(value, depth + 1);
		} else {
			sanitized[sanitizedKey] = value;
		}
	}

	return sanitized;
}

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {string}
 */
export function sanitizeUrl(url) {
	if (typeof url !== 'string') {
		throw new Error('URL must be a string');
	}

	// Remove XSS patterns
	let sanitized = url;
	XSS_PATTERNS.forEach(pattern => {
		sanitized = sanitized.replace(pattern, '');
	});

	// Only allow http/https protocols
	try {
		const urlObj = new URL(sanitized);
		if (!['http:', 'https:'].includes(urlObj.protocol)) {
			throw new Error('Only HTTP and HTTPS protocols are allowed');
		}
		return urlObj.toString();
	} catch (error) {
		throw new Error(`Invalid URL: ${error.message}`);
	}
}

/**
 * Sanitize file name
 * @param {string} fileName - File name to sanitize
 * @returns {string}
 */
export function sanitizeFileName(fileName) {
	if (typeof fileName !== 'string') {
		throw new Error('File name must be a string');
	}

	// Remove path traversal patterns
	let sanitized = fileName.replace(/\.\./g, '');
	
	// Remove dangerous characters
	sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');
	
	// Limit length
	if (sanitized.length > 255) {
		sanitized = sanitized.substring(0, 255);
	}

	// Check for dangerous extensions
	const extension = sanitized.toLowerCase().substring(sanitized.lastIndexOf('.'));
	if (DANGEROUS_EXTENSIONS.includes(extension)) {
		throw new Error(`File extension '${extension}' is not allowed`);
	}

	if (!sanitized) {
		throw new Error('File name cannot be empty after sanitization');
	}

	return sanitized;
}

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string}
 */
export function sanitizeEmail(email) {
	if (typeof email !== 'string') {
		throw new Error('Email must be a string');
	}

	// Basic email sanitization
	const sanitized = email.toLowerCase().trim();
	
	// Remove potential XSS
	const cleaned = sanitizeInput(sanitized, {
		removeHtml: true,
		removeXss: true,
		removeSqlInjection: true
	});

	// Basic email format validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(cleaned)) {
		throw new Error('Invalid email format');
	}

	return cleaned;
}

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string}
 */
export function sanitizePhoneNumber(phone) {
	if (typeof phone !== 'string') {
		throw new Error('Phone number must be a string');
	}

	// Remove non-numeric characters except + and spaces
	const sanitized = phone.replace(/[^\d\+\s\-\(\)]/g, '');
	
	return sanitized.trim();
}

/**
 * Sanitize formula
 * @param {string} formula - Airtable formula to sanitize
 * @returns {string}
 */
export function sanitizeFormula(formula) {
	if (typeof formula !== 'string') {
		throw new Error('Formula must be a string');
	}

	// Remove potentially dangerous patterns
	let sanitized = formula;
	
	// Remove script tags and other XSS patterns
	XSS_PATTERNS.forEach(pattern => {
		sanitized = sanitized.replace(pattern, '');
	});

	// Remove SQL injection patterns
	SQL_INJECTION_PATTERNS.forEach(pattern => {
		sanitized = sanitized.replace(pattern, '');
	});

	// Limit length
	if (sanitized.length > 1000) {
		sanitized = sanitized.substring(0, 1000);
		logger.warn('Formula truncated due to length limit');
	}

	return sanitized;
}

/**
 * Sanitize query parameters
 * @param {Record<string, any>} params - Query parameters to sanitize
 * @returns {Record<string, string | number | boolean | string[] | null | undefined>}
 */
export function sanitizeQueryParams(params) {
	if (!params || typeof params !== 'object') {
		return params;
	}

	const sanitized = {};

	for (const [key, value] of Object.entries(params)) {
		const sanitizedKey = sanitizeInput(key, { maxLength: 100 });

		if (typeof value === 'string') {
			sanitized[sanitizedKey] = sanitizeInput(value);
		} else if (Array.isArray(value)) {
			sanitized[sanitizedKey] = value.map(item => {
				return typeof item === 'string' ? sanitizeInput(item) : item;
			});
		} else {
			sanitized[sanitizedKey] = value;
		}
	}

	return sanitized;
}

/**
 * Check if input contains malicious patterns
 * @param {string} input - Input to check
 * @returns {boolean}
 */
export function containsMaliciousPatterns(input) {
	if (typeof input !== 'string') {
		return false;
	}

	// Check for XSS patterns
	for (const pattern of XSS_PATTERNS) {
		if (pattern.test(input)) {
			logger.warn('Malicious XSS pattern detected', { pattern: pattern.toString() });
			return true;
		}
	}

	// Check for SQL injection patterns
	for (const pattern of SQL_INJECTION_PATTERNS) {
		if (pattern.test(input)) {
			logger.warn('Malicious SQL injection pattern detected', { pattern: pattern.toString() });
			return true;
		}
	}

	return false;
}

/**
 * Sanitize for logging (remove sensitive information)
 * @param {any} data - Data to sanitize for logging
 * @returns {any}
 */
export function sanitizeForLogging(data) {
	if (typeof data !== 'object' || data === null) {
		return data;
	}

	const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
	const sanitized = Array.isArray(data) ? [] : {};

	for (const [key, value] of Object.entries(data)) {
		const lowerKey = key.toLowerCase();
		const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));

		if (isSensitive) {
			sanitized[key] = '[REDACTED]';
		} else if (typeof value === 'object' && value !== null) {
			sanitized[key] = sanitizeForLogging(value);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
}

/**
 * Create sanitization report
 * @param {string} original - Original input
 * @param {string} sanitized - Sanitized input
 * @returns {Object}
 */
export function createSanitizationReport(original, sanitized) {
	return {
		originalLength: original.length,
		sanitizedLength: sanitized.length,
		modified: original !== sanitized,
		modificationRatio: original.length > 0 ? (original.length - sanitized.length) / original.length : 0,
		timestamp: new Date().toISOString()
	};
}

/**
 * Batch sanitize multiple inputs
 * @param {Array} inputs - Array of inputs to sanitize
 * @param {Function} sanitizer - Sanitization function
 * @returns {Array}
 */
export function batchSanitize(inputs, sanitizer = sanitizeInput) {
	if (!Array.isArray(inputs)) {
		throw new Error('Inputs must be an array');
	}

	const results = [];
	const errors = [];

	for (let i = 0; i < inputs.length; i++) {
		try {
			results.push(sanitizer(inputs[i]));
		} catch (error) {
			errors.push({ index: i, error: error.message });
			results.push(null);
		}
	}

	if (errors.length > 0) {
		logger.warn('Batch sanitization errors', { errors });
	}

	return results;
}

/**
 * Default export
 */
export default {
	sanitizeInput,
	escapeHtml,
	sanitizeFieldName,
	sanitizeRecordFields,
	sanitizeObject,
	sanitizeUrl,
	sanitizeFileName,
	sanitizeEmail,
	sanitizePhoneNumber,
	sanitizeFormula,
	sanitizeQueryParams,
	containsMaliciousPatterns,
	sanitizeForLogging,
	createSanitizationReport,
	batchSanitize
};