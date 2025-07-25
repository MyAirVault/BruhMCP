export const localUserService: LocalUserService;
declare class LocalUserService {
    /**
     * Login or register user with email/password
     * @param {string} email
     * @param {string} password
     */
    loginOrRegister(email: string, password: string): Promise<{
        success: boolean;
        error: string;
        message: string;
        user?: undefined;
        isNewUser?: undefined;
    } | {
        success: boolean;
        user: {
            id: any;
            email: any;
        };
        isNewUser: boolean;
        error?: undefined;
        message?: undefined;
    }>;
    /**
     * Set password for existing user (via CLI)
     * @param {string} email
     * @param {string} password
     */
    setPasswordForEmail(email: string, password: string): Promise<{
        success: boolean;
        isNewUser: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        isNewUser?: undefined;
    }>;
    /**
     * List all users with password status
     */
    listUsers(): Promise<{
        success: boolean;
        users: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        users?: undefined;
    }>;
    /**
     * Verify user credentials (password check only)
     * @param {string} email
     * @param {string} password
     */
    verifyCredentials(email: string, password: string): Promise<{
        success: boolean;
        error: string;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: {
            id: any;
            email: any;
        };
        error?: undefined;
        message?: undefined;
    }>;
}
export {};
//# sourceMappingURL=localUserService.d.ts.map