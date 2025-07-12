// @ts-check
import { pool } from '../config.js';
import { updateMCPTypes } from '../mcp-types/update-types.js';
import { verifyUpdate } from '../mcp-types/verify-update.js';
import { fileURLToPath } from 'url';

/**
 * Update MCP types with proper credential fields and add missing types
 * This script updates the existing MCP types to match frontend expectations
 * and adds the missing Slack MCP type
 */

/**
 * Run the update script
 * @returns {Promise<void>}
 */
async function main() {
	try {
		await updateMCPTypes();
		await verifyUpdate();
	} catch (error) {
		console.error('❌ Script execution failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run the script if executed directly
if (import.meta.url === fileURLToPath(import.meta.url)) {
	main();
}

export { updateMCPTypes, verifyUpdate };
