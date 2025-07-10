/**
 * Verify credential structure compatibility with frontend
 * @param {Object} mcpType - MCP type object
 * @returns {boolean} True if credential structure is compatible
 */
export function verifyCredentialStructure(mcpType) {
	const { required_credentials } = mcpType;

	if (!Array.isArray(required_credentials)) {
		console.log(`❌ ${mcpType.name}: required_credentials is not an array`);
		return false;
	}

	// Check if it's old format (string array) or new format (object array)
	if (required_credentials.length > 0) {
		if (typeof required_credentials[0] === 'string') {
			console.log(`⚠️  ${mcpType.name}: Using old credential format (string array)`);
			return false;
		} else if (typeof required_credentials[0] === 'object') {
			const requiredFields = ['name', 'type', 'description', 'required'];
			const hasAllFields = requiredFields.every(field => field in required_credentials[0]);

			if (hasAllFields) {
				console.log(`✅ ${mcpType.name}: Credential structure is compatible with frontend`);
				return true;
			} else {
				console.log(`❌ ${mcpType.name}: Missing required credential fields`);
				return false;
			}
		}
	}

	console.log(`✅ ${mcpType.name}: No credentials required`);
	return true;
}
