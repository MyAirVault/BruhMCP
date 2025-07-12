export const serviceRegistry: ServiceRegistry;
export function loadServices(): Promise<void>;
export function loadService(name: any): Promise<any>;
export function getService(name: any): Promise<any>;
export function getServiceSync(name: any): any;
export function getAllServices(): any;
export function getServiceMetadata(name: any): {
    name: any;
    displayName: any;
    description: any;
    category: any;
    iconUrl: any;
    api: any;
    tools: any;
    resources: any;
    loadedAt: any;
} | null;
export function validateCredentials(name: any, creds: any): Promise<any>;
export function getServiceTools(name: any): Promise<any>;
export function getServiceResources(name: any): Promise<any>;
export function getRegistryStats(): {
    loaded: boolean;
    total: number;
    categories: {};
    services?: undefined;
} | {
    loaded: boolean;
    total: number;
    categories: {};
    services: any[];
};
export default serviceRegistry;
/**
 * Service Registry
 * Automatically discovers and loads service configurations
 */
declare class ServiceRegistry {
    services: Map<any, any>;
    loaded: boolean;
    servicesDir: string;
    /**
     * Load a specific service configuration on demand
     */
    loadService(serviceName: any): Promise<any>;
    /**
     * Auto-discover and load all service configurations (deprecated - use loadService for better performance)
     */
    loadServices(): Promise<void>;
    /**
     * Validate service configuration structure
     */
    validateServiceConfig(config: any, serviceName: any): boolean;
    /**
     * Convert new service config format to legacy format for compatibility
     */
    convertToLegacyFormat(serviceConfig: any): {
        name: any;
        baseURL: any;
        authHeader: (token: any) => {
            [x: number]: any;
        };
        credentialField: any;
        endpoints: any;
        customHandlers: any;
        _enhanced: {
            description: any;
            category: any;
            iconUrl: any;
            api: any;
            auth: any;
            tools: any;
            resources: any;
            validation: any;
        };
    };
    /**
     * Create auth header function based on service config
     */
    createAuthHeaderFunction(authConfig: any): (token: any) => {
        [x: number]: any;
    };
    /**
     * Get service configuration by name (with lazy loading)
     */
    getService(serviceName: any): Promise<any>;
    /**
     * Get service configuration by name (synchronous - only returns if already loaded)
     */
    getServiceSync(serviceName: any): any;
    /**
     * Get all available services
     */
    getAllServices(): any;
    /**
     * Get services by category
     */
    getServicesByCategory(category: any): {};
    /**
     * Get service metadata
     */
    getServiceMetadata(serviceName: any): {
        name: any;
        displayName: any;
        description: any;
        category: any;
        iconUrl: any;
        api: any;
        tools: any;
        resources: any;
        loadedAt: any;
    } | null;
    /**
     * Validate service credentials
     */
    validateCredentials(serviceName: any, credentials: any): Promise<any>;
    /**
     * Get available tools for a service
     */
    getServiceTools(serviceName: any): Promise<any>;
    /**
     * Get available resources for a service
     */
    getServiceResources(serviceName: any): Promise<any>;
    /**
     * List all available service names
     */
    getServiceNames(): any[];
    /**
     * Reload services (useful for development)
     */
    reloadServices(): Promise<void>;
    /**
     * Get registry statistics
     */
    getStats(): {
        loaded: boolean;
        total: number;
        categories: {};
        services?: undefined;
    } | {
        loaded: boolean;
        total: number;
        categories: {};
        services: any[];
    };
}
//# sourceMappingURL=service-registry.d.ts.map