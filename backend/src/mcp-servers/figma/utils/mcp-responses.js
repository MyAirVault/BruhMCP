/**
 * MCP Response Formatter
 * Ensures all responses follow the MCP protocol specification
 * Handles content formatting, error responses, and resource URIs
 * Now supports YAML formatting and global variable deduplication
 */

import yaml from 'js-yaml';
import { parseSimplifiedResponse } from '../services/simplified-node-parser.js';

/**
 * Creates a successful MCP response with content
 * @param {any} data - Response data
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
 */
function createSuccessResponse(data, options = {}) {
    const outputFormat = options.outputFormat || 'json';
    const useSimplifiedParser = options.useSimplifiedParser || false;
    
    let processedData = data;
    
    // Use simplified parser if enabled
    if (useSimplifiedParser && data && (data.document || data.components)) {
        processedData = parseSimplifiedResponse(data, {
            depth: options.depth,
            maxNodes: options.maxNodes
        });
    }
    
    // Format output
    let formattedText;
    if (outputFormat === 'yaml') {
        formattedText = yaml.dump(processedData, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false
        });
    } else {
        formattedText = JSON.stringify(processedData, null, 2);
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
 * Creates an error response following MCP protocol
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {any} data - Additional error data
 * @returns {object} MCP-compliant error response
 */
function createErrorResponse(message, code = 'UNKNOWN_ERROR', data = null) {
    const response = {
        content: [
            {
                type: 'text',
                text: message
            }
        ],
        isError: true,
        error: {
            code,
            message
        }
    };
    
    if (data) {
        response.error.data = data;
    }
    
    return response;
}


/**
 * Creates a chunked response with continuation information
 * @param {any} data - Current chunk data
 * @param {string} continuationToken - Token for next chunk
 * @param {array} availableChunks - List of available chunks
 * @returns {object} MCP-compliant response
 */
function createChunkedResponse(data, continuationToken, availableChunks = []) {
    const summary = `Partial response (chunk 1 of ${availableChunks.length || 'multiple'}). Use continuation token to get more data.`;
    
    const response = createSuccessResponse(data, {
        summary,
        hasMore: true,
        continuation: {
            token: continuationToken,
            availableChunks: availableChunks.map(chunk => ({
                name: chunk.name,
                description: chunk.description,
                estimatedTokens: chunk.estimatedTokens
            }))
        }
    });
    
    return response;
}

/**
 * Creates a response for file overview with available details
 * @param {object} overview - File overview data
 * @param {object} availableDetails - Available detail options
 * @returns {object} MCP-compliant response
 */
function createOverviewResponse(overview, availableDetails = {}) {
    let summary = `File: ${overview.meta?.name || 'Unknown'}`;
    
    if (overview.summary) {
        summary += ` (${overview.summary.type})`;
        if (overview.summary.componentCount) {
            summary += ` - ${overview.summary.componentCount} components`;
        }
        if (overview.summary.pageCount) {
            summary += `, ${overview.summary.pageCount} pages`;
        }
    }
    
    if (Object.keys(availableDetails).length > 0) {
        summary += '\n\nAvailable details:';
        Object.entries(availableDetails).forEach(([key, description]) => {
            summary += `\n- ${key}: ${description}`;
        });
    }
    
    return createSuccessResponse(overview, {
        summary,
        hasMore: Object.keys(availableDetails).length > 0,
        tokenCount: overview._meta?.tokenCount
    });
}

/**
 * Creates a Figma resource URI
 * @param {string} fileKey - Figma file key
 * @param {string} type - Resource type (overview, components, styles, nodes)
 * @param {string} id - Optional specific resource ID
 * @returns {string} Figma resource URI
 */
function createFigmaResourceUri(fileKey, type, id = null) {
    let uri = `figma://file/${fileKey}/${type}`;
    if (id) {
        uri += `/${id}`;
    }
    return uri;
}

/**
 * Parses a Figma resource URI
 * @param {string} uri - Figma resource URI
 * @returns {object|null} Parsed URI components or null if invalid
 */
function parseFigmaResourceUri(uri) {
    const figmaUriPattern = /^figma:\/\/file\/([^\/]+)\/([^\/]+)(?:\/(.+))?$/;
    const match = uri.match(figmaUriPattern);
    
    if (!match) return null;
    
    return {
        fileKey: match[1],
        type: match[2],
        id: match[3] || null
    };
}

/**
 * Formats data for human-readable display
 * @param {any} data - Data to format
 * @returns {string} Formatted string
 */
function formatDataForDisplay(data) {
    if (typeof data === 'string') {
        return data;
    }
    
    if (typeof data === 'object' && data !== null) {
        // Special formatting for common Figma data structures
        if (data.summary) {
            return formatFileSummary(data.summary, data.meta);
        }
        
        if (Array.isArray(data)) {
            return formatArrayData(data);
        }
        
        return JSON.stringify(data, null, 2);
    }
    
    return String(data);
}

/**
 * Formats file summary for display
 * @param {object} summary - File summary data
 * @param {object} meta - File metadata
 * @returns {string} Formatted summary
 */
function formatFileSummary(summary, meta) {
    let formatted = '';
    
    if (meta?.name) {
        formatted += `File: ${meta.name}\n`;
    }
    
    if (summary.type) {
        formatted += `Type: ${summary.type}\n`;
    }
    
    if (summary.pageCount) {
        formatted += `Pages: ${summary.pageCount}\n`;
    }
    
    if (summary.componentCount) {
        formatted += `Components: ${summary.componentCount}\n`;
    }
    
    if (summary.styleCount) {
        formatted += `Styles: ${summary.styleCount}\n`;
    }
    
    if (summary.pages && summary.pages.length > 0) {
        formatted += '\nPages:\n';
        summary.pages.forEach(page => {
            formatted += `- ${page.name} (${page.childCount} elements)\n`;
        });
    }
    
    if (summary.mainComponents && summary.mainComponents.length > 0) {
        formatted += '\nMain Components:\n';
        summary.mainComponents.forEach(comp => {
            formatted += `- ${comp.name}${comp.description ? ': ' + comp.description : ''}\n`;
        });
    }
    
    if (summary.designTokens) {
        const tokens = summary.designTokens;
        if (tokens.colors?.length > 0 || tokens.typography?.length > 0) {
            formatted += '\nDesign Tokens:\n';
            if (tokens.colors?.length > 0) {
                formatted += `- Colors: ${tokens.colors.slice(0, 5).join(', ')}${tokens.colors.length > 5 ? '...' : ''}\n`;
            }
            if (tokens.typography?.length > 0) {
                formatted += `- Typography: ${tokens.typography.slice(0, 3).join(', ')}${tokens.typography.length > 3 ? '...' : ''}\n`;
            }
        }
    }
    
    return formatted;
}

/**
 * Formats array data for display
 * @param {array} data - Array to format
 * @returns {string} Formatted string
 */
function formatArrayData(data) {
    if (data.length === 0) return 'No items found.';
    
    if (data.length === 1) {
        return formatDataForDisplay(data[0]);
    }
    
    let formatted = `Found ${data.length} items:\n\n`;
    data.slice(0, 10).forEach((item, index) => {
        if (typeof item === 'object' && item.name) {
            formatted += `${index + 1}. ${item.name}`;
            if (item.description) {
                formatted += ` - ${item.description}`;
            }
            formatted += '\n';
        } else {
            formatted += `${index + 1}. ${JSON.stringify(item)}\n`;
        }
    });
    
    if (data.length > 10) {
        formatted += `\n... and ${data.length - 10} more items`;
    }
    
    return formatted;
}

/**
 * Creates a Figma-optimized response using simplified parser
 * @param {object} figmaData - Raw Figma API response
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
 */
function createFigmaOptimizedResponse(figmaData, options = {}) {
    const {
        outputFormat = 'yaml',
        depth = 10,
        maxNodes = 1000,
        fileKey = null,
        nodeId = null
    } = options;
    
    try {
        // Use simplified parser for better deduplication
        const simplifiedData = parseSimplifiedResponse(figmaData, {
            depth,
            maxNodes
        });
        
        // Add metadata about optimization
        const metadata = {
            fileKey,
            nodeId,
            optimization: {
                originalSize: JSON.stringify(figmaData).length,
                optimizedSize: JSON.stringify(simplifiedData).length,
                compressionRatio: Math.round((1 - JSON.stringify(simplifiedData).length / JSON.stringify(figmaData).length) * 100),
                variableCount: simplifiedData._meta?.totalVariables || 0
            }
        };
        
        const result = {
            ...metadata,
            ...simplifiedData
        };
        
        // Format output
        let formattedText;
        if (outputFormat === 'yaml') {
            formattedText = yaml.dump(result, {
                indent: 2,
                lineWidth: 120,
                noRefs: true,
                sortKeys: false
            });
        } else {
            formattedText = JSON.stringify(result, null, 2);
        }
        
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