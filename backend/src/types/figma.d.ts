declare namespace Express {
	interface Request {
		figmaApiKey?: string;
		instanceId?: string;
		instance?: {
			user_id: string;
			api_key?: string;
			client_id?: string;
			client_secret?: string;
			status: string;
		};
	}
}
