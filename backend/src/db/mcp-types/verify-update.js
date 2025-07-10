import { pool } from '../config.js';

/**
 * Verify the update was successful
 * @returns {Promise<void>}
 */
export async function verifyUpdate() {
	try {
		console.log('🔍 Verifying MCP types update...');

		const result = await pool.query(`
      SELECT name, display_name, description, icon_url, 
             required_credentials, resource_limits, is_active
      FROM mcp_types 
      WHERE name IN ('figma', 'gmail', 'slack', 'github')
      ORDER BY name
    `);

		console.log('');
		console.log('✅ Verification complete - Found', result.rows.length, 'MCP types');

		for (const row of result.rows) {
			console.log(`\n📋 ${row.display_name} (${row.name}):`);
			console.log(`   Description: ${row.description}`);
			console.log(`   Icon URL: ${row.icon_url || 'Not set'}`);
			console.log(`   Required credentials: ${JSON.stringify(row.required_credentials, null, 2)}`);
			console.log(`   Resource limits: ${JSON.stringify(row.resource_limits, null, 2)}`);
			console.log(`   Active: ${row.is_active}`);
		}
	} catch (error) {
		console.error('❌ Verification failed:', error);
		throw error;
	}
}
