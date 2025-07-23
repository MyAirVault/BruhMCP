/**
 * @typedef {import('./types.js').MCPInstanceCreateData} MCPInstanceCreateData
 * @typedef {import('./types.js').MCPInstanceRecord} MCPInstanceRecord
 * @typedef {import('./types.js').CreateInstanceResult} CreateInstanceResult
 */
/**
 * Create new MCP instance with transaction support
 * @param {MCPInstanceCreateData} instanceData - Instance creation data including user ID, service info, and credentials
 * @returns {Promise<MCPInstanceRecord>} Created instance record with all properties
 * @throws {Error} When database transaction fails or required fields are missing
 */
export function createMCPInstance(instanceData: MCPInstanceCreateData): Promise<MCPInstanceRecord>;
/**
 * Create MCP instance with atomic plan limit checking
 * @param {MCPInstanceCreateData} instanceData - Instance creation data including user ID, service info, and credentials
 * @param {number|null} maxInstances - Maximum allowed active instances (null = unlimited for pro plans)
 * @returns {Promise<CreateInstanceResult>} Success result with instance or failure result with error details
 * @throws {Error} When database connection fails or transaction cannot be started
 */
export function createMCPInstanceWithLimitCheck(instanceData: MCPInstanceCreateData, maxInstances: number | null): Promise<CreateInstanceResult>;
export type MCPInstanceCreateData = import("./types.js").MCPInstanceCreateData;
export type MCPInstanceRecord = import("./types.js").MCPInstanceRecord;
export type CreateInstanceResult = import("./types.js").CreateInstanceResult;
//# sourceMappingURL=creation.d.ts.map