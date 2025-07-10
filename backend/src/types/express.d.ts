// Extend Express Request interface
declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string;
				email: string;
				sessionCreatedAt: Date;
				sessionExpiresAt: Date;
			} | null;
		}
	}
}

export {};
