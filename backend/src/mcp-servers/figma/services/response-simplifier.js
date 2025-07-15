/**
 * Response Simplifier - Matches Figma-Context-MCP simplify-node-response.ts functionality exactly
 * Converts Figma API responses into simplified, usable data with global variables
 */

import { buildSimplifiedLayout } from '../transformers/layout.js';
import { buildSimplifiedStrokes } from '../transformers/style.js';
import { buildSimplifiedEffects } from '../transformers/effects.js';
import { sanitizeComponents, sanitizeComponentSets } from '../utils/sanitization.js';
import { 
	hasValue, 
	parsePaint, 
	isVisible, 
	removeEmptyKeys, 
	generateVarId 
} from '../utils/common.js';
import { 
	isTruthy, 
	isRectangleCornerRadii 
} from '../utils/identity.js';

/**
 * Parse Figma API response (matching Figma-Context-MCP parseFigmaResponse exactly)
 * @param {any} data - Raw Figma API response (GetFileResponse | GetFileNodesResponse)
 * @returns {any} Simplified design object with global variables
 */
export function parseFigmaResponse(data) {
	// Validate input data
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid data provided to parseFigmaResponse');
	}
	
	const aggregatedComponents = {};
	const aggregatedComponentSets = {};
	let nodesToParse;

	if ("nodes" in data && data.nodes) {
		// GetFileNodesResponse
		const nodeResponses = Object.values(data.nodes);
		nodeResponses.forEach((nodeResponse) => {
			if (nodeResponse.components) {
				Object.assign(aggregatedComponents, nodeResponse.components);
			}
			if (nodeResponse.componentSets) {
				Object.assign(aggregatedComponentSets, nodeResponse.componentSets);
			}
		});
		nodesToParse = nodeResponses.map((n) => n.document);
	} else {
		// GetFileResponse
		Object.assign(aggregatedComponents, data.components);
		Object.assign(aggregatedComponentSets, data.componentSets);
		nodesToParse = data.document.children;
	}

	const sanitizedComponents = sanitizeComponents(aggregatedComponents);
	const sanitizedComponentSets = sanitizeComponentSets(aggregatedComponentSets);

	const { name, lastModified, thumbnailUrl } = data;

	let globalVars = {
		styles: {},
	};

	const simplifiedNodes = nodesToParse
		.filter(isVisible)
		.map((n) => parseNode(globalVars, n))
		.filter((child) => child !== null && child !== undefined);

	const simplifiedDesign = {
		name,
		lastModified,
		thumbnailUrl: thumbnailUrl || "",
		nodes: simplifiedNodes,
		components: sanitizedComponents,
		componentSets: sanitizedComponentSets,
		globalVars,
	};

	return removeEmptyKeys(simplifiedDesign);
}

/**
 * Find or create global variables (matching Figma-Context-MCP exactly)
 * @param {Object} globalVars - Global variables object
 * @param {any} value - Value to store
 * @param {string} prefix - Variable ID prefix
 * @returns {string} Variable ID
 */
function findOrCreateVar(globalVars, value, prefix) {
	// Check if the same value already exists
	const existingEntry = Object.entries(globalVars.styles || {}).find(
		([_, existingValue]) => JSON.stringify(existingValue) === JSON.stringify(value)
	);

	if (existingEntry) {
		return existingEntry[0];
	}

	// Create a new variable if it doesn't exist
	const varId = generateVarId(prefix);
	globalVars.styles[varId] = value;
	return varId;
}

/**
 * Parse individual node (matching Figma-Context-MCP parseNode exactly)
 * @param {Object} globalVars - Global variables object
 * @param {any} n - Figma node
 * @param {any} [parent] - Parent node
 * @returns {Object|null} Simplified node
 */
function parseNode(globalVars, n, parent) {
	const { id, name, type } = n;

	const simplified = {
		id,
		name,
		type,
	};

	if (type === "INSTANCE") {
		if (hasValue("componentId", n)) {
			simplified.componentId = n.componentId;
		}

		// Add specific properties for instances of components
		if (hasValue("componentProperties", n)) {
			simplified.componentProperties = Object.entries(n.componentProperties ?? {}).map(
				([name, { value, type }]) => ({
					name,
					value: value.toString(),
					type,
				})
			);
		}
	}

	// text
	if (hasValue("style", n) && n.style && Object.keys(n.style).length) {
		const style = n.style;
		const textStyle = {
			fontFamily: style.fontFamily,
			fontWeight: style.fontWeight,
			fontSize: style.fontSize,
			lineHeight:
				style.lineHeightPx && style.fontSize
					? `${style.lineHeightPx / style.fontSize}em`
					: undefined,
			letterSpacing:
				style.letterSpacing && style.letterSpacing !== 0 && style.fontSize
					? `${(style.letterSpacing / style.fontSize) * 100}%`
					: undefined,
			textCase: style.textCase,
			textAlignHorizontal: style.textAlignHorizontal,
			textAlignVertical: style.textAlignVertical,
		};
		simplified.textStyle = findOrCreateVar(globalVars, textStyle, "style");
	}

	// fills & strokes
	if (hasValue("fills", n) && Array.isArray(n.fills) && n.fills.length) {
		const fills = n.fills.map(parsePaint);
		simplified.fills = findOrCreateVar(globalVars, fills, "fill");
	}

	const strokes = buildSimplifiedStrokes(n);
	if (strokes.colors.length) {
		simplified.strokes = findOrCreateVar(globalVars, strokes, "stroke");
	}

	const effects = buildSimplifiedEffects(n);
	if (effects && Object.keys(effects).length) {
		simplified.effects = findOrCreateVar(globalVars, effects, "effect");
	}

	// Process layout
	const layout = buildSimplifiedLayout(n, parent);
	if (layout && Object.keys(layout).length > 1) {
		simplified.layout = findOrCreateVar(globalVars, layout, "layout");
	}

	// Keep other simple properties directly
	if (hasValue("characters", n, isTruthy)) {
		simplified.text = n.characters;
	}

	// opacity
	if (hasValue("opacity", n) && typeof n.opacity === "number" && n.opacity !== 1) {
		simplified.opacity = n.opacity;
	}

	if (hasValue("cornerRadius", n) && typeof n.cornerRadius === "number") {
		simplified.borderRadius = `${n.cornerRadius}px`;
	}
	if (hasValue("rectangleCornerRadii", n, isRectangleCornerRadii)) {
		simplified.borderRadius = `${n.rectangleCornerRadii[0]}px ${n.rectangleCornerRadii[1]}px ${n.rectangleCornerRadii[2]}px ${n.rectangleCornerRadii[3]}px`;
	}

	// Recursively process child nodes.
	// Include children at the very end so all relevant configuration data for the element is output first and kept together for the AI.
	if (hasValue("children", n) && n.children.length > 0) {
		const children = n.children
			.filter(isVisible)
			.map((child) => parseNode(globalVars, child, n))
			.filter((child) => child !== null && child !== undefined);
		if (children.length) {
			simplified.children = children;
		}
	}

	// Convert VECTOR to IMAGE
	if (type === "VECTOR") {
		simplified.type = "IMAGE-SVG";
	}

	return simplified;
}

// For backward compatibility, export both function names
export const simplifyFigmaResponse = parseFigmaResponse;