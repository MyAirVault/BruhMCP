import { getAllMCPTypes, getMCPTypeByName } from '../mcpTypesQueries.js';

/**
 * Test all MCP types retrieval
 * @returns {Promise<Array>} Array of MCP types
 */
export async function testGetAllMCPTypes() {
	try {
		const types = await getAllMCPTypes();
		console.log('✅ Successfully retrieved all MCP types');
		console.log(`   Found ${types.length} MCP types`);

		for (const type of types) {
			console.log(`   - ${type.display_name} (${type.name})`);
		}

		return types;
	} catch (error) {
		console.error('❌ Failed to retrieve MCP types:', error);
		return [];
	}
}

/**
 * Test individual MCP type retrieval
 * @param {string} name - MCP type name
 * @returns {Promise<Object|null>} MCP type or null if not found
 */
export async function testGetMCPTypeByName(name) {
	try {
		const type = await getMCPTypeByName(name);
		if (type) {
			console.log(`✅ Successfully retrieved ${name} MCP type`);
			console.log(`   Display name: ${type.display_name}`);
			console.log(`   Description: ${type.description}`);
			console.log(`   Icon URL: ${type.icon_url || 'Not set'}`);
			console.log(`   Required credentials: ${JSON.stringify(type.required_credentials, null, 4)}`);
			console.log(`   Resource limits: ${JSON.stringify(type.resource_limits, null, 4)}`);
			console.log(`   Active: ${type.is_active}`);
			return type;
		} else {
			console.log(`❌ ${name} MCP type not found`);
			return null;
		}
	} catch (error) {
		console.error(`❌ Failed to retrieve ${name} MCP type:`, error);
		return null;
	}
}
