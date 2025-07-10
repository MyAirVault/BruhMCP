/**
 * Test API credentials against the actual API
 * @param {string} mcpTypeId - MCP type ID
 * @param {Object} credentials - Credentials to test
 * @returns {Promise<Object>} Validation result
 */
export function testAPICredentials(mcpTypeId: string, credentials: Object): Promise<Object>;
/**
 * Get credential schema by MCP type ID
 * @param {string} mcpTypeId - MCP type ID
 * @returns {Object} Credential schema
 */
export function getCredentialSchemaByType(mcpTypeId: string): Object;
//# sourceMappingURL=credentialValidationService.d.ts.map