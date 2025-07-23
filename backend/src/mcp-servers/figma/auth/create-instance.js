/**
 * @fileoverview Figma Instance Creation
 * Standardized function for creating Figma service instances
 */

import createFigmaValidator from '../validation/credential-validator.js';
import { createMCPInstance } from '../../../db/queries/mcpInstances/creation.js';
import { getMCPServiceByName } from '../../../db/queries/mcpServices/crud.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').InstanceResult} InstanceResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').InstanceData} InstanceData
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

		const { credentials, customName, metadata } = instanceData;

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
		const validationResult = await validator.testCredentials(figmaCredentials);

		if (!validationResult.valid) {
			return {
				success: false,
				message: `Credential validation failed: ${validationResult.error}`
			};
		}

		// Get MCP service ID for Figma
		const mcpService = await getMCPServiceByName('figma');
		if (!mcpService) {
			return {
				success: false,
				message: 'Figma service not found in MCP services table'
			};
		}

		// Create MCP instance in database
		const instanceRecord = await createMCPInstance({
			userId,
			mcpServiceId: mcpService.id,
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
				userInfo: validationResult.data
			}
		};
	} catch (error) {
		console.error('Figma instance creation error:', error);
		return {
			success: false,
			message: `Failed to create Figma instance: ${error.message}`
		};
	}
}


export { createInstance };