/**
 * @typedef {Object} MCPType
 * @property {string} id
 * @property {string} name
 * @property {string} display_name
 * @property {string} description
 * @property {string} icon_url
 * @property {Object} config_template
 * @property {Object} resource_limits
 * @property {boolean} is_active
 * @property {Array<string|Object>} required_credentials
 */
/**
 * Get MCP type by name
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export function getMCPTypeByNameHandler(req: import("express").Request, res: import("express").Response): Promise<import("express").Response<any, Record<string, any>>>;
export type MCPType = {
    id: string;
    name: string;
    display_name: string;
    description: string;
    icon_url: string;
    config_template: Object;
    resource_limits: Object;
    is_active: boolean;
    required_credentials: Array<string | Object>;
};
//# sourceMappingURL=getMCPTypeByName.d.ts.map