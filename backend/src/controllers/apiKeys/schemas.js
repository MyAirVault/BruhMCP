const { z } = require('zod');

const credentialValidationSchema = z.object({
	mcp_type_id: z.string().refine(
		value => {
			// Check if it's a valid UUID
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (uuidRegex.test(value)) return true;
			
			// Otherwise check if it's a valid service name (alphanumeric and lowercase)
			const serviceNameRegex = /^[a-z0-9]+$/;
			return serviceNameRegex.test(value);
		},
		{ message: 'MCP type ID must be a valid UUID or service name' }
	),
	credentials: z
		.record(z.string())
		.refine(creds => Object.keys(creds).length > 0, { message: 'At least one credential is required' }),
});

const storeAPIKeySchema = z.object({
	mcp_type_id: z.string().uuid('MCP type ID must be a valid UUID'),
	credentials: z
		.record(z.string())
		.refine(creds => Object.keys(creds).length > 0, { message: 'At least one credential is required' }),
});

module.exports = { credentialValidationSchema, storeAPIKeySchema };
