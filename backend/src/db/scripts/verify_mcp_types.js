// @ts-check
import { pool } from '../config.js';
import { testConnection, verifyTableStructure } from '../mcp-types/tests/connection-tests.js';
import { testGetAllMCPTypes } from '../mcp-types/tests/retrieval-tests.js';
import { verifyExpectedTypes } from '../mcp-types/tests/type-verification.js';
import { generateTestReport } from '../mcp-types/tests/test-reporting.js';
import { verifyCredentialStructure } from '../mcp-types/tests/credential-verification.js';
import { fileURLToPath } from 'url';

/**
 * Verification script to test MCP types database insertion
 */

/**
 * Main verification function
 * @returns {Promise<void>}
 */
async function main() {
	try {
		console.log('🔄 Starting MCP types verification...\n');

		// Test database connection
		const connectionOk = await testConnection();
		if (!connectionOk) {
			throw new Error('Database connection failed');
		}

		console.log('');

		// Verify table structure
		await verifyTableStructure();

		console.log('\n🔍 Testing MCP types retrieval...');

		// Test getAllMCPTypes
		await testGetAllMCPTypes();

		// Verify expected types
		const results = await verifyExpectedTypes();

		// Generate report
		const allGood = generateTestReport(results);

		if (allGood) {
			console.log('\n✅ Verification completed successfully!');
			process.exit(0);
		} else {
			console.log('\n❌ Verification found issues. Check the report above.');
			process.exit(1);
		}
	} catch (error) {
		console.error('❌ Verification failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run verification if executed directly
if (import.meta.url === fileURLToPath(import.meta.url)) {
	main();
}

export { verifyExpectedTypes, verifyCredentialStructure, testGetAllMCPTypes };
