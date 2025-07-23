/**
 * @typedef {Object} DocumentationLink
 * @property {string} uri
 * @property {string} label
 */
/**
 * @typedef {Object} AuthorInfo
 * @property {string} id
 * @property {string} handle
 * @property {string} imageUrl
 */
/**
 * @typedef {Object} ComponentDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} type
 * @property {string} [componentSetId]
 * @property {boolean} [remote]
 * @property {DocumentationLink[]} [documentationLinks]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {AuthorInfo} [author]
 */
/**
 * @typedef {Object} ComponentSetDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} type
 * @property {DocumentationLink[]} [documentationLinks]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {AuthorInfo} [author]
 */
/**
 * @typedef {Object} ComponentPropertyValue
 * @property {string} type
 * @property {any} value
 */
/**
 * @typedef {Object} StyleOverride
 * @property {string} id
 * @property {string} type
 * @property {any} value
 */
/**
 * @typedef {Object} ComponentInstanceProperties
 * @property {string} componentId
 * @property {string} type
 * @property {Record<string, ComponentPropertyValue>} [overrides]
 * @property {StyleOverride[]} [styleOverrides]
 * @property {any[]} [exposedInstances]
 */
/**
 * @typedef {Object} ComponentSummary
 * @property {string} id
 * @property {string} name
 * @property {string} [updatedAt]
 */
/**
 * @typedef {Object} ComponentMetadata
 * @property {number} totalComponents
 * @property {number} totalComponentSets
 * @property {Record<string, number>} categories
 * @property {ComponentSummary[]} mostUsedComponents
 * @property {ComponentSummary[]} recentComponents
 */
/**
 * @typedef {Object} GlobalVarsStore
 * @property {Record<string, any>} components
 * @property {Record<string, any>} componentSets
 * @property {Record<string, any>} componentInstances
 */
/**
 * Sanitize components data
 * @param {Record<string, any>} components - Raw components data from Figma
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string[]} Sanitized component definitions
 */
export function sanitizeComponents(components: Record<string, any>, globalVars: GlobalVarsStore): string[];
/**
 * Sanitize component sets data
 * @param {Record<string, any>} componentSets - Raw component sets data from Figma
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string[]} Sanitized component set definitions
 */
export function sanitizeComponentSets(componentSets: Record<string, any>, globalVars: GlobalVarsStore): string[];
/**
 * Sanitize individual component definition
 * @param {string} componentId - Component ID
 * @param {any} component - Raw component data
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string|null} Sanitized component definition
 */
export function sanitizeComponentDefinition(componentId: string, component: any, globalVars: GlobalVarsStore): string | null;
/**
 * Sanitize component set definition
 * @param {string} setId - Component set ID
 * @param {any} componentSet - Raw component set data
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string|null} Sanitized component set definition
 */
export function sanitizeComponentSetDefinition(setId: string, componentSet: any, globalVars: GlobalVarsStore): string | null;
/**
 * Process component properties for instances
 * @param {any} node - Component instance node
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string|null} Component properties object
 */
export function processComponentProperties(node: any, globalVars: GlobalVarsStore): string | null;
/**
 * Extract component metadata for AI analysis
 * @param {Record<string, any>} components - Components data
 * @param {Record<string, any>} componentSets - Component sets data
 * @returns {ComponentMetadata} Component metadata summary
 */
export function extractComponentMetadata(components: Record<string, any>, componentSets: Record<string, any>): ComponentMetadata;
export type DocumentationLink = {
    uri: string;
    label: string;
};
export type AuthorInfo = {
    id: string;
    handle: string;
    imageUrl: string;
};
export type ComponentDefinition = {
    id: string;
    name: string;
    description: string;
    type: string;
    componentSetId?: string | undefined;
    remote?: boolean | undefined;
    documentationLinks?: DocumentationLink[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    author?: AuthorInfo | undefined;
};
export type ComponentSetDefinition = {
    id: string;
    name: string;
    description: string;
    type: string;
    documentationLinks?: DocumentationLink[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    author?: AuthorInfo | undefined;
};
export type ComponentPropertyValue = {
    type: string;
    value: any;
};
export type StyleOverride = {
    id: string;
    type: string;
    value: any;
};
export type ComponentInstanceProperties = {
    componentId: string;
    type: string;
    overrides?: Record<string, ComponentPropertyValue> | undefined;
    styleOverrides?: StyleOverride[] | undefined;
    exposedInstances?: any[] | undefined;
};
export type ComponentSummary = {
    id: string;
    name: string;
    updatedAt?: string | undefined;
};
export type ComponentMetadata = {
    totalComponents: number;
    totalComponentSets: number;
    categories: Record<string, number>;
    mostUsedComponents: ComponentSummary[];
    recentComponents: ComponentSummary[];
};
export type GlobalVarsStore = {
    components: Record<string, any>;
    componentSets: Record<string, any>;
    componentInstances: Record<string, any>;
};
//# sourceMappingURL=sanitization.d.ts.map