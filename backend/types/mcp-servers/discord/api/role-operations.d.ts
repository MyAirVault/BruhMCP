/**
 * List all roles in a guild
 * @param {string} guildId - Guild ID
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Guild roles
 */
export function listGuildRoles(guildId: string, botToken: string): Object;
/**
 * Create a new role in a guild
 * @param {string} guildId - Guild ID
 * @param {Object} args - Role creation arguments
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Created role
 */
export function createGuildRole(guildId: string, args: Object, botToken: string): Object;
/**
 * Modify a role in a guild
 * @param {string} guildId - Guild ID
 * @param {string} roleId - Role ID
 * @param {Object} args - Role modification arguments
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Modified role
 */
export function modifyGuildRole(guildId: string, roleId: string, args: Object, botToken: string): Object;
/**
 * Delete a role from a guild
 * @param {string} guildId - Guild ID
 * @param {string} roleId - Role ID
 * @param {string} reason - Reason for deletion
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Deletion result
 */
export function deleteGuildRole(guildId: string, roleId: string, reason: string, botToken: string): Object;
/**
 * Add role to guild member
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @param {string} reason - Reason for role addition
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role addition result
 */
export function addMemberRole(guildId: string, userId: string, roleId: string, reason: string, botToken: string): Object;
/**
 * Remove role from guild member
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @param {string} reason - Reason for role removal
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role removal result
 */
export function removeMemberRole(guildId: string, userId: string, roleId: string, reason: string, botToken: string): Object;
/**
 * Modify multiple roles for a guild member
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {Object} args - Role modification arguments
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role modification result
 */
export function modifyMemberRoles(guildId: string, userId: string, args: Object, botToken: string): Object;
/**
 * Get guild member with roles
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Member with roles
 */
export function getMemberWithRoles(guildId: string, userId: string, botToken: string): Object;
/**
 * Get role by ID
 * @param {string} guildId - Guild ID
 * @param {string} roleId - Role ID
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role information
 */
export function getGuildRole(guildId: string, roleId: string, botToken: string): Object;
//# sourceMappingURL=role-operations.d.ts.map