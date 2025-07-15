/**
 * Effects Transformer - Matches Figma-Context-MCP effects.ts functionality exactly
 * Handles visual effects like shadows, blurs
 */

import { formatRGBAColor } from '../utils/common.js';
import { hasValue } from '../utils/identity.js';

/**
 * @typedef {Object} SimplifiedEffects
 * @property {string} [boxShadow]
 * @property {string} [filter]
 * @property {string} [backdropFilter]
 * @property {string} [textShadow]
 */

/**
 * Build simplified effects (matching Figma-Context-MCP exactly)
 * @param {any} n - Figma node
 * @returns {SimplifiedEffects}
 */
export function buildSimplifiedEffects(n) {
	if (!hasValue("effects", n) || !Array.isArray(n.effects)) return {};
	const effects = n.effects.filter((e) => e && e.visible);

	// Handle drop and inner shadows (both go into CSS box-shadow)
	const dropShadows = effects
		.filter((e) => e.type === "DROP_SHADOW")
		.map(simplifyDropShadow);

	const innerShadows = effects
		.filter((e) => e.type === "INNER_SHADOW")
		.map(simplifyInnerShadow);

	const boxShadow = [...dropShadows, ...innerShadows].join(", ");

	// Handle blur effects - separate by CSS property
	// Layer blurs use the CSS 'filter' property
	const filterBlurValues = effects
		.filter((e) => e.type === "LAYER_BLUR")
		.map(simplifyBlur)
		.join(" ");

	// Background blurs use the CSS 'backdrop-filter' property
	const backdropFilterValues = effects
		.filter((e) => e.type === "BACKGROUND_BLUR")
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

function simplifyDropShadow(effect) {
	return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread ?? 0}px ${formatRGBAColor(effect.color)}`;
}

function simplifyInnerShadow(effect) {
	return `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread ?? 0}px ${formatRGBAColor(effect.color)}`;
}

function simplifyBlur(effect) {
	return `blur(${effect.radius}px)`;
}

