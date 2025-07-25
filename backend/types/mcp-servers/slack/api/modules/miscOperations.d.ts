/**
 * @typedef {Object} CreateReminderArgs
 * @property {string} text - Reminder text
 * @property {string} time - Reminder time
 * @property {string} [user] - User ID to remind
 */
/**
 * @typedef {import('../../middleware/types.js').SlackTeam} SlackTeam
 */
/**
 * @typedef {Object} SlackTeamResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackTeam} [team] - Team object
 * @property {string} [error] - Error message
 */
/**
 * @typedef {Object} ReminderResult
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Create a reminder
 * @param {CreateReminderArgs} args - Reminder arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReminderResult>} Reminder result
 */
export function createReminder(args: CreateReminderArgs, bearerToken: string): Promise<ReminderResult>;
/**
 * @typedef {Object} FormattedTeam
 * @property {string} id - Team ID
 * @property {string} name - Team name
 */
/**
 * @typedef {Object} TeamInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedTeam|null} team - Formatted team object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */
/**
 * Get team information
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<TeamInfoResult>} Team info result
 */
export function getTeamInfo(bearerToken: string): Promise<TeamInfoResult>;
/**
 * @typedef {Object} AuthTestResult
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [user] - User ID
 * @property {string} [error] - Error message
 */
/**
 * Test authentication
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<AuthTestResult>} Auth test result
 */
export function testAuth(bearerToken: string): Promise<AuthTestResult>;
export type CreateReminderArgs = {
    /**
     * - Reminder text
     */
    text: string;
    /**
     * - Reminder time
     */
    time: string;
    /**
     * - User ID to remind
     */
    user?: string | undefined;
};
export type SlackTeam = import("../../middleware/types.js").SlackTeam;
export type SlackTeamResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Team object
     */
    team?: import("../../middleware/types.js").SlackTeam | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type ReminderResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type FormattedTeam = {
    /**
     * - Team ID
     */
    id: string;
    /**
     * - Team name
     */
    name: string;
};
export type TeamInfoResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Formatted team object
     */
    team: FormattedTeam | null;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type AuthTestResult = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Summary message
     */
    summary: string;
    /**
     * - User ID
     */
    user?: string | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
//# sourceMappingURL=miscOperations.d.ts.map