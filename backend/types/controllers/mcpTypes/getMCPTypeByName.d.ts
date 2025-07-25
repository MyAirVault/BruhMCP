/**
 * @typedef {Object} MCPConfigTemplate
 * @property {string} api_version
 * @property {string} base_url
 * @property {string[]} [scopes]
 */
/**
 * @typedef {Object} MCPResourceLimits
 * @property {number} max_memory_mb
 * @property {number} max_cpu_percent
 * @property {number} max_requests_per_minute
 */
/**
 * @typedef {Object} MCPCredentialField
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {boolean} required
 */
/**
 * @typedef {Object} MCPType
 * @property {string} id
 * @property {string} name
 * @property {string} display_name
 * @property {string} description
 * @property {string} icon_url
 * @property {string} icon_url_path
 * @property {string} mcp_service_id
 * @property {string} mcp_service_name
 * @property {number} port
 * @property {string} type
 * @property {number} active_instances_count
 * @property {MCPConfigTemplate} config_template
 * @property {MCPResourceLimits} resource_limits
 * @property {boolean} is_active
 * @property {Array<string|MCPCredentialField>} required_credentials
 */
/**
 * Get MCP type by name
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export function getMCPTypeByNameHandler(req: import("express").Request, res: import("express").Response): Promise<void>;
export type MCPConfigTemplate = {
    api_version: string;
    base_url: string;
    scopes?: string[] | undefined;
};
export type MCPResourceLimits = {
    max_memory_mb: number;
    max_cpu_percent: number;
    max_requests_per_minute: number;
};
export type MCPCredentialField = {
    name: string;
    type: string;
    description: string;
    required: boolean;
};
export type MCPType = {
    id: string;
    name: string;
    display_name: string;
    description: string;
    icon_url: string;
    icon_url_path: string;
    mcp_service_id: string;
    mcp_service_name: string;
    port: number;
    type: string;
    active_instances_count: number;
    config_template: MCPConfigTemplate;
    resource_limits: MCPResourceLimits;
    is_active: boolean;
    required_credentials: Array<string | MCPCredentialField>;
};
//# sourceMappingURL=getMCPTypeByName.d.ts.map