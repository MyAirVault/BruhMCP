// Extend Express Request interface
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				userId: string;
				email: string;
				sessionCreatedAt: Date;
				sessionExpiresAt: Date;
			} | null;
			instance?: {
				instance_id: string;
				user_id: string;
				api_key?: string;
				client_id?: string;
				client_secret?: string;
				status: string;
				expires_at?: string;
				last_used_at?: string;
				usage_count: number;
				custom_name?: string;
				mcp_service_name: string;
				display_name: string;
				type: string;
				port: number;
				is_active: boolean;
			};
			mcpInstance?: import('../db/queries/mcpInstances/index.js').MCPInstanceRecord;
			figmaApiKey?: string;
			instanceId?: string;
			userId?: string;
			cacheHit?: boolean;
			bearerToken?: string;
		}
	}
}

export {};
