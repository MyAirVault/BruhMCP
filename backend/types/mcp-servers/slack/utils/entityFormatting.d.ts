export type SlackChannel = import("../middleware/types.js").SlackChannel;
export type SlackUser = import("../middleware/types.js").SlackUser;
export type SlackTeam = import("../middleware/types.js").SlackTeam;
export type SlackTopic = import("../middleware/types.js").SlackTopic;
export type SlackPurpose = import("../middleware/types.js").SlackPurpose;
export type SlackMessage = import("../middleware/types.js").SlackMessage;
export type FormattedMessage = import("./messageFormatting.js").FormattedMessage;
/**
 * @typedef {import('../middleware/types.js').SlackChannel} SlackChannel
 * @typedef {import('../middleware/types.js').SlackUser} SlackUser
 * @typedef {import('../middleware/types.js').SlackTeam} SlackTeam
 * @typedef {import('../middleware/types.js').SlackTopic} SlackTopic
 * @typedef {import('../middleware/types.js').SlackPurpose} SlackPurpose
 * @typedef {import('../middleware/types.js').SlackMessage} SlackMessage
 * @typedef {import('./messageFormatting.js').FormattedMessage} FormattedMessage
 */
/**
 * Format a Slack channel response
 * @param {SlackChannel|null} channel - Raw Slack channel object
 * @returns {{
 *   id: string,
 *   name: string,
 *   is_channel: boolean,
 *   is_group: boolean,
 *   is_im: boolean,
 *   is_mpim: boolean,
 *   is_private: boolean,
 *   created: number,
 *   creator: string,
 *   is_archived: boolean,
 *   is_general: boolean,
 *   name_normalized?: string,
 *   is_shared?: boolean,
 *   is_member?: boolean,
 *   num_members?: number,
 *   topic?: { value: string, creator: string, last_set: number },
 *   purpose?: { value: string, creator: string, last_set: number },
 *   latest_message?: FormattedMessage|null
 * }|null} Formatted channel
 */
export function formatChannelResponse(channel: SlackChannel | null): {
    id: string;
    name: string;
    is_channel: boolean;
    is_group: boolean;
    is_im: boolean;
    is_mpim: boolean;
    is_private: boolean;
    created: number;
    creator: string;
    is_archived: boolean;
    is_general: boolean;
    name_normalized?: string;
    is_shared?: boolean;
    is_member?: boolean;
    num_members?: number;
    topic?: {
        value: string;
        creator: string;
        last_set: number;
    };
    purpose?: {
        value: string;
        creator: string;
        last_set: number;
    };
    latest_message?: FormattedMessage | null;
} | null;
/**
 * Format a Slack user response
 * @param {SlackUser|null} user - Raw Slack user object
 * @returns {{
 *   id: string,
 *   name: string,
 *   deleted: boolean,
 *   real_name: string,
 *   tz: string,
 *   tz_label: string,
 *   tz_offset: number,
 *   is_admin: boolean,
 *   is_owner?: boolean,
 *   is_primary_owner?: boolean,
 *   is_restricted?: boolean,
 *   is_ultra_restricted?: boolean,
 *   is_bot: boolean,
 *   is_app_user?: boolean,
 *   updated?: number,
 *   has_2fa?: boolean,
 *   profile?: {
 *     title?: string,
 *     phone?: string,
 *     skype?: string,
 *     real_name?: string,
 *     real_name_normalized?: string,
 *     display_name?: string,
 *     display_name_normalized?: string,
 *     status_text?: string,
 *     status_emoji?: string,
 *     status_expiration?: number,
 *     avatar_hash?: string,
 *     email?: string,
 *     first_name?: string,
 *     last_name?: string,
 *     image_24?: string,
 *     image_32?: string,
 *     image_48?: string,
 *     image_72?: string,
 *     image_192?: string,
 *     image_512?: string,
 *     image_1024?: string,
 *     image_original?: string,
 *     team?: string
 *   }
 * }|null} Formatted user
 */
export function formatUserResponse(user: SlackUser | null): {
    id: string;
    name: string;
    deleted: boolean;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    is_admin: boolean;
    is_owner?: boolean;
    is_primary_owner?: boolean;
    is_restricted?: boolean;
    is_ultra_restricted?: boolean;
    is_bot: boolean;
    is_app_user?: boolean;
    updated?: number;
    has_2fa?: boolean;
    profile?: {
        title?: string;
        phone?: string;
        skype?: string;
        real_name?: string;
        real_name_normalized?: string;
        display_name?: string;
        display_name_normalized?: string;
        status_text?: string;
        status_emoji?: string;
        status_expiration?: number;
        avatar_hash?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        image_24?: string;
        image_32?: string;
        image_48?: string;
        image_72?: string;
        image_192?: string;
        image_512?: string;
        image_1024?: string;
        image_original?: string;
        team?: string;
    };
} | null;
/**
 * Format team information response
 * @param {SlackTeam|null} team - Team information from Slack API
 * @returns {{
 *   id: string,
 *   name: string,
 *   domain?: string,
 *   email_domain?: string,
 *   icon?: Object,
 *   enterprise_id?: string,
 *   enterprise_name?: string,
 *   avatar_base_url?: string,
 *   is_verified?: boolean,
 *   discovery_setting?: string
 * }|null} Formatted team information
 */
export function formatTeamResponse(team: SlackTeam | null): {
    id: string;
    name: string;
    domain?: string;
    email_domain?: string;
    icon?: Object;
    enterprise_id?: string;
    enterprise_name?: string;
    avatar_base_url?: string;
    is_verified?: boolean;
    discovery_setting?: string;
} | null;
//# sourceMappingURL=entityFormatting.d.ts.map