import { pool } from '../config.js';
import { validatePortAssignment } from '../../utils/portValidation.js';

/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated instance
 */
export async function updateMCPInstance(instanceId, updateData) {
	// Validate port assignment if being updated
	if (updateData.assigned_port !== undefined) {
		validatePortAssignment(updateData.assigned_port);
	}

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

	values.push(instanceId);

	const query = `
    UPDATE mcp_instances 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `;

	const result = await pool.query(query, values);
	return result.rows[0];
}
