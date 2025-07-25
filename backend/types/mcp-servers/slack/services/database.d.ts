/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (slack)
 * @returns {Promise<InstanceCredentials|null>} Instance credentials or null if not found
 */
export function lookupInstanceCredentials(instanceId: string, serviceName: string): Promise<InstanceCredentials | null>;
/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateInstanceUsage(instanceId: string): Promise<boolean>;
/**
 * Get instance statistics
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<InstanceStatistics|null>} Instance statistics or null if not found
 */
export function getInstanceStatistics(instanceId: string): Promise<InstanceStatistics | null>;
/**
 * Update instance status
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newStatus - New status (active, inactive, expired)
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateInstanceStatus(instanceId: string, newStatus: string): Promise<boolean>;
/**
 * Get all active instances for Slack service
 * @returns {Promise<ActiveInstance[]>} Array of active instance records
 */
export function getActiveSlackInstances(): Promise<ActiveInstance[]>;
/**
 * Validate instance exists and is accessible
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - UUID of the user (for additional security)
 * @returns {Promise<boolean>} Promise that resolves to true if instance is valid and accessible
 */
export function validateInstanceAccess(instanceId: string, userId: string): Promise<boolean>;
/**
 * Clean up expired instances
 * @returns {Promise<number>} Number of instances marked as expired
 */
export function cleanupExpiredInstances(): Promise<number>;
/**
 * Get Slack workspace information for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<SlackWorkspaceInfo|null>} Workspace information or null if not found
 */
export function getSlackWorkspaceInfo(instanceId: string): Promise<SlackWorkspaceInfo | null>;
/**
 * Update Slack team information
 * @param {string} instanceId - UUID of the service instance
 * @param {SlackTeamInfo} teamInfo - Team information object
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateSlackTeamInfo(instanceId: string, teamInfo: SlackTeamInfo): Promise<boolean>;
/**
 * Instance credentials record from database
 */
export type InstanceCredentials = {
    /**
     * - UUID of the service instance
     */
    instance_id: string;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - OAuth completion status
     */
    oauth_status: string;
    /**
     * - Instance status (active, inactive, expired)
     */
    status: string;
    /**
     * - Instance expiration date
     */
    expires_at: Date | null;
    /**
     * - Number of times instance has been used
     */
    usage_count: number;
    /**
     * - User-defined name for instance
     */
    custom_name: string | null;
    /**
     * - Last usage timestamp
     */
    last_used_at: Date | null;
    /**
     * - Name of the MCP service
     */
    mcp_service_name: string;
    /**
     * - Display name of the service
     */
    display_name: string;
    /**
     * - Authentication type
     */
    auth_type: string;
    /**
     * - Whether service is active
     */
    service_active: boolean;
    /**
     * - Service port number
     */
    port: number | null;
    /**
     * - API key if applicable
     */
    api_key: string | null;
    /**
     * - OAuth client ID
     */
    client_id: string | null;
    /**
     * - OAuth client secret
     */
    client_secret: string | null;
    /**
     * - OAuth access token
     */
    access_token: string | null;
    /**
     * - OAuth refresh token
     */
    refresh_token: string | null;
    /**
     * - Token expiration timestamp
     */
    token_expires_at: Date | null;
    /**
     * - OAuth completion timestamp
     */
    oauth_completed_at: Date | null;
    /**
     * - Slack team ID
     */
    team_id: string | null;
    /**
     * - Slack team name
     */
    team_name: string | null;
};
/**
 * Instance statistics record from database
 */
export type InstanceStatistics = {
    /**
     * - UUID of the service instance
     */
    instance_id: string;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - Number of times instance has been used
     */
    usage_count: number;
    /**
     * - Last usage timestamp
     */
    last_used_at: Date | null;
    /**
     * - Instance creation timestamp
     */
    created_at: Date;
    /**
     * - Instance expiration date
     */
    expires_at: Date | null;
    /**
     * - User-defined name for instance
     */
    custom_name: string | null;
    /**
     * - Name of the MCP service
     */
    mcp_service_name: string;
    /**
     * - Display name of the service
     */
    display_name: string;
    /**
     * - Slack team ID
     */
    team_id: string | null;
    /**
     * - Slack team name
     */
    team_name: string | null;
};
/**
 * Active instance record from database
 */
export type ActiveInstance = {
    /**
     * - UUID of the service instance
     */
    instance_id: string;
    /**
     * - UUID of the user
     */
    user_id: string;
    /**
     * - Number of times instance has been used
     */
    usage_count: number;
    /**
     * - Last usage timestamp
     */
    last_used_at: Date | null;
    /**
     * - Instance creation timestamp
     */
    created_at: Date;
    /**
     * - User-defined name for instance
     */
    custom_name: string | null;
    /**
     * - Slack team ID
     */
    team_id: string | null;
    /**
     * - Slack team name
     */
    team_name: string | null;
};
/**
 * Slack workspace information from database
 */
export type SlackWorkspaceInfo = {
    /**
     * - Slack team ID
     */
    team_id: string;
    /**
     * - Slack team name
     */
    team_name: string;
    /**
     * - OAuth access token
     */
    access_token: string;
    /**
     * - Token expiration timestamp
     */
    token_expires_at: Date | null;
    /**
     * - User-defined name for instance
     */
    custom_name: string | null;
    /**
     * - UUID of the user
     */
    user_id: string;
};
/**
 * Team information for updating Slack team data
 */
export type SlackTeamInfo = {
    /**
     * - Slack team ID
     */
    team_id: string;
    /**
     * - Slack team name
     */
    team_name: string;
};
//# sourceMappingURL=database.d.ts.map