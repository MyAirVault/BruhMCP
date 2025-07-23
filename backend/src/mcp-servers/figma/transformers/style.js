/**
 * Style Transformer * Handles strokes and visual styling
 */

import { generateCSSShorthand, isVisible, parsePaint } from '../utils/common.js';
import { hasValue, isStrokeWeights } from '../utils/identity.js';

/**
 * @typedef {Object} FigmaPaint
 * @property {string} type
 * @property {string} [imageRef]
 * @property {string} [scaleMode]
 * @property {{ r: number, g: number, b: number, a: number }} [color]
 * @property {number} [opacity]
 * @property {boolean} [visible]
 * @property {any[]} [gradientHandlePositions]
 * @property {Array<{ position: number, color: { r: number, g: number, b: number, a: number } }>} [gradientStops]
 */

/**
 * @typedef {Object} FigmaNode
 * @property {FigmaPaint[]} [strokes]
 * @property {number} [strokeWeight]
 * @property {number[]} [strokeDashes]
 * @property {{ top: number, right: number, bottom: number, left: number }} [individualStrokeWeights]
 */

/**
 * @typedef {Object} SimplifiedStroke
 * @property {Array<string|{ type: string, imageRef?: string, scaleMode?: string, gradientHandlePositions?: any[], gradientStops?: Array<{ position: number, color: { hex: string, opacity: number } }> }>} colors
 * @property {string} [strokeWeight]
 * @property {number[]} [strokeDashes]
 */

/**
 * Build simplified strokes
 * @param {FigmaNode} n - Figma node
 * @returns {SimplifiedStroke}
 */
export function buildSimplifiedStrokes(n) {
	/** @type {SimplifiedStroke} */
	let strokes = { colors: [] };
	
	if (hasValue("strokes", n) && Array.isArray(n.strokes) && n.strokes && n.strokes.length) {
		strokes.colors = n.strokes
			.filter(/** @param {FigmaPaint} stroke */ stroke => stroke && isVisible(/** @type {{ visible?: boolean }} */ (stroke)))
			.map(/** @param {FigmaPaint} paint */ paint => parsePaint(paint));
	}

	if (hasValue("strokeWeight", n) && typeof n.strokeWeight === "number" && n.strokeWeight > 0) {
		strokes.strokeWeight = `${n.strokeWeight}px`;
	}

	if (hasValue("strokeDashes", n) && Array.isArray(n.strokeDashes) && n.strokeDashes && n.strokeDashes.length) {
		strokes.strokeDashes = n.strokeDashes;
	}

	if (hasValue("individualStrokeWeights", n, isStrokeWeights) && n.individualStrokeWeights) {
		strokes.strokeWeight = generateCSSShorthand(/** @type {{ top: number, right: number, bottom: number, left: number }} */ (n.individualStrokeWeights));
	}

	return strokes;
}

