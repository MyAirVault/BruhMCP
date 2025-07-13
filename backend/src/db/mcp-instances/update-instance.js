import { pool } from '../config.js';

/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated instance
 */
export async function updateMCPInstance(instanceId, updateData) {

	const fields = [];
	const values = [];
	let paramIndex = 1;

	// Build dynamic update query
	Object.entries(updateData).forEach(([key, value]) => {
		if (key === 'config') {
			fields.push(`${key} = $${paramIndex}`);
			values.push(JSON.stringify(value));
		} else {
			fields.push(`${key} = $${paramIndex}`);
			values.push(value);
		}
		paramIndex++;
	});

	// Only add updated_at if it's not already in the update data
	if (!Object.prototype.hasOwnProperty.call(updateData, 'updated_at')) {
		fields.push(`updated_at = CURRENT_TIMESTAMP`);
	}

	values.push(instanceId);

	const query = `
    UPDATE mcp_instances 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

	const result = await pool.query(query, values);
	return result.rows[0];
}
