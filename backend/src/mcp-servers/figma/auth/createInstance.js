/**
 * @fileoverview Figma Instance Creation
 * Standardized function for creating Figma service instances
 */

const createFigmaValidator = require('../validation/credentialValidator.js');
const { createMCPInstance } = require('../../../db/queries/mcpInstances/creation.js');
const { getMCPTypeByName } = require('../../../db/queries/mcpTypesQueries.js');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceResult} InstanceResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceData} InstanceData
 * @typedef {import('../../../services/validation/baseValidator.js').ValidationResult} ValidationResult
 * @typedef {import('../../../db/queries/mcpTypesQueries.js').MCPServiceType} MCPServiceType
 * @typedef {import('../../../db/queries/mcpInstances/types.js').MCPInstanceRecord} MCPInstanceRecord
 */


/**
 * Creates a new Figma service instance
 * @param {InstanceData} instanceData - Instance creation data
 * @param {string} userId - User ID creating the instance
 * @returns {Promise<InstanceResult>} Instance creation result
 */
async function createInstance(instanceData, userId) {
	try {
		console.log(`🔑 Creating Figma instance for user: ${userId}`);

		const { credentials, customName } = instanceData;

		if (!credentials || (!credentials.apiKey && !credentials.apiToken)) {
			return {
				success: false,
				message: 'API key is required for Figma service'
			};
		}

		// Validate credentials first
		const figmaCredentials = {
			api_key: credentials.apiKey || credentials.apiToken
		};

		const validator = createFigmaValidator(figmaCredentials);
		/** @type {ValidationResult} */
		const validationResult = await validator.testCredentials(figmaCredentials);

		if (!validationResult.valid) {
			return {
				success: false,
				message: `Credential validation failed: ${validationResult.error || 'Unknown error'}`
			};
		}

		// Get MCP service ID for Figma
		/** @type {MCPServiceType|null} */
		const mcpService = await getMCPTypeByName('figma');
		if (!mcpService) {
			return {
				success: false,
				message: 'Figma service not found in MCP services table'
			};
		}

		// Create MCP instance in database
		/** @type {MCPInstanceRecord} */
		const instanceRecord = await createMCPInstance({
			userId,
			mcpServiceId: mcpService.mcp_service_id,
			customName: customName || 'Figma API',
			apiKey: figmaCredentials.api_key,
			serviceType: 'api_key'
		});

		console.log(`✅ Created Figma instance: ${instanceRecord.instance_id}`);

		return {
			success: true,
			instanceId: instanceRecord.instance_id,
			message: 'Figma instance created successfully',
			data: {
				instanceId: instanceRecord.instance_id,
				serviceName: 'figma',
				customName: instanceRecord.custom_name,
				status: instanceRecord.oauth_status,
				userInfo: validationResult.service_info
			}
		};
	} catch (/** @type {any} */ error) {
		console.error('Figma instance creation error:', error);
		return {
			success: false,
			message: `Failed to create Figma instance: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}


module.exports = {
	createInstance
};