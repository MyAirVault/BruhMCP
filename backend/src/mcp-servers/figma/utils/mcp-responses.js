/**
 * MCP Response Formatter - Enhanced with Figma-Context-MCP deduplication logic
 * Ensures all responses follow the MCP protocol specification
 * Handles content formatting, error responses, and resource URIs
 * Now includes sophisticated data deduplication to reduce token size
 */

import yaml from 'js-yaml';

/**
 * Creates a successful MCP response with content
 * @param {any} data - Response data
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
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
 * @param {object} options - Error options
 * @returns {object} MCP-compliant error response
 */
function createErrorResponse(message, options = {}) {
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
 * Find or create global variables (key deduplication logic from Figma-Context-MCP)
 * @param {object} globalVars - Global variables object
 * @param {any} value - Value to store
 * @param {string} prefix - Variable ID prefix
 * @returns {string} Variable ID
 */
function findOrCreateVar(globalVars, value, prefix) {
    // Check if the same value already exists
    const existingEntry = Object.entries(globalVars.styles).find(
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
 * Check if element is visible
 * @param {object} element - Figma element
 * @returns {boolean} Whether element is visible
 */
function isVisible(element) {
    return element && element.visible !== false;
}

/**
 * Remove empty keys from object
 * @param {any} input - Input object
 * @returns {any} Cleaned object
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
        const cleaned = {};
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
 * Parse a single Figma node with deduplication (copying Figma-Context-MCP approach)
 * @param {object} globalVars - Global variables for deduplication
 * @param {object} node - Figma node object
 * @param {object} parent - Parent node (optional)
 * @returns {object} Simplified node
 */
function parseNode(globalVars, node, parent = null) {
    if (!node || !isVisible(node)) return null;
    
    const { id, name, type } = node;
    
    const simplified = {
        id,
        name,
        type
    };
    
    // Handle text content
    if (node.characters) {
        simplified.text = node.characters;
    }
    
    // Handle text styles with deduplication
    if (node.style && Object.keys(node.style).length > 0) {
        const style = node.style;
        const textStyle = {
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontSize: style.fontSize,
            lineHeight: style.lineHeightPx && style.fontSize ? 
                `${style.lineHeightPx / style.fontSize}em` : undefined,
            letterSpacing: style.letterSpacing && style.letterSpacing !== 0 && style.fontSize ?
                `${(style.letterSpacing / style.fontSize) * 100}%` : undefined,
            textCase: style.textCase,
            textAlignHorizontal: style.textAlignHorizontal,
            textAlignVertical: style.textAlignVertical
        };
        
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
        const fills = node.fills.map(fill => {
            if (fill.type === 'SOLID' && fill.color) {
                return {
                    type: 'SOLID',
                    color: {
                        r: Math.round(fill.color.r * 255),
                        g: Math.round(fill.color.g * 255),
                        b: Math.round(fill.color.b * 255),
                        a: fill.opacity || 1
                    }
                };
            }
            return fill;
        });
        simplified.fills = findOrCreateVar(globalVars, fills, "fill");
    }
    
    // Handle layout with deduplication
    if (node.absoluteBoundingBox) {
        const layout = {
            x: node.absoluteBoundingBox.x,
            y: node.absoluteBoundingBox.y,
            width: node.absoluteBoundingBox.width,
            height: node.absoluteBoundingBox.height
        };
        
        // Add positioning context if parent exists
        if (parent && parent.absoluteBoundingBox) {
            layout.relativeX = layout.x - parent.absoluteBoundingBox.x;
            layout.relativeY = layout.y - parent.absoluteBoundingBox.y;
        }
        
        simplified.layout = findOrCreateVar(globalVars, layout, "layout");
    }
    
    // Handle opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
        simplified.opacity = node.opacity;
    }
    
    // Handle border radius
    if (node.cornerRadius !== undefined) {
        simplified.borderRadius = `${node.cornerRadius}px`;
    }
    
    // Handle component instances
    if (type === "INSTANCE" && node.componentId) {
        simplified.componentId = node.componentId;
    }
    
    // Convert VECTOR to IMAGE-SVG for clarity
    if (type === "VECTOR") {
        simplified.type = "IMAGE-SVG";
    }
    
    // Recursively process children with limited depth
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        const children = node.children
            .filter(isVisible)
            .map(child => parseNode(globalVars, child, node))
            .filter(child => child !== null && child !== undefined)
            .slice(0, 100); // Limit children to prevent huge responses
            
        if (children.length > 0) {
            simplified.children = children;
        }
    }
    
    return simplified;
}

/**
 * Parse Figma response to simplified format (copying Figma-Context-MCP approach)
 * @param {any} data - Raw Figma API response
 * @param {string} nodeId - Optional node ID for node responses
 * @returns {Object} Simplified design object
 */
function parseFigmaResponse(data, nodeId = null) {
    // Initialize global variables for deduplication
    const globalVars = {
        styles: {}
    };
    
    let nodesToParse = [];
    let components = {};
    let componentSets = {};
    
    if (data.nodes && nodeId) {
        // GetFileNodesResponse - extract the specific node
        const nodeResponse = data.nodes[nodeId];
        if (nodeResponse) {
            if (nodeResponse.document) {
                nodesToParse = [nodeResponse.document];
            }
            if (nodeResponse.components) {
                components = nodeResponse.components;
            }
            if (nodeResponse.componentSets) {
                componentSets = nodeResponse.componentSets;
            }
        }
    } else if (data.document) {
        // GetFileResponse - get all children
        nodesToParse = data.document.children || [];
        components = data.components || {};
        componentSets = data.componentSets || {};
    }
    
    // Process nodes with deduplication
    const simplifiedNodes = nodesToParse
        .filter(isVisible)
        .map(node => parseNode(globalVars, node))
        .filter(node => node !== null && node !== undefined);
    
    const result = {
        name: data.name || 'Figma Design',
        lastModified: data.lastModified || new Date().toISOString(),
        thumbnailUrl: data.thumbnailUrl || "",
        nodes: simplifiedNodes,
        components: Object.keys(components).length > 10 ? {} : components, // Limit components
        componentSets: Object.keys(componentSets).length > 10 ? {} : componentSets, // Limit component sets
        globalVars
    };
    
    return removeEmptyKeys(result);
}

/**
 * Create optimized Figma response with deduplication (enhanced version)
 * @param {object} figmaData - Raw Figma API response
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
 */
function createFigmaOptimizedResponse(figmaData, options = {}) {
    const {
        outputFormat = 'yaml',
        fileKey = null,
        nodeId = null
    } = options;
    
    try {
        // Use the sophisticated parser with deduplication
        const simplifiedData = parseFigmaResponse(figmaData, nodeId);
        
        // Add minimal metadata
        const result = {
            metadata: {
                fileKey,
                nodeId
            },
            ...simplifiedData
        };
        
        // Format output as YAML like Figma-Context-MCP
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
        return createErrorResponse(`Failed to optimize Figma response: ${error.message}`);
    }
}

export {
    createSuccessResponse,
    createErrorResponse,
    createFigmaOptimizedResponse
};