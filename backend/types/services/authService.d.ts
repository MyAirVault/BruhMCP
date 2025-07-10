export const authService: AuthService;
declare class AuthService {
    /** @type {Map<string, import('../types/index.js').AuthTokenData>} */
    authTokens: Map<string, import("../types/index.js").AuthTokenData>;
    /**
     * Generate a UUID token
     */
    generateToken(): string;
    /**
     * Request authentication token for email
     * @param {string} email
     */
    requestToken(email: string): Promise<{
        token: string;
        success: boolean;
    }>;
    /**
     * Verify authentication token and create user session
     * @param {string} token
     */
    verifyToken(token: string): Promise<{
        success: boolean;
        error: string;
        jwtToken?: undefined;
        user?: undefined;
    } | {
        success: boolean;
        jwtToken: string;
        user: any;
        error?: undefined;
    }>;
    /**
     * Clean up expired tokens
     */
    cleanup(): void;
    /**
     * Start background cleanup tasks
     */
    startCleanupTasks(): void;
}
export {};
//# sourceMappingURL=authService.d.ts.map