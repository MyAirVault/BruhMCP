/**
 * Entity formatting utilities for Slack
 * Handles channel, user, and team formatting
 */

import { debug } from './logger.js';
import { formatMessageResponse } from './messageFormatting.js';

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
export function formatChannelResponse(channel) {
	if (!channel) return null;

	/** @type {Record<string, any>} */
	const formatted = {
		id: channel.id,
		name: channel.name,
		is_channel: channel.is_channel,
		is_group: channel.is_group,
		is_im: channel.is_im,
		is_mpim: channel.is_mpim,
		is_private: channel.is_private,
		created: channel.created,
		creator: channel.creator,
		is_archived: channel.is_archived,
		is_general: channel.is_general,
		name_normalized: channel.name_normalized,
		is_shared: channel.is_shared,
		is_member: channel.is_member,
		num_members: channel.num_members
	};

	// Add topic if available
	if (channel.topic) {
		formatted.topic = {
			value: channel.topic.value,
			creator: channel.topic.creator,
			last_set: channel.topic.last_set
		};
	}

	// Add purpose if available
	if (channel.purpose) {
		formatted.purpose = {
			value: channel.purpose.value,
			creator: channel.purpose.creator,
			last_set: channel.purpose.last_set
		};
	}

	// Add latest message timestamp if available
	if (channel.latest) {
		formatted.latest_message = formatMessageResponse(channel.latest);
	}

	return formatted;
}

/**
 * Format a Slack user response
 * @param {SlackUser|Object|null} user - Raw Slack user object
 * @returns {Object|null} Formatted user
 */
export function formatUserResponse(user) {
	if (!user) return null;

	/** @type {Record<string, any>} */
	const formatted = {
		id: user.id,
		name: user.name,
		deleted: user.deleted,
		real_name: user.real_name,
		tz: user.tz,
		tz_label: user.tz_label,
		tz_offset: user.tz_offset,
		is_admin: user.is_admin,
		is_owner: user.is_owner,
		is_primary_owner: user.is_primary_owner,
		is_restricted: user.is_restricted,
		is_ultra_restricted: user.is_ultra_restricted,
		is_bot: user.is_bot,
		is_app_user: user.is_app_user,
		updated: user.updated,
		has_2fa: user.has_2fa
	};

	// Add profile information if available
	if (user.profile) {
		formatted.profile = {
			title: user.profile.title,
			phone: user.profile.phone,
			skype: user.profile.skype,
			real_name: user.profile.real_name,
			real_name_normalized: user.profile.real_name_normalized,
			display_name: user.profile.display_name,
			display_name_normalized: user.profile.display_name_normalized,
			status_text: user.profile.status_text,
			status_emoji: user.profile.status_emoji,
			status_expiration: user.profile.status_expiration,
			avatar_hash: user.profile.avatar_hash,
			email: user.profile.email,
			first_name: user.profile.first_name,
			last_name: user.profile.last_name,
			image_24: user.profile.image_24,
			image_32: user.profile.image_32,
			image_48: user.profile.image_48,
			image_72: user.profile.image_72,
			image_192: user.profile.image_192,
			image_512: user.profile.image_512,
			image_1024: user.profile.image_1024,
			image_original: user.profile.image_original,
			team: user.profile.team
		};
	}

	return formatted;
}

/**
 * Format team information response
 * @param {SlackTeam|null} team - Team information from Slack API
 * @returns {Object|null} Formatted team information
 */
export function formatTeamResponse(team) {
	if (!team) return null;
	
	debug('Formatting team response', { teamId: team.id, teamName: team.name });
	
	return {
		id: team.id,
		name: team.name,
		domain: team.domain,
		email_domain: team.email_domain,
		icon: team.icon,
		enterprise_id: team.enterprise_id,
		enterprise_name: team.enterprise_name,
		avatar_base_url: team.avatar_base_url,
		is_verified: team.is_verified,
		discovery_setting: team.discovery_setting
	};
}