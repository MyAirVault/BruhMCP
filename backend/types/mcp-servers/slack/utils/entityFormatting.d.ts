/**
 * @typedef {import('../middleware/types.js').SlackChannel} SlackChannel
 * @typedef {import('../middleware/types.js').SlackUser} SlackUser
 * @typedef {import('../middleware/types.js').SlackTeam} SlackTeam
 * @typedef {import('../middleware/types.js').SlackTopic} SlackTopic
 * @typedef {import('../middleware/types.js').SlackPurpose} SlackPurpose
 * @typedef {import('../middleware/types.js').SlackMessage} SlackMessage
 */
/**
 * Format a Slack channel response
 * @param {SlackChannel|Object|null} channel - Raw Slack channel object
 * @returns {Object|null} Formatted channel
 */
export function formatChannelResponse(channel: SlackChannel | Object | null): Object | null;
/**
 * Format a Slack user response
 * @param {SlackUser|Object|null} user - Raw Slack user object
 * @returns {Object|null} Formatted user
 */
export function formatUserResponse(user: SlackUser | Object | null): Object | null;
/**
 * Format team information response
 * @param {SlackTeam|null} team - Team information from Slack API
 * @returns {Object|null} Formatted team information
 */
export function formatTeamResponse(team: SlackTeam | null): Object | null;
export type SlackChannel = import("../middleware/types.js").SlackChannel;
export type SlackUser = import("../middleware/types.js").SlackUser;
export type SlackTeam = import("../middleware/types.js").SlackTeam;
export type SlackTopic = import("../middleware/types.js").SlackTopic;
export type SlackPurpose = import("../middleware/types.js").SlackPurpose;
export type SlackMessage = import("../middleware/types.js").SlackMessage;
//# sourceMappingURL=entityFormatting.d.ts.map