/**
 * Identity utilities - Matches Figma-Context-MCP identity.ts functionality exactly
 * Type guards and utility functions for Figma object identification
 */

/**
 * Check if an object has a specific value (matching Figma-Context-MCP exactly)
 * @param {string} key - Property key to check
 * @param {any} obj - Object to check
 * @param {Function} [typeGuard] - Optional type guard function
 * @returns {boolean} True if object has the key with valid value
 */
export function hasValue(key, obj, typeGuard) {
	const isObject = typeof obj === "object" && obj !== null;
	if (!isObject || !(key in obj)) return false;
	const val = obj[key];
	return typeGuard ? typeGuard(val) : val !== undefined;
}

/**
 * Check if value is a frame (matching Figma-Context-MCP exactly)
 * @param {any} val - Value to check
 * @returns {boolean} True if value is a frame
 */
export function isFrame(val) {
	return (
		typeof val === "object" &&
		!!val &&
		"clipsContent" in val &&
		typeof val.clipsContent === "boolean"
	);
}

/**
 * Check if value has layout properties (matching Figma-Context-MCP exactly)
 * @param {any} val - Value to check
 * @returns {boolean} True if value has layout properties
 */
export function isLayout(val) {
	return (
		typeof val === "object" &&
		!!val &&
		"absoluteBoundingBox" in val &&
		typeof val.absoluteBoundingBox === "object" &&
		!!val.absoluteBoundingBox &&
		"x" in val.absoluteBoundingBox &&
		"y" in val.absoluteBoundingBox &&
		"width" in val.absoluteBoundingBox &&
		"height" in val.absoluteBoundingBox
	);
}

/**
 * Checks if a node is a child to an auto layout frame and adheres to auto layout rules (matching Figma-Context-MCP exactly)
 * @param {any} node - The node to check
 * @param {any} parent - The parent node
 * @returns {boolean} True if the node is a child of an auto layout frame
 */
export function isInAutoLayoutFlow(node, parent) {
	const autoLayoutModes = ["HORIZONTAL", "VERTICAL"];
	return (
		isFrame(parent) &&
		autoLayoutModes.includes(parent.layoutMode ?? "NONE") &&
		isLayout(node) &&
		node.layoutPositioning !== "ABSOLUTE"
	);
}

/**
 * Check if value is stroke weights object (matching Figma-Context-MCP exactly)
 * @param {any} val - Value to check
 * @returns {boolean} True if value is stroke weights
 */
export function isStrokeWeights(val) {
	return (
		typeof val === "object" &&
		val !== null &&
		"top" in val &&
		"right" in val &&
		"bottom" in val &&
		"left" in val
	);
}

/**
 * Check if value is a rectangle (matching Figma-Context-MCP exactly)
 * @param {string} key - Key to check
 * @param {any} obj - Object to check
 * @returns {boolean} True if object has rectangle at key
 */
export function isRectangle(key, obj) {
	const recordObj = obj;
	return (
		typeof obj === "object" &&
		!!obj &&
		key in recordObj &&
		typeof recordObj[key] === "object" &&
		!!recordObj[key] &&
		"x" in recordObj[key] &&
		"y" in recordObj[key] &&
		"width" in recordObj[key] &&
		"height" in recordObj[key]
	);
}

/**
 * Check if value is rectangle corner radii array (matching Figma-Context-MCP exactly)
 * @param {any} val - Value to check
 * @returns {boolean} True if value is corner radii array
 */
export function isRectangleCornerRadii(val) {
	return Array.isArray(val) && val.length === 4 && val.every((v) => typeof v === "number");
}

/**
 * Check if value is CSS color value (matching Figma-Context-MCP exactly)
 * @param {any} val - Value to check
 * @returns {boolean} True if value is CSS color
 */
export function isCSSColorValue(val) {
	return typeof val === "string" && (val.startsWith("#") || val.startsWith("rgba"));
}

/**
 * Check if value is truthy (utility function)
 * @param {any} val - Value to check
 * @returns {boolean} True if value is truthy
 */
export function isTruthy(val) {
	return !!val;
}