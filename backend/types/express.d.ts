import { Request } from 'express';

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				[key: string]: any;
			};
			// Slack MCP server specific properties
			instanceId?: string;
			bearerToken?: string;
			userId?: string;
			teamId?: string;
		}
	}
}

export {};
