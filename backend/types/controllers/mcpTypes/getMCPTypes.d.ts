/**
 * @typedef {Object} MCPType
 * @property {string} mcp_service_id
 * @property {string} mcp_service_name
 * @property {string} display_name
 * @property {string} description
 * @property {string} icon_url_path
 * @property {number} port
 * @property {string} type
 * @property {boolean} is_active
 * @property {number} active_instances_count
 * @property {Date} created_at
 * @property {Date} updated_at
 */
/**
 * @typedef {Object} RequiredField
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {boolean} required
 * @property {string} placeholder
 */
/**
 * Get all MCP services (updated for multi-tenant architecture)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export function getMCPTypes(req: import("express").Request, res: import("express").Response): Promise<void>;
export type MCPType = {
    mcp_service_id: string;
    mcp_service_name: string;
    display_name: string;
    description: string;
    icon_url_path: string;
    port: number;
    type: string;
    is_active: boolean;
    active_instances_count: number;
    created_at: Date;
    updated_at: Date;
};
export type RequiredField = {
    name: string;
    type: string;
    description: string;
    required: boolean;
    placeholder: string;
};
//# sourceMappingURL=getMCPTypes.d.ts.map