/**
 * Style Transformer - Matches Figma-Context-MCP style.ts functionality exactly
 * Handles strokes and visual styling
 */

import { generateCSSShorthand, isVisible, parsePaint } from '../utils/common.js';
import { hasValue, isStrokeWeights } from '../utils/identity.js';

/**
 * @typedef {Object} SimplifiedStroke
 * @property {Array} colors
 * @property {string} [strokeWeight]
 * @property {number[]} [strokeDashes]
 * @property {string} [strokeWeights]
 */

/**
 * Build simplified strokes (matching Figma-Context-MCP exactly)
 * @param {any} n - Figma node
 * @returns {SimplifiedStroke}
 */
export function buildSimplifiedStrokes(n) {
	let strokes = { colors: [] };
	
	if (hasValue("strokes", n) && Array.isArray(n.strokes) && n.strokes && n.strokes.length) {
		strokes.colors = n.strokes.filter(stroke => stroke && isVisible(stroke)).map(parsePaint);
	}

	if (hasValue("strokeWeight", n) && typeof n.strokeWeight === "number" && n.strokeWeight > 0) {
		strokes.strokeWeight = `${n.strokeWeight}px`;
	}

	if (hasValue("strokeDashes", n) && Array.isArray(n.strokeDashes) && n.strokeDashes && n.strokeDashes.length) {
		strokes.strokeDashes = n.strokeDashes;
	}

	if (hasValue("individualStrokeWeights", n, isStrokeWeights)) {
		strokes.strokeWeight = generateCSSShorthand(n.individualStrokeWeights);
	}

	return strokes;
}

