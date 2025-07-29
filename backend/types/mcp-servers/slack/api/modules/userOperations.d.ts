export type UserInfoArgs = {
    /**
     * - User ID
     */
    user: string;
};
export type ListUsersArgs = {
    /**
     * - Number of users to return
     */
    limit?: number | undefined;
    /**
     * - Pagination cursor
     */
    cursor?: string | undefined;
};
export type SlackUser = import('../../middleware/types.js').SlackUser;
export type SlackUserResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - User object
     */
    user?: import("../../middleware/types.js").SlackUser | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type SlackUsersResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Array of users
     */
    members?: import("../../middleware/types.js").SlackUser[] | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type FormattedUser = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - Username
     */
    name: string;
    /**
     * - Real name
     */
    real_name: string;
    /**
     * - Whether user is admin
     */
    is_admin: boolean;
    /**
     * - Whether user is a bot
     */
    is_bot: boolean;
    /**
     * - Whether user is deleted
     */
    deleted: boolean;
};
export type UserInfoResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Formatted user object
     */
    user: FormattedUser | null;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type UsersListResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Array of formatted users
     */
    members: (FormattedUser | null)[];
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
/**
 * @typedef {Object} UserInfoArgs
 * @property {string} user - User ID
 */
/**
 * @typedef {Object} ListUsersArgs
 * @property {number} [limit] - Number of users to return
 * @property {string} [cursor] - Pagination cursor
 */
/**
 * @typedef {import('../../middleware/types.js').SlackUser} SlackUser
 */
/**
 * @typedef {Object} SlackUserResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackUser} [user] - User object
 * @property {string} [error] - Error message
 */
/**
 * @typedef {Object} SlackUsersResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackUser[]} [members] - Array of users
 * @property {string} [error] - Error message
 */
/**
 * @typedef {Object} FormattedUser
 * @property {string} id - User ID
 * @property {string} name - Username
 * @property {string} real_name - Real name
 * @property {boolean} is_admin - Whether user is admin
 * @property {boolean} is_bot - Whether user is a bot
 * @property {boolean} deleted - Whether user is deleted
 */
/**
 * @typedef {Object} UserInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedUser|null} user - Formatted user object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Get information about a user
 * @param {UserInfoArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<UserInfoResult>} User info result
 */
export function getUserInfo(args: UserInfoArgs, bearerToken: string): Promise<UserInfoResult>;
/**
 * @typedef {Object} UsersListResult
 * @property {boolean} ok - Success indicator
 * @property {(FormattedUser|null)[]} members - Array of formatted users
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * List users in the workspace
 * @param {ListUsersArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<UsersListResult>} Users list result
 */
export function listUsers(args: ListUsersArgs, bearerToken: string): Promise<UsersListResult>;
//# sourceMappingURL=userOperations.d.ts.map