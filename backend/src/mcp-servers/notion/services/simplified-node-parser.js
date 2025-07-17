/**
 * Simplified Node Response Parser
 * Transforms Figma API responses into optimized, deduplicated structure
 * Uses global variable deduplication to optimize response size
 */

import { GlobalVariableManager } from './global-variable-manager.js';

/**
 * Parses Figma response data into simplified, deduplicated structure
 * @param {object} figmaData - Raw Figma API response
 * @param {object} options - Parser options
 * @returns {object} Simplified design with global variables
 */
function parseSimplifiedResponse(figmaData, options = {}) {
    const globalVars = new GlobalVariableManager();
    const depth = options.depth || 10;
    const maxNodes = options.maxNodes || 1000;
    
    // Extract basic metadata
    const metadata = {
        name: figmaData.name,
        lastModified: figmaData.lastModified,
        version: figmaData.version,
        thumbnailUrl: figmaData.thumbnailUrl || '',
        role: figmaData.role,
        linkAccess: figmaData.linkAccess
    };

    // Parse nodes with global variable extraction
    let nodes = [];
    if (figmaData.document && figmaData.document.children) {
        nodes = figmaData.document.children
            .filter(node => isNodeVisible(node))
            .map(node => parseNode(globalVars, node, null, 0, depth, maxNodes))
            .filter(node => node !== null);
    }

    // Parse components
    const components = parseComponents(figmaData.components || {});
    
    // Parse component sets
    const componentSets = parseComponentSets(figmaData.componentSets || {});

    // Build final response
    const result = {
        metadata,
        nodes,
        components,
        componentSets,
        globalVars: globalVars.getAllVariables()
    };

    // Add statistics
    result._meta = {
        ...globalVars.getStatistics(),
        nodeCount: countNodes(nodes),
        originalSize: JSON.stringify(figmaData).length,
        optimizedSize: JSON.stringify(result).length
    };

    return result;
}

/**
 * Parse individual node with global variable extraction
 * @param {GlobalVariableManager} globalVars - Global variable manager
 * @param {object} node - Figma node
 * @param {object} parent - Parent node
 * @param {number} currentDepth - Current depth in tree
 * @param {number} maxDepth - Maximum depth to traverse
 * @param {number} maxNodes - Maximum nodes to process
 * @returns {object|null} Simplified node
 */
function parseNode(globalVars, node, parent = null, currentDepth = 0, maxDepth = 10, maxNodes = 1000) {
    if (currentDepth > maxDepth || !node) return null;

    const simplified = {
        id: node.id,
        name: node.name,
        type: node.type
    };

    // Add bounding box if available
    if (node.absoluteBoundingBox) {
        simplified.boundingBox = {
            x: node.absoluteBoundingBox.x,
            y: node.absoluteBoundingBox.y,
            width: node.absoluteBoundingBox.width,
            height: node.absoluteBoundingBox.height
        };
    }

    // Handle text content
    if (node.characters) {
        simplified.text = node.characters;
    }

    // Handle text styles
    if (node.style && Object.keys(node.style).length > 0) {
        const textStyle = extractTextStyle(node.style);
        if (textStyle) {
            simplified.textStyle = globalVars.findOrCreateVariable(textStyle, 'textStyle');
        }
    }

    // Handle fills
    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        const fills = node.fills.map(fill => parseFill(fill));
        simplified.fills = globalVars.findOrCreateVariable(fills, 'fill');
    }

    // Handle strokes
    const strokes = parseStrokes(node);
    if (strokes && Object.keys(strokes).length > 0) {
        simplified.strokes = globalVars.findOrCreateVariable(strokes, 'stroke');
    }

    // Handle effects
    const effects = parseEffects(node);
    if (effects && Object.keys(effects).length > 0) {
        simplified.effects = globalVars.findOrCreateVariable(effects, 'effect');
    }

    // Handle layout properties
    const layout = parseLayout(node, parent);
    if (layout && Object.keys(layout).length > 1) {
        simplified.layout = globalVars.findOrCreateVariable(layout, 'layout');
    }

    // Handle opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
        simplified.opacity = node.opacity;
    }

    // Handle border radius
    if (node.cornerRadius !== undefined) {
        simplified.borderRadius = `${node.cornerRadius}px`;
    }
    if (node.rectangleCornerRadii) {
        simplified.borderRadius = node.rectangleCornerRadii
            .map(r => `${r}px`)
            .join(' ');
    }

    // Handle component instances
    if (node.type === 'INSTANCE' && node.componentId) {
        simplified.componentId = node.componentId;
        
        if (node.componentProperties) {
            simplified.componentProperties = Object.entries(node.componentProperties)
                .map(([name, prop]) => ({
                    name,
                    value: prop.value?.toString() || '',
                    type: prop.type
                }));
        }
    }

    // Handle children
    if (node.children && Array.isArray(node.children) && currentDepth < maxDepth) {
        const children = node.children
            .filter(child => isNodeVisible(child))
            .slice(0, Math.floor(maxNodes / (currentDepth + 1)))
            .map(child => parseNode(globalVars, child, node, currentDepth + 1, maxDepth, maxNodes))
            .filter(child => child !== null);

        if (children.length > 0) {
            simplified.children = children;
        }

        // Add indicator if there are more children
        if (node.children.length > children.length) {
            simplified.hasMoreChildren = true;
            simplified.totalChildren = node.children.length;
        }
    }

    // Convert VECTOR to IMAGE-SVG for better AI understanding
    if (node.type === 'VECTOR') {
        simplified.type = 'IMAGE-SVG';
    }

    return simplified;
}

/**
 * Extract text style properties
 * @param {object} style - Figma text style
 * @returns {object} Simplified text style
 */
function extractTextStyle(style) {
    const textStyle = {};
    
    if (style.fontFamily) textStyle.fontFamily = style.fontFamily;
    if (style.fontWeight) textStyle.fontWeight = style.fontWeight;
    if (style.fontSize) textStyle.fontSize = style.fontSize;
    if (style.textAlignHorizontal) textStyle.textAlignHorizontal = style.textAlignHorizontal;
    if (style.textAlignVertical) textStyle.textAlignVertical = style.textAlignVertical;
    if (style.textCase) textStyle.textCase = style.textCase;
    
    // Calculate line height
    if (style.lineHeightPx && style.fontSize) {
        textStyle.lineHeight = `${style.lineHeightPx / style.fontSize}em`;
    }
    
    // Calculate letter spacing
    if (style.letterSpacing && style.letterSpacing !== 0 && style.fontSize) {
        textStyle.letterSpacing = `${(style.letterSpacing / style.fontSize) * 100}%`;
    }
    
    return Object.keys(textStyle).length > 0 ? textStyle : null;
}

/**
 * Parse fill properties
 * @param {object} fill - Figma fill object
 * @returns {object} Simplified fill
 */
function parseFill(fill) {
    const simplified = {
        type: fill.type
    };

    if (fill.color) {
        simplified.rgba = `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.color.a || 1})`;
        simplified.hex = rgbToHex(fill.color);
    }

    if (fill.opacity !== undefined) {
        simplified.opacity = fill.opacity;
    }

    if (fill.imageRef) {
        simplified.imageRef = fill.imageRef;
    }

    if (fill.scaleMode) {
        simplified.scaleMode = fill.scaleMode;
    }

    if (fill.gradientStops) {
        simplified.gradientStops = fill.gradientStops.map(stop => ({
            position: stop.position,
            color: stop.color ? rgbToHex(stop.color) : undefined
        }));
    }

    return simplified;
}

/**
 * Parse stroke properties
 * @param {object} node - Figma node
 * @returns {object} Simplified strokes
 */
function parseStrokes(node) {
    if (!node.strokes || !Array.isArray(node.strokes) || node.strokes.length === 0) {
        return null;
    }

    const strokes = {
        colors: node.strokes.map(stroke => parseFill(stroke))
    };

    if (node.strokeWeight !== undefined) {
        strokes.weight = node.strokeWeight;
    }

    if (node.strokeAlign) {
        strokes.align = node.strokeAlign;
    }

    if (node.strokeCap) {
        strokes.cap = node.strokeCap;
    }

    if (node.strokeJoin) {
        strokes.join = node.strokeJoin;
    }

    if (node.strokeDashes) {
        strokes.dashes = node.strokeDashes;
    }

    return strokes;
}

/**
 * Parse effects (shadows, blurs, etc.)
 * @param {object} node - Figma node
 * @returns {object} Simplified effects
 */
function parseEffects(node) {
    if (!node.effects || !Array.isArray(node.effects) || node.effects.length === 0) {
        return null;
    }

    const effects = {};
    
    node.effects.forEach(effect => {
        if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
            if (!effects.shadows) effects.shadows = [];
            effects.shadows.push({
                type: effect.type,
                color: effect.color ? rgbToHex(effect.color) : undefined,
                offset: effect.offset,
                radius: effect.radius,
                spread: effect.spread
            });
        } else if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
            if (!effects.blurs) effects.blurs = [];
            effects.blurs.push({
                type: effect.type,
                radius: effect.radius
            });
        }
    });

    return effects;
}

/**
 * Parse layout properties
 * @param {object} node - Figma node
 * @param {object} parent - Parent node
 * @returns {object} Simplified layout
 */
function parseLayout(node, parent) {
    const layout = {};

    // Layout mode (flex, grid, etc.)
    if (node.layoutMode) {
        layout.mode = node.layoutMode;
    }

    // Auto layout properties
    if (node.primaryAxisSizingMode) {
        layout.primaryAxisSizing = node.primaryAxisSizingMode;
    }

    if (node.counterAxisSizingMode) {
        layout.counterAxisSizing = node.counterAxisSizingMode;
    }

    if (node.primaryAxisAlignItems) {
        layout.primaryAxisAlign = node.primaryAxisAlignItems;
    }

    if (node.counterAxisAlignItems) {
        layout.counterAxisAlign = node.counterAxisAlignItems;
    }

    if (node.paddingLeft !== undefined || node.paddingRight !== undefined || 
        node.paddingTop !== undefined || node.paddingBottom !== undefined) {
        layout.padding = {
            left: node.paddingLeft || 0,
            right: node.paddingRight || 0,
            top: node.paddingTop || 0,
            bottom: node.paddingBottom || 0
        };
    }

    if (node.itemSpacing !== undefined) {
        layout.gap = node.itemSpacing;
    }

    // Constraints
    if (node.constraints) {
        layout.constraints = {
            horizontal: node.constraints.horizontal,
            vertical: node.constraints.vertical
        };
    }

    return layout;
}

/**
 * Parse components
 * @param {object} components - Figma components object
 * @returns {object} Simplified components
 */
function parseComponents(components) {
    const simplified = {};
    
    Object.entries(components).forEach(([key, component]) => {
        simplified[key] = {
            name: component.name,
            description: component.description || '',
            key: component.key,
            remote: component.remote || false,
            componentSetId: component.componentSetId
        };
    });

    return simplified;
}

/**
 * Parse component sets
 * @param {object} componentSets - Figma component sets object
 * @returns {object} Simplified component sets
 */
function parseComponentSets(componentSets) {
    const simplified = {};
    
    Object.entries(componentSets).forEach(([key, componentSet]) => {
        simplified[key] = {
            name: componentSet.name,
            description: componentSet.description || '',
            key: componentSet.key,
            remote: componentSet.remote || false
        };
    });

    return simplified;
}

/**
 * Helper functions
 */
function isNodeVisible(node) {
    return node.visible !== false && node.opacity !== 0;
}

function rgbToHex(rgb) {
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function countNodes(nodes) {
    let count = 0;
    
    function countRecursive(nodeList) {
        nodeList.forEach(node => {
            count++;
            if (node.children) {
                countRecursive(node.children);
            }
        });
    }
    
    countRecursive(nodes);
    return count;
}

export {
    parseSimplifiedResponse
};