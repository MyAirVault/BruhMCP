/**
 * Create a new MCP process
 * @param {Object} config - Process configuration
 * @param {string} config.mcpType - MCP type name
 * @param {string} config.instanceId - Instance ID
 * @param {string} config.userId - User ID
 * @param {Object} config.credentials - Decrypted credentials
 * @param {Object} config.config - Instance configuration
 * @returns {Promise<Object>} Process information
 */
export function createProcess(config: {
    mcpType: string;
    instanceId: string;
    userId: string;
    credentials: Object;
    config: Object;
}): Promise<Object>;
//# sourceMappingURL=process-creation.d.ts.map