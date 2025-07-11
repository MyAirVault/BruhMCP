/**
 * Test API credentials against the actual API
 * @param {string} _mcpTypeId - MCP type ID
 * @param {any} credentials - Credentials to test
 * @returns {Promise<any>} Validation result
 */
export function testAPICredentials(_mcpTypeId: string, credentials: any): Promise<any>;
/**
 * Get credential schema by MCP type ID
 * @param {string} _mcpTypeId - MCP type ID
 * @returns {Object} Credential schema
 */
export function getCredentialSchemaByType(_mcpTypeId: string): object;
//# sourceMappingURL=credentialValidationService.d.ts.map
