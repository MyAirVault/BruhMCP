/**
 * MCP type definitions with proper credential structures
 */
export const mcpTypesData: ({
    name: string;
    display_name: string;
    description: string;
    icon_url: string;
    server_script: string;
    config_template: {
        api_version: string;
        base_url: string;
        scopes?: undefined;
    };
    required_credentials: {
        name: string;
        type: string;
        description: string;
        required: boolean;
    }[];
    resource_limits: {
        max_memory_mb: number;
        max_cpu_percent: number;
        max_requests_per_minute: number;
    };
} | {
    name: string;
    display_name: string;
    description: string;
    icon_url: string;
    server_script: string;
    config_template: {
        api_version: string;
        scopes: string[];
        base_url: string;
    };
    required_credentials: {
        name: string;
        type: string;
        description: string;
        required: boolean;
    }[];
    resource_limits: {
        max_memory_mb: number;
        max_cpu_percent: number;
        max_requests_per_minute: number;
    };
})[];
//# sourceMappingURL=types-data.d.ts.map