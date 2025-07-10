import { testGetMCPTypeByName } from './retrieval-tests.js';
import { verifyCredentialStructure } from './credential-verification.js';

/**
 * Verify all expected MCP types exist
 * @returns {Promise<Array>} Array of verification results
 */
export async function verifyExpectedTypes() {
	const expectedTypes = ['figma', 'gmail', 'slack', 'github'];
	const results = [];

	console.log('🔍 Verifying expected MCP types...');

	for (const typeName of expectedTypes) {
		console.log(`\n📋 Testing ${typeName.toUpperCase()} MCP:`);
		const type = await testGetMCPTypeByName(typeName);

		if (type) {
			const isCompatible = verifyCredentialStructure(type);
			results.push({
				name: typeName,
				exists: true,
				compatible: isCompatible,
				type: type,
			});
		} else {
			results.push({
				name: typeName,
				exists: false,
				compatible: false,
				type: null,
			});
		}
	}

	return results;
}
