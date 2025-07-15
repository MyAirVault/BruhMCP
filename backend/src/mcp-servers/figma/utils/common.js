/**
 * Common utilities - Matches Figma-Context-MCP common.ts functionality exactly
 * Handles color parsing, variable generation, validation, and common operations
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

/**
 * Download Figma image and save it locally (matching Figma-Context-MCP exactly)
 * @param {string} fileName - The filename to save as
 * @param {string} localPath - The local path to save to
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} Full file path where the image was saved
 */
export async function downloadFigmaImage(fileName, localPath, imageUrl) {
	try {
		// Ensure local path exists
		if (!fs.existsSync(localPath)) {
			fs.mkdirSync(localPath, { recursive: true });
		}

		// Build the complete file path
		const fullPath = path.join(localPath, fileName);

		// Use fetch to download the image
		const response = await fetch(imageUrl, { method: "GET" });

		if (!response.ok) {
			throw new Error(`Failed to download image: ${response.statusText}`);
		}

		// Create write stream
		const writer = fs.createWriteStream(fullPath);

		// Get the response as a readable stream and pipe it to the file
		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Failed to get response body");
		}

		return new Promise((resolve, reject) => {
			// Process stream
			const processStream = async () => {
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) {
							writer.end();
							break;
						}
						writer.write(value);
					}
				} catch (err) {
					writer.end();
					fs.unlink(fullPath, () => {});
					reject(err);
				}
			};

			// Resolve only when the stream is fully written
			writer.on('finish', () => {
				resolve(fullPath);
			});

			writer.on("error", (err) => {
				reader.cancel();
				fs.unlink(fullPath, () => {});
				reject(new Error(`Failed to write image: ${err.message}`));
			});

			processStream();
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Error downloading image: ${errorMessage}`);
	}
}

/**
 * Remove keys with empty arrays or empty objects from an object (matching Figma-Context-MCP exactly)
 * @param {any} input - The input object or value
 * @returns {any} The processed object or the original value
 */
export function removeEmptyKeys(input) {
	// If not an object type or null, return directly
	if (typeof input !== "object" || input === null) {
		return input;
	}

	// Handle array type
	if (Array.isArray(input)) {
		return input.map((item) => removeEmptyKeys(item));
	}

	// Handle object type
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
 * Convert hex color value and opacity to rgba format (matching Figma-Context-MCP exactly)
 * @param {string} hex - Hexadecimal color value (e.g., "#FF0000" or "#F00")
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} Color string in rgba format
 */
export function hexToRgba(hex, opacity = 1) {
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
 * Convert color from RGBA to { hex, opacity } (matching Figma-Context-MCP exactly)
 * @param {Object} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {Object} The converted color
 */
export function convertColor(color, opacity = 1) {
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
 * Convert color from Figma RGBA to rgba(#, #, #, #) CSS format (matching Figma-Context-MCP exactly)
 * @param {Object} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {string} The converted color
 */
export function formatRGBAColor(color, opacity = 1) {
	const r = Math.round(color.r * 255);
	const g = Math.round(color.g * 255);
	const b = Math.round(color.b * 255);
	// Alpha channel defaults to 1. If opacity and alpha are both and < 1, their effects are multiplicative
	const a = Math.round(opacity * color.a * 100) / 100;

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Generate a 6-character random variable ID (matching Figma-Context-MCP exactly)
 * @param {string} prefix - ID prefix
 * @returns {string} A 6-character random ID string with prefix
 */
export function generateVarId(prefix = "var") {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";

	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		result += chars[randomIndex];
	}

	return `${prefix}_${result}`;
}

/**
 * Generate a CSS shorthand for values that come with top, right, bottom, and left (matching Figma-Context-MCP exactly)
 * @param {Object} values - The values to generate the shorthand for
 * @param {Object} options - Options for generation
 * @returns {string|undefined} The generated shorthand
 */
export function generateCSSShorthand(values, options = {}) {
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
 * Convert a Figma paint (solid, image, gradient) to a SimplifiedFill (matching Figma-Context-MCP exactly)
 * @param {Object} raw - The Figma paint to convert
 * @returns {any} The converted SimplifiedFill
 */
export function parsePaint(raw) {
	if (raw.type === "IMAGE") {
		return {
			type: "IMAGE",
			imageRef: raw.imageRef,
			scaleMode: raw.scaleMode,
		};
	} else if (raw.type === "SOLID") {
		// treat as SOLID
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
 * Check if an element is visible (matching Figma-Context-MCP exactly)
 * @param {Object} element - The item to check
 * @returns {boolean} True if the item is visible, false otherwise
 */
export function isVisible(element) {
	return element.visible ?? true;
}

/**
 * Rounds a number to two decimal places, suitable for pixel value processing (matching Figma-Context-MCP exactly)
 * @param {number} num - The number to be rounded
 * @returns {number} The rounded number with two decimal places
 */
export function pixelRound(num) {
	if (isNaN(num)) {
		throw new TypeError(`Input must be a valid number`);
	}
	return Number(Number(num).toFixed(2));
}