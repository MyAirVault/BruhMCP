import { z } from 'zod';

export const credentialValidationSchema = z.object({
	mcp_type_id: z.string().uuid('MCP type ID must be a valid UUID'),
	credentials: z
		.record(z.string())
		.refine(creds => Object.keys(creds).length > 0, { message: 'At least one credential is required' }),
});

export const storeAPIKeySchema = z.object({
	mcp_type_id: z.string().uuid('MCP type ID must be a valid UUID'),
	credentials: z
		.record(z.string())
		.refine(creds => Object.keys(creds).length > 0, { message: 'At least one credential is required' }),
});
