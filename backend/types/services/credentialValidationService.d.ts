/**
 * Test API credentials using the modular validation system
 * @param {string} serviceName - Service name (gmail, figma, github, etc.)
 * @param {any} credentials - Credentials to test
 * @param {boolean} performApiTest - Whether to perform actual API test (default: format validation only)
 * @returns {Promise<any>} Validation result
 */
export function testAPICredentials(serviceName: string, credentials: any, performApiTest?: boolean): Promise<any>;
/**
 * Get credential schema by MCP type ID
 * @param {string} _mcpTypeId - MCP type ID
 * @returns {Object} Credential schema
 */
export function getCredentialSchemaByType(_mcpTypeId: string): Object;
//# sourceMappingURL=credentialValidationService.d.ts.map