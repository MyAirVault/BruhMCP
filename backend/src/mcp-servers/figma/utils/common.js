/**
 * Common utilities * Handles color parsing, variable generation, validation, and common operations
 */

const fs = require('fs');
const { existsSync, constants } = require('fs');
const { join } = require('path');
const { axiosGet } = require('../../../utils/axiosUtils.js');

/**
 * Download Figma image and save it locally * @param {string} fileName - The filename to save as
 * @param {string} localPath - The local path to save to
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} Full file path where the image was saved
 */
async function downloadFigmaImage(fileName, localPath, imageUrl) {
	try {
		// Ensure local path exists with proper error handling
		try {
			if (!existsSync(localPath)) {
				await fs.promises.mkdir(localPath, { recursive: true });
			}
		} catch (dirError) {
			const errorMessage = dirError instanceof Error ? dirError.message : String(dirError);
			throw new Error(`Failed to create directory ${localPath}: ${errorMessage}`);
		}

		// Build the complete file path
		const fullPath = join(localPath, fileName);
		
		// Check if we can write to the directory
		try {
			await fs.promises.access(localPath, constants.W_OK);
		} catch (accessError) {
			const errorMessage = accessError instanceof Error ? accessError.message : String(accessError);
			throw new Error(`No write permission for directory ${localPath}: ${errorMessage}`);
		}

		// Use axios to download the image
		const response = await axiosGet(imageUrl, {
			responseType: 'arraybuffer'
		});

		// Convert response data to buffer
		const buffer = Buffer.from(response.data);
		
		// Write the buffer to file
		await fs.promises.writeFile(fullPath, buffer);
		
		return fullPath;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Error downloading image: ${errorMessage}`);
	}
}

/**
 * Remove keys with empty arrays or empty objects from an object * @param {any} input - The input object or value
 * @returns {any} The processed object or the original value
 */
function removeEmptyKeys(input) {
	// If not an object type or null, return directly
	if (typeof input !== "object" || input === null) {
		return input;
	}

	// Handle array type
	if (Array.isArray(input)) {
		return input.map((item) => removeEmptyKeys(item));
	}

	// Handle object type
	/** @type {Record<string, any>} */
	const result = {};
	for (const key in input) {
		if (Object.prototype.hasOwnProperty.call(input, key)) {
			const value = input[key];

			// Recursively process nested objects
			const cleanedValue = removeEmptyKeys(value);

			// Skip empty arrays and empty objects
			if (
				cleanedValue !== undefined &&
				!(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
				!(
					typeof cleanedValue === "object" &&
					cleanedValue !== null &&
					Object.keys(cleanedValue).length === 0
				)
			) {
				result[key] = cleanedValue;
			}
		}
	}

	return result;
}

/**
 * Convert hex color value and opacity to rgba format * @param {string} hex - Hexadecimal color value (e.g., "#FF0000" or "#F00")
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} Color string in rgba format
 */
function hexToRgba(hex, opacity = 1) {
	// Remove possible # prefix
	hex = hex.replace("#", "");

	// Handle shorthand hex values (e.g., #FFF)
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	// Convert hex to RGB values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Ensure opacity is in the 0-1 range
	const validOpacity = Math.min(Math.max(opacity, 0), 1);

	return `rgba(${r}, ${g}, ${b}, ${validOpacity})`;
}

/**
 * Convert color from RGBA to { hex, opacity }
 * @param {{ r: number, g: number, b: number, a: number }} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {{ hex: string, opacity: number }} The converted color
 */
function convertColor(color, opacity = 1) {
	const r = Math.round(color.r * 255);
	const g = Math.round(color.g * 255);
	const b = Math.round(color.b * 255);

	// Alpha channel defaults to 1. If opacity and alpha are both and < 1, their effects are multiplicative
	const a = Math.round(opacity * color.a * 100) / 100;

	const hex = ("#" +
		((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase());

	return { hex, opacity: a };
}

/**
 * Convert color from Figma RGBA to rgba(#, #, #, #) CSS format
 * @param {{ r: number, g: number, b: number, a: number }} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {string} The converted color
 */
function formatRGBAColor(color, opacity = 1) {
	const r = Math.round(color.r * 255);
	const g = Math.round(color.g * 255);
	const b = Math.round(color.b * 255);
	// Alpha channel defaults to 1. If opacity and alpha are both and < 1, their effects are multiplicative
	const a = Math.round(opacity * color.a * 100) / 100;

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Generate a 6-character random variable ID * @param {string} prefix - ID prefix
 * @returns {string} A 6-character random ID string with prefix
 */
function generateVarId(prefix = "var") {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";

	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		result += chars[randomIndex];
	}

	return `${prefix}_${result}`;
}

/**
 * Generate a CSS shorthand for values that come with top, right, bottom, and left
 * @param {{ top: number, right: number, bottom: number, left: number }} values - The values to generate the shorthand for
 * @param {{ ignoreZero?: boolean, suffix?: string }} options - Options for generation
 * @returns {string|undefined} The generated shorthand
 */
function generateCSSShorthand(values, options = {}) {
	const { ignoreZero = true, suffix = "px" } = options;
	const { top, right, bottom, left } = values;
	
	if (ignoreZero && top === 0 && right === 0 && bottom === 0 && left === 0) {
		return undefined;
	}
	if (top === right && right === bottom && bottom === left) {
		return `${top}${suffix}`;
	}
	if (right === left) {
		if (top === bottom) {
			return `${top}${suffix} ${right}${suffix}`;
		}
		return `${top}${suffix} ${right}${suffix} ${bottom}${suffix}`;
	}
	return `${top}${suffix} ${right}${suffix} ${bottom}${suffix} ${left}${suffix}`;
}

/**
 * Convert a Figma paint (solid, image, gradient) to a SimplifiedFill
 * @param {{ type: string, imageRef?: string, scaleMode?: string, color?: { r: number, g: number, b: number, a: number }, opacity?: number, gradientHandlePositions?: any[], gradientStops?: Array<{ position: number, color: { r: number, g: number, b: number, a: number } }> }} raw - The Figma paint to convert
 * @returns {string | { type: string, imageRef?: string, scaleMode?: string, gradientHandlePositions?: any[], gradientStops?: Array<{ position: number, color: { hex: string, opacity: number } }> }} The converted SimplifiedFill
 */
function parsePaint(raw) {
	if (raw.type === "IMAGE") {
		return {
			type: "IMAGE",
			imageRef: raw.imageRef,
			scaleMode: raw.scaleMode,
		};
	} else if (raw.type === "SOLID") {
		// treat as SOLID
		if (!raw.color) {
			throw new Error('SOLID paint missing color property');
		}
		const { hex, opacity } = convertColor(raw.color, raw.opacity);
		if (opacity === 1) {
			return hex;
		} else {
			return formatRGBAColor(raw.color, opacity);
		}
	} else if (
		["GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"].includes(
			raw.type,
		)
	) {
		// treat as GRADIENT_LINEAR
		if (!raw.gradientStops) {
			throw new Error('Gradient paint missing gradientStops property');
		}
		return {
			type: raw.type,
			gradientHandlePositions: raw.gradientHandlePositions,
			gradientStops: raw.gradientStops.map(({ position, color }) => ({
				position,
				color: convertColor(color),
			})),
		};
	} else {
		throw new Error(`Unknown paint type: ${raw.type}`);
	}
}

/**
 * Check if an element is visible
 * @param {{ visible?: boolean }} element - The item to check
 * @returns {boolean} True if the item is visible, false otherwise
 */
function isVisible(element) {
	return element.visible ?? true;
}

/**
 * Rounds a number to two decimal places, suitable for pixel value processing * @param {number} num - The number to be rounded
 * @returns {number} The rounded number with two decimal places
 */
function pixelRound(num) {
	if (isNaN(num)) {
		throw new TypeError(`Input must be a valid number`);
	}
	return Number(Number(num).toFixed(2));
}


/**
 * Create a valid variable key from a component name
 * @param {string} name - Component name to convert
 * @returns {string} Valid variable key
 */
function createVariableKey(name) {
	if (!name || typeof name !== 'string') {
		return 'unnamed';
	}

	// Convert to camelCase and remove invalid characters
	return name
		.trim()
		.replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
		.split(/\s+/) // Split on whitespace
		.map((word, index) => {
			if (index === 0) {
				return word.toLowerCase();
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join('')
		.replace(/^[^a-zA-Z_$]/, '_') // Ensure starts with valid character
		|| 'unnamed'; // Fallback if empty
}


/**
 * Check if a value exists and is not null/undefined
 * @param {any} value - Value to check
 * @returns {boolean} True if value exists
 */
function hasValue(value) {
	return value !== null && value !== undefined;
}
module.exports = {
	downloadFigmaImage,
	removeEmptyKeys,
	hexToRgba,
	convertColor,
	formatRGBAColor,
	generateVarId,
	generateCSSShorthand,
	parsePaint,
	isVisible,
	pixelRound,
	createVariableKey,
	hasValue
};