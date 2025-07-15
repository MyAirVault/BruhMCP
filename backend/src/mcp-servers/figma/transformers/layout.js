/**
 * Layout Transformer - Converts Figma layout to CSS-friendly format
 * Matches Figma-Context-MCP layout.ts functionality exactly
 */

import { isInAutoLayoutFlow, isFrame, isLayout, isRectangle } from '../utils/identity.js';
import { generateCSSShorthand, pixelRound } from '../utils/common.js';

/**
 * @typedef {Object} SimplifiedLayout
 * @property {"none" | "row" | "column"} mode
 * @property {"flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch"} [justifyContent]
 * @property {"flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch"} [alignItems]
 * @property {"flex-start" | "flex-end" | "center" | "stretch"} [alignSelf]
 * @property {boolean} [wrap]
 * @property {string} [gap]
 * @property {{x: number, y: number}} [locationRelativeToParent]
 * @property {{width?: number, height?: number, aspectRatio?: number}} [dimensions]
 * @property {string} [padding]
 * @property {{horizontal?: "fixed" | "fill" | "hug", vertical?: "fixed" | "fill" | "hug"}} [sizing]
 * @property {("x" | "y")[]} [overflowScroll]
 * @property {"absolute"} [position]
 */

/**
 * Convert Figma's layout config into a more typical flex-like schema
 * @param {any} n - Figma node
 * @param {any} [parent] - Parent node
 * @returns {SimplifiedLayout}
 */
export function buildSimplifiedLayout(n, parent) {
	const frameValues = buildSimplifiedFrameValues(n);
	const layoutValues = buildSimplifiedLayoutValues(n, parent, frameValues.mode) || {};

	return { ...frameValues, ...layoutValues };
}

/**
 * For flex layouts, process alignment and sizing
 * @param {any} axisAlign 
 * @param {Object} [stretch] 
 * @returns {string|undefined}
 */
function convertAlign(axisAlign, stretch) {
	if (stretch && stretch.mode !== "none") {
		const { children, mode, axis } = stretch;

		// Compute whether to check horizontally or vertically based on axis and direction
		const direction = getDirection(axis, mode);

		const shouldStretch = children && children.length > 0 && children.reduce((shouldStretch, c) => {
			if (!shouldStretch) return false;
			if (c.layoutPositioning && c.layoutPositioning === "ABSOLUTE") return true;
			if (direction === "horizontal") {
				return c.layoutSizingHorizontal && c.layoutSizingHorizontal === "FILL";
			} else if (direction === "vertical") {
				return c.layoutSizingVertical && c.layoutSizingVertical === "FILL";
			}
			return false;
		}, true);

		if (shouldStretch) return "stretch";
	}

	switch (axisAlign) {
		case "MIN":
			// MIN, AKA flex-start, is the default alignment
			return undefined;
		case "MAX":
			return "flex-end";
		case "CENTER":
			return "center";
		case "SPACE_BETWEEN":
			return "space-between";
		case "BASELINE":
			return "baseline";
		default:
			return undefined;
	}
}

/**
 * Convert self alignment
 * @param {any} align 
 * @returns {string|undefined}
 */
function convertSelfAlign(align) {
	switch (align) {
		case "MIN":
			// MIN, AKA flex-start, is the default alignment
			return undefined;
		case "MAX":
			return "flex-end";
		case "CENTER":
			return "center";
		case "STRETCH":
			return "stretch";
		default:
			return undefined;
	}
}

/**
 * Interpret sizing
 * @param {any} s 
 * @returns {string|undefined}
 */
function convertSizing(s) {
	if (s === "FIXED") return "fixed";
	if (s === "FILL") return "fill";
	if (s === "HUG") return "hug";
	return undefined;
}

/**
 * Get direction based on axis and mode
 * @param {"primary" | "counter"} axis 
 * @param {"row" | "column"} mode 
 * @returns {"horizontal" | "vertical"}
 */
function getDirection(axis, mode) {
	switch (axis) {
		case "primary":
			switch (mode) {
				case "row":
					return "horizontal";
				case "column":
					return "vertical";
			}
		case "counter":
			switch (mode) {
				case "row":
					return "horizontal";
				case "column":
					return "vertical";
			}
	}
}

/**
 * Build simplified frame values
 * @param {any} n 
 * @returns {SimplifiedLayout | {mode: "none"}}
 */
function buildSimplifiedFrameValues(n) {
	if (!isFrame(n)) {
		return { mode: "none" };
	}

	const frameValues = {
		mode: !n.layoutMode || n.layoutMode === "NONE"
			? "none"
			: n.layoutMode === "HORIZONTAL"
				? "row"
				: "column",
	};

	const overflowScroll = [];
	if (n.overflowDirection?.includes("HORIZONTAL")) overflowScroll.push("x");
	if (n.overflowDirection?.includes("VERTICAL")) overflowScroll.push("y");
	if (overflowScroll.length > 0) frameValues.overflowScroll = overflowScroll;

	if (frameValues.mode === "none") {
		return frameValues;
	}

	// TODO: convertAlign should be two functions, one for justifyContent and one for alignItems
	frameValues.justifyContent = convertAlign(n.primaryAxisAlignItems ?? "MIN", {
		children: n.children,
		axis: "primary",
		mode: frameValues.mode,
	});
	frameValues.alignItems = convertAlign(n.counterAxisAlignItems ?? "MIN", {
		children: n.children,
		axis: "counter",
		mode: frameValues.mode,
	});
	frameValues.alignSelf = convertSelfAlign(n.layoutAlign);

	// Only include wrap if it's set to WRAP, since flex layouts don't default to wrapping
	frameValues.wrap = n.layoutWrap === "WRAP" ? true : undefined;
	frameValues.gap = n.itemSpacing ? `${n.itemSpacing ?? 0}px` : undefined;
	
	// Gather padding
	if (n.paddingTop || n.paddingBottom || n.paddingLeft || n.paddingRight) {
		frameValues.padding = generateCSSShorthand({
			top: n.paddingTop ?? 0,
			right: n.paddingRight ?? 0,
			bottom: n.paddingBottom ?? 0,
			left: n.paddingLeft ?? 0,
		});
	}

	return frameValues;
}

/**
 * Build simplified layout values
 * @param {any} n 
 * @param {any} parent 
 * @param {"row" | "column" | "none"} mode 
 * @returns {SimplifiedLayout|undefined}
 */
function buildSimplifiedLayoutValues(n, parent, mode) {
	if (!isLayout(n)) return undefined;

	const layoutValues = { mode };

	layoutValues.sizing = {
		horizontal: convertSizing(n.layoutSizingHorizontal),
		vertical: convertSizing(n.layoutSizingVertical),
	};

	// Only include positioning-related properties if parent layout isn't flex or if the node is absolute
	if (
		// If parent is a frame but not an AutoLayout, or if the node is absolute, include positioning-related properties
		isFrame(parent) && !isInAutoLayoutFlow(n, parent)
	) {
		if (n.layoutPositioning === "ABSOLUTE") {
			layoutValues.position = "absolute";
		}
		if (n.absoluteBoundingBox && parent.absoluteBoundingBox) {
			layoutValues.locationRelativeToParent = {
				x: pixelRound(n.absoluteBoundingBox.x - parent.absoluteBoundingBox.x),
				y: pixelRound(n.absoluteBoundingBox.y - parent.absoluteBoundingBox.y),
			};
		}
	}

	// Handle dimensions based on layout growth and alignment
	if (isRectangle("absoluteBoundingBox", n)) {
		const dimensions = {};

		// Only include dimensions that aren't meant to stretch
		if (mode === "row") {
			// AutoLayout row, only include dimensions if the node is not growing
			if (!n.layoutGrow && n.layoutSizingHorizontal == "FIXED")
				dimensions.width = n.absoluteBoundingBox.width;
			if (n.layoutAlign !== "STRETCH" && n.layoutSizingVertical == "FIXED")
				dimensions.height = n.absoluteBoundingBox.height;
		} else if (mode === "column") {
			// AutoLayout column, only include dimensions if the node is not growing
			if (n.layoutAlign !== "STRETCH" && n.layoutSizingHorizontal == "FIXED")
				dimensions.width = n.absoluteBoundingBox.width;
			if (!n.layoutGrow && n.layoutSizingVertical == "FIXED")
				dimensions.height = n.absoluteBoundingBox.height;

			if (n.preserveRatio) {
				dimensions.aspectRatio = n.absoluteBoundingBox?.width / n.absoluteBoundingBox?.height;
			}
		} else {
			// Node is not an AutoLayout. Include dimensions if the node is not growing (which it should never be)
			if (!n.layoutSizingHorizontal || n.layoutSizingHorizontal === "FIXED") {
				dimensions.width = n.absoluteBoundingBox.width;
			}
			if (!n.layoutSizingVertical || n.layoutSizingVertical === "FIXED") {
				dimensions.height = n.absoluteBoundingBox.height;
			}
		}

		if (dimensions && Object.keys(dimensions).length > 0) {
			if (dimensions.width) {
				dimensions.width = pixelRound(dimensions.width);
			}
			if (dimensions.height) {
				dimensions.height = pixelRound(dimensions.height);
			}
			layoutValues.dimensions = dimensions;
		}
	}

	return layoutValues;
}

