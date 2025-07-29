const { z } = require('zod');

const createMCPSchema = z.object({
	mcp_type: z.string().min(1, 'MCP type is required'),
	custom_name: z.string().min(1, 'Custom name is required'),
	expiration_option: z.enum(['never', '1h', '6h', '1day', '30days']),
	credentials: z
		.record(z.string())
		.refine(creds => Object.keys(creds).length > 0, { message: 'At least one credential is required' }),
	config: z.record(z.any()).optional(),
});

const updateMCPSchema = z.object({
	custom_name: z.string().min(1).optional(),
	credentials: z.record(z.string()).optional(),
	config: z.record(z.any()).optional(),
});

const toggleMCPSchema = z.object({
	is_active: z.boolean(),
});

const renewMCPSchema = z.object({
	expiration_option: z.enum(['never', '1h', '6h', '1day', '30days']),
});

module.exports = {
	createMCPSchema,
	updateMCPSchema,
	toggleMCPSchema,
	renewMCPSchema
};
