declare const _default: OAuthServiceManager;
export default _default;
declare class OAuthServiceManager {
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | null;
    isRunning: boolean;
    port: string | number;
    /**
     * Start OAuth service if not already running
     * @returns {Promise<boolean>} true if started successfully
     */
    startService(): Promise<boolean>;
    /**
     * Stop OAuth service if running
     * @returns {Promise<boolean>} true if stopped successfully
     */
    stopService(): Promise<boolean>;
    /**
     * Check if OAuth service is running
     * @returns {boolean} true if running
     */
    isServiceRunning(): boolean;
    /**
     * Get OAuth service URL
     * @returns {string} OAuth service URL
     */
    getServiceUrl(): string;
    /**
     * Ensure OAuth service is running for an operation
     * @returns {Promise<boolean>} true if service is available
     */
    ensureServiceRunning(): Promise<boolean>;
}
//# sourceMappingURL=oauth-service-manager.d.ts.map