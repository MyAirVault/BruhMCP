/**
 * @fileoverview Airtable Instance Creation
 * Standardized function for creating Airtable service instances
 */

import createAirtableValidator from '../validation/credentialValidator.js';
import { createMCPInstance } from '../../../db/queries/mcpInstances/creation.js';
import { getMCPTypeByName } from '../../../db/queries/mcpTypesQueries.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceResult} InstanceResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').InstanceData} InstanceData
 * @typedef {import('../../../services/validation/baseValidator.js').ValidationResult} ValidationResult
 * @typedef {import('../../../db/queries/mcpTypesQueries.js').MCPServiceType} MCPServiceType
 * @typedef {import('../../../db/queries/mcpInstances/types.js').MCPInstanceRecord} MCPInstanceRecord
 */

/**
 * @typedef {Object} AirtableCredentials
 * @property {string} [apiKey] - API key from frontend
 * @property {string} [apiToken] - Alternative API token field
 * @property {string} [api_key] - API key field
 */

/**
 * @typedef {Object} NormalizedCredentials
 * @property {string} api_key - Normalized API key
 */


/**
 * Creates a new Airtable service instance
 * @param {InstanceData} instanceData - Instance creation data
 * @param {string} userId - User ID creating the instance
 * @returns {Promise<InstanceResult>} Instance creation result
 */
async function createInstance(instanceData, userId) {
	try {
		console.log(`🔑 Creating Airtable instance for user: ${userId}`);

		const { credentials, customName } = instanceData;

		/** @type {AirtableCredentials} */
		const typedCredentials = credentials;

		if (!typedCredentials || (!typedCredentials.apiKey && !typedCredentials.apiToken && !typedCredentials.api_key)) {
			return {
				success: false,
				message: 'API key is required for Airtable service'
			};
		}

		// Validate credentials first
		/** @type {NormalizedCredentials} */
		const airtableCredentials = {
			api_key: typedCredentials.apiKey || typedCredentials.apiToken || typedCredentials.api_key || ''
		};

		const validator = createAirtableValidator(airtableCredentials);
		/** @type {ValidationResult} */
		const validationResult = await validator.testCredentials(airtableCredentials);

		if (!validationResult.valid) {
			return {
				success: false,
				message: `Credential validation failed: ${validationResult.error || 'Unknown error'}`
			};
		}

		// Get MCP service ID for Airtable
		/** @type {MCPServiceType|null} */
		const mcpService = await getMCPTypeByName('airtable');
		if (!mcpService) {
			return {
				success: false,
				message: 'Airtable service not found in MCP services table'
			};
		}

		// Create MCP instance in database
		/** @type {MCPInstanceRecord} */
		const instanceRecord = await createMCPInstance({
			userId,
			mcpServiceId: mcpService.mcp_service_id,
			customName: customName || 'Airtable API',
			apiKey: airtableCredentials.api_key,
			serviceType: 'api_key'
		});

		console.log(`✅ Created Airtable instance: ${instanceRecord.instance_id}`);

		return {
			success: true,
			instanceId: instanceRecord.instance_id,
			message: 'Airtable instance created successfully',
			data: {
				instanceId: instanceRecord.instance_id,
				serviceName: 'airtable',
				customName: instanceRecord.custom_name,
				status: instanceRecord.oauth_status,
				userInfo: validationResult.service_info
			}
		};
	} catch (error) {
		console.error('Airtable instance creation error:', error);
		return {
			success: false,
			message: `Failed to create Airtable instance: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}


export { createInstance };