import { pool } from '../config.js';
import { mcpTypesData } from './types-data.js';
import { upsertMCPType } from './upsert-type.js';

/**
 * Main function to update all MCP types
 * @returns {Promise<void>}
 */
export async function updateMCPTypes() {
	try {
		console.log('🔄 Updating MCP types in database...');
		console.log('');

		// Update each MCP type
		for (const mcpType of mcpTypesData) {
			await upsertMCPType(mcpType);
		}

		console.log('');
		console.log('🎉 All MCP types updated successfully!');
		console.log('');

		// Display summary
		const result = await pool.query(`
      SELECT name, display_name, 
             jsonb_array_length(required_credentials) as credential_count,
             is_active
      FROM mcp_types 
      ORDER BY name
    `);

		console.log('📊 Current MCP types in database:');
		console.table(result.rows);
	} catch (error) {
		console.error('❌ Failed to update MCP types:', error);
		throw error;
	}
}
