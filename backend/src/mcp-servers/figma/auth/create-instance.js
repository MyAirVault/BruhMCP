/**
 * @fileoverview Figma Instance Creation
 * Standardized function for creating Figma service instances
 */

import createFigmaValidator from '../validation/credential-validator.js';
import { createMCPInstance } from '../../../db/queries/mcpInstances/creation.js';

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

		// Create MCP instance in database
		const instanceRecord = await createMCPInstance({
			userId,
			serviceName: 'figma',
			customName: customName || 'Figma API',
			credentials: {
				api_key: figmaCredentials.api_key,
				validated_at: new Date().toISOString(),
				user_info: validationResult.data
			},
			authType: 'api_key',
			status: 'active',
			metadata: {
				service: 'figma',
				authType: 'apikey',
				createdVia: 'auth_registry',
				userInfo: validationResult.data,
				...metadata
			}
		});

		console.log(`✅ Created Figma instance: ${instanceRecord.id}`);

		return {
			success: true,
			instanceId: instanceRecord.id,
			message: 'Figma instance created successfully',
			data: {
				instanceId: instanceRecord.id,
				serviceName: 'figma',
				customName: instanceRecord.customName,
				status: instanceRecord.status,
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