/**
 * Response Simplifier * Converts Figma API responses into simplified, usable data with global variables
 */

/**
 * @typedef {Object} GlobalVars
 * @property {Record<string, unknown>} styles - Style variables
 * @property {Record<string, unknown>} components - Component variables
 * @property {Record<string, unknown>} componentSets - Component set variables
 * @property {Record<string, unknown>} componentInstances - Component instance variables
 */

/**
 * @typedef {Object} FigmaNode
 * @property {string} id - Node ID
 * @property {string} name - Node name
 * @property {string} type - Node type
 * @property {FigmaNode[]} [children] - Child nodes
 * @property {string} [componentId] - Component ID
 * @property {Record<string, unknown>} [componentProperties] - Component properties
 * @property {Record<string, unknown>} [style] - Text style
 * @property {unknown[]} [fills] - Fill paints
 * @property {string} [characters] - Text content
 * @property {number} [opacity] - Opacity value
 * @property {number} [cornerRadius] - Corner radius
 * @property {number[]} [rectangleCornerRadii] - Rectangle corner radii
 */

/**
 * @typedef {Object} SimplifiedNode
 * @property {string} id - Node ID
 * @property {string} name - Node name
 * @property {string} type - Node type
 * @property {string} [componentId] - Component ID
 * @property {Record<string, unknown>[]} [componentProperties] - Component properties
 * @property {string} [textStyle] - Text style reference
 * @property {string} [fills] - Fill reference
 * @property {string} [strokes] - Stroke reference
 * @property {string} [effects] - Effects reference
 * @property {string} [layout] - Layout reference
 * @property {string} [text] - Text content
 * @property {number} [opacity] - Opacity value
 * @property {string} [borderRadius] - Border radius
 * @property {SimplifiedNode[]} [children] - Child nodes
 */

/**
 * @typedef {Object} FigmaResponse
 * @property {string} name - File name
 * @property {string} lastModified - Last modified timestamp
 * @property {string} [thumbnailUrl] - Thumbnail URL
 * @property {Object} document - Document node
 * @property {FigmaNode[]} [children] - Root children
 * @property {Object} [components] - Components
 * @property {Object} [componentSets] - Component sets
 * @property {Object} [nodes] - Nodes (for GetFileNodesResponse)
 */

/**
 * @typedef {Object} NodeResponse
 * @property {FigmaNode} document - Document node
 * @property {Object} [components] - Components
 * @property {Object} [componentSets] - Component sets
 */

import { buildSimplifiedLayout } from '../transformers/layout.js';
import { buildSimplifiedStrokes } from '../transformers/style.js';
import { buildSimplifiedEffects } from '../transformers/effects.js';
import { sanitizeComponents, sanitizeComponentSets } from '../utils/sanitization.js';
import { 
	parsePaint, 
	isVisible, 
	removeEmptyKeys, 
	generateVarId 
} from '../utils/common.js';
import { 
	hasValue,
	isTruthy, 
	isRectangleCornerRadii 
} from '../utils/identity.js';

/**
 * Parse Figma API response
 * @param {FigmaResponse} data - Raw Figma API response (GetFileResponse | GetFileNodesResponse)
 * @returns {Object} Simplified design object with global variables
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
		if (!nodeResponse) return;
			if (nodeResponse.components) {
				Object.assign(aggregatedComponents, nodeResponse.components);
			}
			if (nodeResponse.componentSets) {
				Object.assign(aggregatedComponentSets, nodeResponse.componentSets);
			}
		});
		nodesToParse = nodeResponses.map((n) => n && n.document).filter(Boolean);
	} else {
		// GetFileResponse
		Object.assign(aggregatedComponents, data.components);
		Object.assign(aggregatedComponentSets, data.componentSets);
		nodesToParse = /** @type {FigmaNode} */ (data.document)?.children || [];
	}

	/** @type {GlobalVars} */
	let globalVars = {
		styles: {},
		components: {},
		componentSets: {},
		componentInstances: {}
	};

	const sanitizedComponents = sanitizeComponents(aggregatedComponents, globalVars);
	const sanitizedComponentSets = sanitizeComponentSets(aggregatedComponentSets, globalVars);

	const { name, lastModified, thumbnailUrl } = data;

	const simplifiedNodes = (nodesToParse || [])
		.filter(/** @param {FigmaNode} node */ (node) => node && isVisible(/** @type {{ visible?: boolean }} */ (node)))
		.map(/** @param {FigmaNode} n */ (n) => parseNode(globalVars, n))
		.filter(/** @param {SimplifiedNode|null} child */ (child) => child !== null && child !== undefined);

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
 * Find or create global variables
 * @param {GlobalVars} globalVars - Global variables object
 * @param {unknown} value - Value to store
 * @param {string} prefix - Variable ID prefix
 * @returns {string} Variable ID
 */
function findOrCreateVar(globalVars, value, prefix) {
	// Check if the same value already exists
	const existingEntry = Object.entries(globalVars.styles || {}).find(
		([_, existingValue]) => JSON.stringify(existingValue) === JSON.stringify(value)
	);

	if (existingEntry && existingEntry.length > 0) {
		return existingEntry[0];
	}

	// Create a new variable if it doesn't exist
	const varId = generateVarId(prefix);
	globalVars.styles[varId] = value;
	return varId;
}

/**
 * Parse individual node
 * @param {GlobalVars} globalVars - Global variables object
 * @param {FigmaNode} n - Figma node
 * @param {FigmaNode} [parent] - Parent node
 * @returns {SimplifiedNode|null} Simplified node
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
			/** @type {SimplifiedNode} */ (simplified).componentId = n.componentId;
		}

		// Add specific properties for instances of components
		if (hasValue("componentProperties", n)) {
			/** @type {SimplifiedNode} */ (simplified).componentProperties = Object.entries(n.componentProperties ?? {}).map(
				([name, prop]) => {
					const propObj = /** @type {Record<string, unknown>} */ (prop);
					return {
						name,
						value: String(propObj.value),
						type: /** @type {string} */ (propObj.type),
					};
				}
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
				/** @type {number} */ (style.lineHeightPx) && /** @type {number} */ (style.fontSize)
					? `${/** @type {number} */ (style.lineHeightPx) / /** @type {number} */ (style.fontSize)}em`
					: undefined,
			letterSpacing:
				/** @type {number} */ (style.letterSpacing) && /** @type {number} */ (style.letterSpacing) !== 0 && /** @type {number} */ (style.fontSize)
					? `${(/** @type {number} */ (style.letterSpacing) / /** @type {number} */ (style.fontSize)) * 100}%`
					: undefined,
			textCase: style.textCase,
			textAlignHorizontal: style.textAlignHorizontal,
			textAlignVertical: style.textAlignVertical,
		};
		/** @type {SimplifiedNode} */ (simplified).textStyle = findOrCreateVar(globalVars, textStyle, "style");
	}

	// fills & strokes
	if (hasValue("fills", n) && Array.isArray(n.fills) && n.fills && n.fills.length) {
		const fills = n.fills.filter(Boolean).map(fill => parsePaint(/** @type {Parameters<typeof parsePaint>[0]} */ (fill)));
		/** @type {SimplifiedNode} */ (simplified).fills = findOrCreateVar(globalVars, fills, "fill");
	}

	const strokes = buildSimplifiedStrokes(/** @type {import('../transformers/style.js').FigmaNode} */ (n));
	if (strokes && strokes.colors && strokes.colors.length) {
		/** @type {SimplifiedNode} */ (simplified).strokes = findOrCreateVar(globalVars, strokes, "stroke");
	}

	const effects = buildSimplifiedEffects(n);
	if (effects && Object.keys(effects).length) {
		/** @type {SimplifiedNode} */ (simplified).effects = findOrCreateVar(globalVars, effects, "effect");
	}

	// Process layout
	const layout = buildSimplifiedLayout(n, parent);
	if (layout && Object.keys(layout).length > 1) {
		/** @type {SimplifiedNode} */ (simplified).layout = findOrCreateVar(globalVars, layout, "layout");
	}

	// Keep other simple properties directly
	if (hasValue("characters", n, isTruthy)) {
		/** @type {SimplifiedNode} */ (simplified).text = n.characters;
	}

	// opacity
	if (hasValue("opacity", n) && typeof n.opacity === "number" && n.opacity !== 1) {
		/** @type {SimplifiedNode} */ (simplified).opacity = n.opacity;
	}

	if (hasValue("cornerRadius", n) && typeof n.cornerRadius === "number") {
		/** @type {SimplifiedNode} */ (simplified).borderRadius = `${n.cornerRadius}px`;
	}
	if (hasValue("rectangleCornerRadii", n, isRectangleCornerRadii) && n.rectangleCornerRadii && n.rectangleCornerRadii.length >= 4) {
		/** @type {SimplifiedNode} */ (simplified).borderRadius = `${n.rectangleCornerRadii[0]}px ${n.rectangleCornerRadii[1]}px ${n.rectangleCornerRadii[2]}px ${n.rectangleCornerRadii[3]}px`;
	}

	// Recursively process child nodes.
	// Include children at the very end so all relevant configuration data for the element is output first and kept together for the AI.
	if (hasValue("children", n) && Array.isArray(n.children) && n.children.length > 0) {
		const children = (n.children || [])
			.filter(/** @param {FigmaNode} child */ (child) => child && isVisible(/** @type {{ visible?: boolean }} */ (child)))
			.map(/** @param {FigmaNode} child */ (child) => parseNode(globalVars, child, n))
			.filter(/** @param {SimplifiedNode|null} child */ (child) => child !== null && child !== undefined);
		if (children && children.length) {
			/** @type {SimplifiedNode} */ (simplified).children = children;
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