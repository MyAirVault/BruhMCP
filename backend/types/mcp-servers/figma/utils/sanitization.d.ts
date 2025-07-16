/**
 * Sanitize components data * @param {any} components - Raw components data from Figma
 * @param {Object} globalVars - Global variables store
 * @returns {Array} Sanitized component definitions
 */
export function sanitizeComponents(components: any, globalVars: Object): any[];
/**
 * Sanitize component sets data * @param {any} componentSets - Raw component sets data from Figma
 * @param {Object} globalVars - Global variables store
 * @returns {Array} Sanitized component set definitions
 */
export function sanitizeComponentSets(componentSets: any, globalVars: Object): any[];
/**
 * Sanitize individual component definition * @param {string} componentId - Component ID
 * @param {any} component - Raw component data
 * @param {Object} globalVars - Global variables store
 * @returns {any} Sanitized component definition
 */
export function sanitizeComponentDefinition(componentId: string, component: any, globalVars: Object): any;
/**
 * Sanitize component set definition * @param {string} setId - Component set ID
 * @param {any} componentSet - Raw component set data
 * @param {Object} globalVars - Global variables store
 * @returns {any} Sanitized component set definition
 */
export function sanitizeComponentSetDefinition(setId: string, componentSet: any, globalVars: Object): any;
/**
 * Process component properties for instances * @param {any} node - Component instance node
 * @param {Object} globalVars - Global variables store
 * @returns {any} Component properties object
 */
export function processComponentProperties(node: any, globalVars: Object): any;
/**
 * Extract component metadata for AI analysis * @param {any} components - Components data
 * @param {any} componentSets - Component sets data
 * @returns {any} Component metadata summary
 */
export function extractComponentMetadata(components: any, componentSets: any): any;
//# sourceMappingURL=sanitization.d.ts.map