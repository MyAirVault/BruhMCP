/**
 * Setup routes for the Sheets service
 * @param {import('express').Application} app - Express app instance
 * @param {ServiceConfig} SERVICE_CONFIG - Service configuration
 * @param {import('express').RequestHandler} credentialAuthMiddleware - Credential auth middleware
 * @param {import('express').RequestHandler} lightweightAuthMiddleware - Lightweight auth middleware
 */
export function setupRoutes(app: import("express").Application, SERVICE_CONFIG: ServiceConfig, credentialAuthMiddleware: import("express").RequestHandler, lightweightAuthMiddleware: import("express").RequestHandler): void;
/**
 * Service Configuration Type
 */
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Service port
     */
    port: number;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Authentication type
     */
    authType: string;
    /**
     * - Service description
     */
    description: string;
    /**
     * - Icon path
     */
    iconPath: string;
    /**
     * - OAuth scopes
     */
    scopes: string[];
};
/**
 * Health Status Type
 */
export type HealthStatus = {
    /**
     * - Service name
     */
    service: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Health status
     */
    status: string;
    /**
     * - Uptime in seconds
     */
    uptime: number;
    /**
     * - Service port
     */
    port: number;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Authentication type
     */
    authType: string;
    /**
     * - Timestamp
     */
    timestamp: string;
    /**
     * - Description
     */
    description: string;
    /**
     * - Icon path
     */
    iconPath: string;
    /**
     * - OAuth scopes
     */
    scopes: string[];
    /**
     * - Service capabilities
     */
    capabilities: Object;
    /**
     * - Available endpoints
     */
    endpoints: Object;
    /**
     * - OAuth configuration
     */
    oauth: Object;
};
//# sourceMappingURL=routes.d.ts.map