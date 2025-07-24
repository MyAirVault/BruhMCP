/**
 * MCP Response Formatter * Ensures all responses follow the MCP protocol specification
 * Handles content formatting, error responses, and resource URIs
 * Now includes sophisticated data deduplication to reduce token size
 */

import * as yaml from 'js-yaml';

/**
 * Creates a successful MCP response with content
 * @param {unknown} data - Response data
 * @param {Record<string, unknown>} options - Response options
 * @returns {Record<string, unknown>} MCP-compliant response
 */
function createSuccessResponse(data, options = {}) {
    const outputFormat = options.outputFormat || 'json';
    
    // Format output
    let formattedText;
    if (outputFormat === 'yaml') {
        formattedText = yaml.dump(data, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false
        });
    } else {
        formattedText = JSON.stringify(data, null, 2);
    }
    
    return {
        content: [
            {
                type: "text",
                text: formattedText
            }
        ]
    };
}

/**
 * Creates an error MCP response
 * @param {string} message - Error message
 * @param {Record<string, unknown>} options - Error options
 * @returns {Record<string, unknown>} MCP-compliant error response
 */
function createErrorResponse(message, options = /** @type {Record<string, unknown>} */ ({})) {
    const errorData = {
        error: message,
        timestamp: new Date().toISOString(),
        ...options
    };
    
    return {
        content: [
            {
                type: "text", 
                text: JSON.stringify(errorData, null, 2)
            }
        ],
        isError: true
    };
}

/**
 * Generate a unique variable ID
 * @param {string} prefix - Variable prefix
 * @returns {string} Generated variable ID
 */
function generateVarId(prefix = "var") {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    
    return `${prefix}_${result}`;
}

/**
 * Find or create global variables
 * @param {Record<string, unknown>} globalVars - Global variables object
 * @param {unknown} value - Value to store
 * @param {string} prefix - Variable ID prefix
 * @returns {string} Variable ID
 */
function findOrCreateVar(globalVars, value, prefix) {
    // Check if the same value already exists
    const stylesObj = /** @type {Record<string, unknown>} */ (globalVars.styles || {});
    const existingEntry = Object.entries(stylesObj).find(
        ([_, existingValue]) => JSON.stringify(existingValue) === JSON.stringify(value)
    );
    
    if (existingEntry && existingEntry.length > 0) {
        return existingEntry[0];
    }
    
    // Create a new variable if it doesn't exist
    const varId = generateVarId(prefix);
    if (!globalVars.styles) {
        globalVars.styles = {};
    }
    /** @type {Record<string, unknown>} */ (globalVars.styles)[varId] = value;
    return varId;
}

/**
 * Check if element is visible
 * @param {Record<string, unknown>} element - Figma element
 * @returns {boolean} Whether element is visible
 */
function isVisible(element) {
    return element && element.visible !== false;
}

/**
 * Remove empty keys from object
 * @param {unknown} input - Input object
 * @returns {unknown} Cleaned object
 */
function removeEmptyKeys(input) {
    if (input === null || input === undefined) {
        return input;
    }
    
    if (Array.isArray(input)) {
        return input.map(item => removeEmptyKeys(item)).filter(item => 
            item !== null && item !== undefined && 
            !(Array.isArray(item) && item.length === 0) &&
            !(typeof item === 'object' && Object.keys(item).length === 0)
        );
    }
    
    if (typeof input === 'object') {
        const cleaned = /** @type {Record<string, unknown>} */ ({});
        Object.entries(input).forEach(([key, value]) => {
            const cleanedValue = removeEmptyKeys(value);
            if (cleanedValue !== null && cleanedValue !== undefined &&
                !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
                !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)) {
                cleaned[key] = cleanedValue;
            }
        });
        return cleaned;
    }
    
    return input;
}

/**
 * Parse a single Figma node with deduplication
 * @param {Record<string, unknown>} globalVars - Global variables for deduplication
 * @param {Record<string, unknown>} node - Figma node object
 * @param {Record<string, unknown> | null} parent - Parent node (optional)
 * @returns {Record<string, unknown> | null} Simplified node
 */
function parseNode(globalVars, node, parent = null) {
    if (!node || !isVisible(node)) return null;
    
    const id = /** @type {string} */ (node.id);
    const name = /** @type {string} */ (node.name);
    const type = /** @type {string} */ (node.type);
    
    const simplified = /** @type {Record<string, unknown>} */ ({
        id,
        name,
        type
    });
    
    // Handle text content
    if (node.characters) {
        simplified.text = /** @type {string} */ (node.characters);
    }
    
    // Handle text styles with deduplication
    if (node.style && Object.keys(/** @type {Record<string, unknown>} */ (node.style)).length > 0) {
        const style = /** @type {Record<string, unknown>} */ (node.style);
        const lineHeightPx = /** @type {number | undefined} */ (style.lineHeightPx);
        const fontSize = /** @type {number | undefined} */ (style.fontSize);
        const letterSpacing = /** @type {number | undefined} */ (style.letterSpacing);
        
        const textStyle = /** @type {Record<string, unknown>} */ ({
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontSize: fontSize,
            lineHeight: lineHeightPx && fontSize ? 
                `${lineHeightPx / fontSize}em` : undefined,
            letterSpacing: letterSpacing && letterSpacing !== 0 && fontSize ?
                `${(letterSpacing / fontSize) * 100}%` : undefined,
            textCase: style.textCase,
            textAlignHorizontal: style.textAlignHorizontal,
            textAlignVertical: style.textAlignVertical
        });
        
        // Remove undefined values
        Object.keys(textStyle).forEach(key => {
            if (textStyle[key] === undefined) {
                delete textStyle[key];
            }
        });
        
        if (Object.keys(textStyle).length > 0) {
            simplified.textStyle = findOrCreateVar(globalVars, textStyle, "style");
        }
    }
    
    // Handle fills with deduplication
    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        const fills = (/** @type {unknown[]} */ (node.fills)).map(fill => {
            const fillObj = /** @type {Record<string, unknown>} */ (fill);
            if (fillObj.type === 'SOLID' && fillObj.color) {
                const color = /** @type {Record<string, unknown>} */ (fillObj.color);
                return {
                    type: 'SOLID',
                    color: {
                        r: Math.round(/** @type {number} */ (color.r) * 255),
                        g: Math.round(/** @type {number} */ (color.g) * 255),
                        b: Math.round(/** @type {number} */ (color.b) * 255),
                        a: /** @type {number} */ (fillObj.opacity) || 1
                    }
                };
            }
            return fillObj;
        });
        simplified.fills = findOrCreateVar(globalVars, fills, "fill");
    }
    
    // Handle layout with deduplication
    if (node.absoluteBoundingBox) {
        const boundingBox = /** @type {Record<string, unknown>} */ (node.absoluteBoundingBox);
        const layout = /** @type {Record<string, unknown>} */ ({
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        });
        
        // Add positioning context if parent exists
        if (parent && parent.absoluteBoundingBox) {
            const parentBoundingBox = /** @type {Record<string, unknown>} */ (parent.absoluteBoundingBox);
            layout.relativeX = /** @type {number} */ (layout.x) - /** @type {number} */ (parentBoundingBox.x);
            layout.relativeY = /** @type {number} */ (layout.y) - /** @type {number} */ (parentBoundingBox.y);
        }
        
        simplified.layout = findOrCreateVar(globalVars, layout, "layout");
    }
    
    // Handle opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
        simplified.opacity = /** @type {number} */ (node.opacity);
    }
    
    // Handle border radius
    if (node.cornerRadius !== undefined) {
        simplified.borderRadius = `${/** @type {number} */ (node.cornerRadius)}px`;
    }
    
    // Handle component instances
    if (type === "INSTANCE" && node.componentId) {
        simplified.componentId = /** @type {string} */ (node.componentId);
    }
    
    // Convert VECTOR to IMAGE-SVG for clarity
    if (type === "VECTOR") {
        simplified.type = "IMAGE-SVG";
    }
    
    // Recursively process children with limited depth
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        const children = (/** @type {unknown[]} */ (node.children))
            .filter(child => isVisible(/** @type {Record<string, unknown>} */ (child)))
            .map(child => parseNode(globalVars, /** @type {Record<string, unknown>} */ (child), node))
            .filter(child => child !== null && child !== undefined)
            .slice(0, 100); // Limit children to prevent huge responses
            
        if (children.length > 0) {
            simplified.children = children;
        }
    }
    
    return simplified;
}

/**
 * Parse Figma response to simplified format
 * @param {Record<string, unknown>} data - Raw Figma API response
 * @param {string | null} nodeId - Optional node ID for node responses
 * @returns {Record<string, unknown>} Simplified design object
 */
function parseFigmaResponse(data, nodeId = null) {
    // Initialize global variables for deduplication
    const globalVars = /** @type {Record<string, unknown>} */ ({
        styles: /** @type {Record<string, unknown>} */ ({})
    });
    
    let nodesToParse = /** @type {unknown[]} */ ([]);
    let components = /** @type {Record<string, unknown>} */ ({});
    let componentSets = /** @type {Record<string, unknown>} */ ({});
    
    if (data.nodes && nodeId) {
        // GetFileNodesResponse - extract the specific node
        const nodes = /** @type {Record<string, unknown>} */ (data.nodes);
        const nodeResponse = /** @type {Record<string, unknown> | undefined} */ (nodes[nodeId]);
        if (nodeResponse) {
            if (nodeResponse.document) {
                nodesToParse = [nodeResponse.document];
            }
            if (nodeResponse.components) {
                components = /** @type {Record<string, unknown>} */ (nodeResponse.components);
            }
            if (nodeResponse.componentSets) {
                componentSets = /** @type {Record<string, unknown>} */ (nodeResponse.componentSets);
            }
        }
    } else if (data.document) {
        // GetFileResponse - get all children
        const document = /** @type {Record<string, unknown>} */ (data.document);
        nodesToParse = /** @type {unknown[]} */ (document.children || []);
        components = /** @type {Record<string, unknown>} */ (data.components || {});
        componentSets = /** @type {Record<string, unknown>} */ (data.componentSets || {});
    }
    
    // Process nodes with deduplication
    const simplifiedNodes = nodesToParse
        .filter(node => isVisible(/** @type {Record<string, unknown>} */ (node)))
        .map(node => parseNode(globalVars, /** @type {Record<string, unknown>} */ (node)))
        .filter(node => node !== null && node !== undefined);
    
    const result = /** @type {Record<string, unknown>} */ ({
        name: /** @type {string} */ (data.name) || 'Figma Design',
        lastModified: /** @type {string} */ (data.lastModified) || new Date().toISOString(),
        thumbnailUrl: /** @type {string} */ (data.thumbnailUrl) || "",
        nodes: simplifiedNodes,
        components: Object.keys(components).length > 10 ? /** @type {Record<string, unknown>} */ ({}) : components, // Limit components
        componentSets: Object.keys(componentSets).length > 10 ? /** @type {Record<string, unknown>} */ ({}) : componentSets, // Limit component sets
        globalVars
    });
    
    return /** @type {Record<string, unknown>} */ (removeEmptyKeys(result));
}

/**
 * Create optimized Figma response with deduplication (enhanced version)
 * @param {Record<string, unknown>} figmaData - Raw Figma API response
 * @param {Record<string, unknown>} options - Response options
 * @returns {Record<string, unknown>} MCP-compliant response
 */
function createFigmaOptimizedResponse(figmaData, options = /** @type {Record<string, unknown>} */ ({})) {
    const fileKey = /** @type {string | null} */ (options.fileKey) || null;
    const nodeId = /** @type {string | null} */ (options.nodeId) || null;
    
    try {
        // Use the sophisticated parser with deduplication
        const simplifiedData = /** @type {Record<string, unknown>} */ (parseFigmaResponse(figmaData, nodeId));
        
        // Add minimal metadata
        const result = /** @type {Record<string, unknown>} */ ({
            metadata: {
                fileKey,
                nodeId
            },
            .../** @type {Record<string, unknown>} */ (simplifiedData)
        });
        
        // Format output as YAML
        const formattedText = yaml.dump(result, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false
        });
        
        return {
            content: [
                {
                    type: "text",
                    text: formattedText
                }
            ]
        };
        
    } catch (error) {
        console.error('Error in createFigmaOptimizedResponse:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return createErrorResponse(`Failed to optimize Figma response: ${errorMessage}`);
    }
}

export {
    createSuccessResponse,
    createErrorResponse,
    createFigmaOptimizedResponse
};