/**
 * Create new MCP instance with transaction support
 * @param {MCPInstanceCreateData} instanceData - Instance data
 * @returns {Promise<MCPInstanceRecord>} Created instance record
 */
export function createMCPInstance(instanceData: MCPInstanceCreateData): Promise<MCPInstanceRecord>;
/**
 * Create MCP instance with atomic plan limit checking
 * @param {MCPInstanceCreateData} instanceData - Instance data
 * @param {number|null} maxInstances - Maximum allowed active instances (null = unlimited)
 * @returns {Promise<CreateInstanceResult>} Created instance record or error
 */
export function createMCPInstanceWithLimitCheck(instanceData: MCPInstanceCreateData, maxInstances: number | null): Promise<CreateInstanceResult>;
//# sourceMappingURL=creation.d.ts.map