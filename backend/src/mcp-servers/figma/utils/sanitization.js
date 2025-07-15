/**
 * Sanitization utilities - Matches Figma-Context-MCP component processing
 * Handles component definitions, component sets, and data sanitization
 */

import { hasValue, generateVarId, createVariableKey } from './common.js';

/**
 * Sanitize components data (matching Figma-Context-MCP)
 * @param {any} components - Raw components data from Figma
 * @param {Object} globalVars - Global variables store
 * @returns {Array} Sanitized component definitions
 */
export function sanitizeComponents(components, globalVars) {
	if (!components || typeof components !== 'object') {
		return [];
	}

	const sanitizedComponents = [];

	Object.entries(components).forEach(([componentId, component]) => {
		const sanitized = sanitizeComponentDefinition(componentId, component, globalVars);
		if (sanitized) {
			sanitizedComponents.push(sanitized);
		}
	});

	return sanitizedComponents;
}

/**
 * Sanitize component sets data (matching Figma-Context-MCP)
 * @param {any} componentSets - Raw component sets data from Figma
 * @param {Object} globalVars - Global variables store
 * @returns {Array} Sanitized component set definitions
 */
export function sanitizeComponentSets(componentSets, globalVars) {
	if (!componentSets || typeof componentSets !== 'object') {
		return [];
	}

	const sanitizedSets = [];

	Object.entries(componentSets).forEach(([setId, componentSet]) => {
		const sanitized = sanitizeComponentSetDefinition(setId, componentSet, globalVars);
		if (sanitized) {
			sanitizedSets.push(sanitized);
		}
	});

	return sanitizedSets;
}

/**
 * Sanitize individual component definition (like Figma-Context-MCP)
 * @param {string} componentId - Component ID
 * @param {any} component - Raw component data
 * @param {Object} globalVars - Global variables store
 * @returns {any} Sanitized component definition
 */
export function sanitizeComponentDefinition(componentId, component, globalVars) {
	if (!component || !componentId) return null;

	const sanitized = {
		id: componentId,
		name: component.name || 'Unnamed Component',
		description: component.description || '',
		type: 'COMPONENT'
	};

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
		sanitized.documentationLinks = component.documentationLinks.map(link => ({
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
			id: varId,
			...sanitized
		};
	}

	return globalVars.components[componentKey].id;
}

/**
 * Sanitize component set definition (like Figma-Context-MCP)
 * @param {string} setId - Component set ID
 * @param {any} componentSet - Raw component set data
 * @param {Object} globalVars - Global variables store
 * @returns {any} Sanitized component set definition
 */
export function sanitizeComponentSetDefinition(setId, componentSet, globalVars) {
	if (!componentSet || !setId) return null;

	const sanitized = {
		id: setId,
		name: componentSet.name || 'Unnamed Component Set',
		description: componentSet.description || '',
		type: 'COMPONENT_SET'
	};

	// Documentation links
	if (hasValue(componentSet.documentationLinks) && Array.isArray(componentSet.documentationLinks)) {
		sanitized.documentationLinks = componentSet.documentationLinks.map(link => ({
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
			id: varId,
			...sanitized
		};
	}

	return globalVars.componentSets[setKey].id;
}

/**
 * Process component properties for instances (like Figma-Context-MCP)
 * @param {any} node - Component instance node
 * @param {Object} globalVars - Global variables store
 * @returns {any} Component properties object
 */
export function processComponentProperties(node, globalVars) {
	if (!node || node.type !== 'INSTANCE') return null;

	const properties = {
		componentId: node.componentId,
		type: 'INSTANCE'
	};

	// Component properties (variant selections, etc.)
	if (node.componentProperties && typeof node.componentProperties === 'object') {
		properties.overrides = {};

		Object.entries(node.componentProperties).forEach(([propName, propValue]) => {
			properties.overrides[propName] = sanitizeComponentProperty(propValue);
		});
	}

	// Overrides (text, fill, stroke overrides)
	if (node.overrides && Array.isArray(node.overrides)) {
		properties.styleOverrides = node.overrides.map(override => ({
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
	const propsKey = `instance_${node.componentId}_${Object.keys(properties.overrides || {}).join('_')}`;
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
 * @returns {any} Sanitized property value
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
 * Extract component metadata for AI analysis (like Figma-Context-MCP)
 * @param {any} components - Components data
 * @param {any} componentSets - Component sets data
 * @returns {any} Component metadata summary
 */
export function extractComponentMetadata(components, componentSets) {
	const metadata = {
		totalComponents: 0,
		totalComponentSets: 0,
		categories: {},
		mostUsedComponents: [],
		recentComponents: []
	};

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
					return new Date(b.updated_at) - new Date(a.updated_at);
				}
				return 0;
			});

		metadata.recentComponents = sortedComponents.slice(0, 10).map(c => ({
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