/**
 * Effects Transformer * Handles visual effects like shadows, blurs
 */

const { formatRGBAColor } = require('../utils/common.js');
const { hasValue } = require('../utils/identity.js');

/**
 * @typedef {Object} FigmaColor
 * @property {number} r - Red component (0-1)
 * @property {number} g - Green component (0-1)
 * @property {number} b - Blue component (0-1)
 * @property {number} a - Alpha component (0-1)
 */

/**
 * @typedef {Object} FigmaOffset 
 * @property {number} x - X offset
 * @property {number} y - Y offset
 */

/**
 * @typedef {Object} FigmaEffect
 * @property {string} type - Effect type (DROP_SHADOW, INNER_SHADOW, LAYER_BLUR, BACKGROUND_BLUR)
 * @property {boolean} visible - Whether effect is visible
 * @property {number} radius - Effect radius
 * @property {FigmaColor} color - Effect color (for shadows)
 * @property {FigmaOffset} offset - Effect offset (for shadows)
 * @property {number} [spread] - Shadow spread
 */

/**
 * @typedef {Object} FigmaNode
 * @property {string} type - Node type
 * @property {FigmaEffect[]} [effects] - Node effects
 */

/**
 * @typedef {Object} SimplifiedEffects
 * @property {string} [boxShadow]
 * @property {string} [filter]
 * @property {string} [backdropFilter]
 * @property {string} [textShadow]
 */

/**
 * Build simplified effects
 * @param {FigmaNode} n - Figma node
 * @returns {SimplifiedEffects}
 */
function buildSimplifiedEffects(n) {
	if (!hasValue("effects", n) || !Array.isArray(n.effects)) return {};
	const effects = n.effects.filter(/** @param {FigmaEffect} e */ (e) => e && e.visible);

	// Handle drop and inner shadows (both go into CSS box-shadow)
	const dropShadows = effects
		.filter(/** @param {FigmaEffect} e */ (e) => e.type === "DROP_SHADOW")
		.map(simplifyDropShadow);

	const innerShadows = effects
		.filter(/** @param {FigmaEffect} e */ (e) => e.type === "INNER_SHADOW")
		.map(simplifyInnerShadow);

	const boxShadow = [...dropShadows, ...innerShadows].join(", ");

	// Handle blur effects - separate by CSS property
	// Layer blurs use the CSS 'filter' property
	const filterBlurValues = effects
		.filter(/** @param {FigmaEffect} e */ (e) => e.type === "LAYER_BLUR")
		.map(simplifyBlur)
		.join(" ");

	// Background blurs use the CSS 'backdrop-filter' property
	const backdropFilterValues = effects
		.filter(/** @param {FigmaEffect} e */ (e) => e.type === "BACKGROUND_BLUR")
		.map(simplifyBlur)
		.join(" ");

	const result = {};

	if (boxShadow) {
		if (n.type === "TEXT") {
			result.textShadow = boxShadow;
		} else {
			result.boxShadow = boxShadow;
		}
	}
	if (filterBlurValues) result.filter = filterBlurValues;
	if (backdropFilterValues) result.backdropFilter = backdropFilterValues;

	return result;
}

/**
 * @param {FigmaEffect} effect
 * @returns {string}
 */
function simplifyDropShadow(effect) {
	return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread ?? 0}px ${formatRGBAColor(effect.color)}`;
}

/**
 * @param {FigmaEffect} effect
 * @returns {string}
 */
function simplifyInnerShadow(effect) {
	return `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread ?? 0}px ${formatRGBAColor(effect.color)}`;
}

/**
 * @param {FigmaEffect} effect
 * @returns {string}
 */
function simplifyBlur(effect) {
	return `blur(${effect.radius}px)`;
}


module.exports = {
	buildSimplifiedEffects
};