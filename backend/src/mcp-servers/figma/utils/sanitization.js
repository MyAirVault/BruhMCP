/**
 * Sanitization utilities * Handles component definitions, component sets, and data sanitization
 */

const { hasValue, generateVarId, createVariableKey } = require('./common.js');

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
function sanitizeComponents(components, globalVars) {
	if (!components || typeof components !== 'object') {
		return [];
	}

	const sanitizedComponents = /** @type {string[]} */ ([]);

	Object.entries(components).forEach(([componentId, component]) => {
		const sanitized = sanitizeComponentDefinition(componentId, component, globalVars);
		if (sanitized) {
			sanitizedComponents.push(sanitized);
		}
	});

	return sanitizedComponents;
}

/**
 * Sanitize component sets data
 * @param {Record<string, any>} componentSets - Raw component sets data from Figma
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string[]} Sanitized component set definitions
 */
function sanitizeComponentSets(componentSets, globalVars) {
	if (!componentSets || typeof componentSets !== 'object') {
		return [];
	}

	const sanitizedSets = /** @type {string[]} */ ([]);

	Object.entries(componentSets).forEach(([setId, componentSet]) => {
		const sanitized = sanitizeComponentSetDefinition(setId, componentSet, globalVars);
		if (sanitized) {
			sanitizedSets.push(sanitized);
		}
	});

	return sanitizedSets;
}

/**
 * Sanitize individual component definition
 * @param {string} componentId - Component ID
 * @param {any} component - Raw component data
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string|null} Sanitized component definition
 */
function sanitizeComponentDefinition(componentId, component, globalVars) {
	if (!component || !componentId) return null;

	const sanitized = /** @type {ComponentDefinition} */ ({
		id: componentId,
		name: component.name || 'Unnamed Component',
		description: component.description || '',
		type: 'COMPONENT'
	});

	// Component set association
	if (hasValue(component.componentSetId)) {
		sanitized.componentSetId = component.componentSetId;
	}

	// Remote component info
	if (hasValue(component.remote)) {
		sanitized.remote = component.remote;
	}

	// Documentation links
	if (hasValue(component.documentationLinks) && Array.isArray(component.documentationLinks)) {
		sanitized.documentationLinks = component.documentationLinks.map((/** @type {any} */ link) => ({
			uri: link.uri,
			label: link.label || 'Documentation'
		}));
	}

	// Timestamps
	if (hasValue(component.created_at)) {
		sanitized.createdAt = component.created_at;
	}
	if (hasValue(component.updated_at)) {
		sanitized.updatedAt = component.updated_at;
	}

	// User info
	if (component.user) {
		sanitized.author = {
			id: component.user.id,
			handle: component.user.handle,
			imageUrl: component.user.img_url
		};
	}

	// Create global variable for component
	const componentKey = createVariableKey(sanitized.name);
	if (!globalVars.components[componentKey]) {
		const varId = generateVarId('component');
		globalVars.components[componentKey] = {
			...sanitized,
			id: varId
		};
	}

	return globalVars.components[componentKey].id;
}

/**
 * Sanitize component set definition
 * @param {string} setId - Component set ID
 * @param {any} componentSet - Raw component set data
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string|null} Sanitized component set definition
 */
function sanitizeComponentSetDefinition(setId, componentSet, globalVars) {
	if (!componentSet || !setId) return null;

	const sanitized = /** @type {ComponentSetDefinition} */ ({
		id: setId,
		name: componentSet.name || 'Unnamed Component Set',
		description: componentSet.description || '',
		type: 'COMPONENT_SET'
	});

	// Documentation links
	if (hasValue(componentSet.documentationLinks) && Array.isArray(componentSet.documentationLinks)) {
		sanitized.documentationLinks = componentSet.documentationLinks.map((/** @type {any} */ link) => ({
			uri: link.uri,
			label: link.label || 'Documentation'
		}));
	}

	// Timestamps
	if (hasValue(componentSet.created_at)) {
		sanitized.createdAt = componentSet.created_at;
	}
	if (hasValue(componentSet.updated_at)) {
		sanitized.updatedAt = componentSet.updated_at;
	}

	// User info
	if (componentSet.user) {
		sanitized.author = {
			id: componentSet.user.id,
			handle: componentSet.user.handle,
			imageUrl: componentSet.user.img_url
		};
	}

	// Create global variable for component set
	const setKey = createVariableKey(sanitized.name);
	if (!globalVars.componentSets[setKey]) {
		const varId = generateVarId('componentSet');
		globalVars.componentSets[setKey] = {
			...sanitized,
			id: varId
		};
	}

	return globalVars.componentSets[setKey].id;
}

/**
 * Process component properties for instances
 * @param {any} node - Component instance node
 * @param {GlobalVarsStore} globalVars - Global variables store
 * @returns {string|null} Component properties object
 */
function processComponentProperties(node, globalVars) {
	if (!node || node.type !== 'INSTANCE') return null;

	const properties = /** @type {ComponentInstanceProperties} */ ({
		componentId: node.componentId,
		type: 'INSTANCE'
	});

	// Component properties (variant selections, etc.)
	if (node.componentProperties && typeof node.componentProperties === 'object') {
		properties.overrides = {};

		Object.entries(node.componentProperties).forEach(([propName, propValue]) => {
			if (properties.overrides) {
				properties.overrides[propName] = sanitizeComponentProperty(propValue);
			}
		});
	}

	// Overrides (text, fill, stroke overrides)
	if (node.overrides && Array.isArray(node.overrides)) {
		properties.styleOverrides = node.overrides.map((/** @type {any} */ override) => ({
			id: override.id,
			type: override.type,
			value: override.value
		}));
	}

	// Expose/hide properties
	if (hasValue(node.exposedInstances)) {
		properties.exposedInstances = node.exposedInstances;
	}

	// Create global variable for component instance properties
	const propsKey = `instance_${node.componentId}_${Object.keys(properties.overrides ?? {}).join('_')}`;
	if (!globalVars.componentInstances[propsKey]) {
		const varId = generateVarId('componentInstance');
		globalVars.componentInstances[propsKey] = {
			id: varId,
			...properties
		};
	}

	return globalVars.componentInstances[propsKey].id;
}

/**
 * Sanitize individual component property value
 * @param {any} propValue - Raw property value
 * @returns {ComponentPropertyValue|any} Sanitized property value
 */
function sanitizeComponentProperty(propValue) {
	if (propValue === null || propValue === undefined) {
		return null;
	}

	// Handle different property types
	if (typeof propValue === 'object' && propValue.type) {
		switch (propValue.type) {
			case 'VARIANT':
				return {
					type: 'VARIANT',
					value: propValue.value
				};
			case 'TEXT':
				return {
					type: 'TEXT',
					value: propValue.value
				};
			case 'BOOLEAN':
				return {
					type: 'BOOLEAN',
					value: Boolean(propValue.value)
				};
			case 'INSTANCE_SWAP':
				return {
					type: 'INSTANCE_SWAP',
					value: propValue.value
				};
			default:
				return {
					type: propValue.type,
					value: propValue.value
				};
		}
	}

	// Handle primitive values
	return propValue;
}

/**
 * Extract component metadata for AI analysis
 * @param {Record<string, any>} components - Components data
 * @param {Record<string, any>} componentSets - Component sets data
 * @returns {ComponentMetadata} Component metadata summary
 */
function extractComponentMetadata(components, componentSets) {
	const metadata = /** @type {ComponentMetadata} */ ({
		totalComponents: 0,
		totalComponentSets: 0,
		categories: /** @type {Record<string, number>} */ ({}),
		mostUsedComponents: /** @type {ComponentSummary[]} */ ([]),
		recentComponents: /** @type {ComponentSummary[]} */ ([])
	});

	// Count components
	if (components && typeof components === 'object') {
		metadata.totalComponents = Object.keys(components).length;

		// Categorize components
		Object.values(components).forEach(component => {
			const category = extractComponentCategory(component.name);
			metadata.categories[category] = (metadata.categories[category] || 0) + 1;
		});

		// Sort by usage (if available) or creation date
		const sortedComponents = Object.values(components)
			.sort((a, b) => {
				if (a.updated_at && b.updated_at) {
					return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
				}
				return 0;
			});

		metadata.recentComponents = sortedComponents.slice(0, 10).map((c) => ({
			id: c.id || c.key,
			name: c.name,
			updatedAt: c.updated_at
		}));
	}

	// Count component sets
	if (componentSets && typeof componentSets === 'object') {
		metadata.totalComponentSets = Object.keys(componentSets).length;
	}

	return metadata;
}

/**
 * Extract component category from name (for organization)
 * @param {string} componentName - Component name
 * @returns {string} Category name
 */
function extractComponentCategory(componentName) {
	if (!componentName) return 'other';

	const name = componentName.toLowerCase();

	// Common component categories
	if (name.includes('button') || name.includes('btn')) return 'buttons';
	if (name.includes('input') || name.includes('field') || name.includes('form')) return 'inputs';
	if (name.includes('card') || name.includes('tile')) return 'cards';
	if (name.includes('modal') || name.includes('dialog') || name.includes('popup')) return 'modals';
	if (name.includes('nav') || name.includes('menu') || name.includes('header') || name.includes('footer')) return 'navigation';
	if (name.includes('icon') || name.includes('ico')) return 'icons';
	if (name.includes('layout') || name.includes('container') || name.includes('wrapper')) return 'layout';
	if (name.includes('text') || name.includes('typography') || name.includes('heading')) return 'typography';

	return 'other';
}
module.exports = {
	sanitizeComponents,
	sanitizeComponentSets,
	sanitizeComponentDefinition,
	sanitizeComponentSetDefinition,
	processComponentProperties,
	extractComponentMetadata
};