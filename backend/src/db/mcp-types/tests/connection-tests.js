import { pool } from '../config.js';

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection() {
	try {
		const result = await pool.query('SELECT NOW()');
		console.log('✅ Database connection successful');
		console.log('   Server time:', result.rows[0].now);
		return true;
	} catch (error) {
		console.error('❌ Database connection failed:', error);
		return false;
	}
}

/**
 * Verify MCP types table structure
 * @returns {Promise<boolean>} True if table structure is valid
 */
export async function verifyTableStructure() {
	try {
		const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'mcp_types'
      ORDER BY ordinal_position
    `);

		console.log('✅ MCP types table structure verified');
		console.table(result.rows);
		return true;
	} catch (error) {
		console.error('❌ Table structure verification failed:', error);
		return false;
	}
}
