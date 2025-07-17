/**
 * Discord Role Operations
 * Discord equivalent of Gmail label operations - manages roles and permissions
 */

import { formatErrorResponse, formatSuccessResponse } from '../utils/discord-formatting.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

/**
 * Make authenticated request to Discord API with proper error handling
 * @param {string} endpoint - API endpoint
 * @param {string} token - Bot token (role operations require bot token)
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeDiscordRequest(endpoint, token, options = {}) {
	const url = `${DISCORD_API_BASE}${endpoint}`;

	const timeout = options.timeout || 30000;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bot ${token}`,
			'Content-Type': 'application/json',
			'User-Agent': 'Discord MCP Server (https://github.com/minimcp, 1.0.0)',
			...options.headers,
		},
		signal: controller.signal,
		...options,
	};

	if (options.body && typeof options.body === 'object') {
		requestOptions.body = JSON.stringify(options.body);
	}

	console.log(`📡 Discord Role API Request: ${requestOptions.method} ${url}`);

	try {
		const response = await fetch(url, requestOptions);
		clearTimeout(timeoutId);

		if (response.status === 429) {
			const retryAfter = response.headers.get('Retry-After');
			throw new Error(`Discord API rate limited. Retry after ${retryAfter} seconds.`);
		}

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `Discord API error: ${response.status} ${response.statusText}`;

			try {
				const errorData = JSON.parse(errorText);
				if (errorData.message) {
					errorMessage = `Discord API error: ${errorData.message}`;
				}
			} catch (parseError) {
				// Use default error message
			}

			throw new Error(errorMessage);
		}

		let data;
		try {
			data = await response.json();
		} catch (jsonError) {
			console.warn('Failed to parse Discord API response as JSON:', jsonError);
			throw new Error('Invalid JSON response from Discord API');
		}

		if (data === null || data === undefined) {
			throw new Error('Received null or undefined response from Discord API');
		}

		console.log(`✅ Discord Role API Response: ${response.status}`);
		return data;
	} catch (error) {
		clearTimeout(timeoutId);

		if (error.name === 'AbortError') {
			throw new Error(`Discord API request timeout after ${timeout}ms`);
		}

		throw error;
	}
}

/**
 * List all roles in a guild
 * @param {string} guildId - Guild ID
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Guild roles
 */
export async function listGuildRoles(guildId, botToken) {
	try {
		const result = await makeDiscordRequest(`/guilds/${guildId}/roles`, botToken);

		if (!Array.isArray(result)) {
			throw new Error('Invalid roles data received from Discord API');
		}

		return formatSuccessResponse('list_guild_roles', {
			guildId,
			count: result.length,
			roles: result.map(role => ({
				id: role.id,
				name: role.name,
				color: role.color,
				hoist: role.hoist,
				icon: role.icon,
				unicodeEmoji: role.unicode_emoji,
				position: role.position,
				permissions: role.permissions,
				managed: role.managed,
				mentionable: role.mentionable,
				tags: role.tags || null,
			})),
		});
	} catch (error) {
		console.error('❌ Error listing guild roles:', error);
		return formatErrorResponse('list_guild_roles', error, { guildId });
	}
}

/**
 * Create a new role in a guild
 * @param {string} guildId - Guild ID
 * @param {Object} args - Role creation arguments
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Created role
 */
export async function createGuildRole(guildId, args, botToken) {
	const { name, permissions, color, hoist, icon, unicodeEmoji, mentionable, reason } = args;

	try {
		const roleData = {
			name: name || 'new role',
			permissions: permissions || '0',
			color: color || 0,
			hoist: hoist || false,
			mentionable: mentionable || false,
		};

		if (icon) roleData.icon = icon;
		if (unicodeEmoji) roleData.unicode_emoji = unicodeEmoji;

		const headers = {};
		if (reason) headers['X-Audit-Log-Reason'] = reason;

		const result = await makeDiscordRequest(`/guilds/${guildId}/roles`, botToken, {
			method: 'POST',
			body: roleData,
			headers,
		});

		return formatSuccessResponse('create_guild_role', {
			guildId,
			role: {
				id: result.id,
				name: result.name,
				color: result.color,
				hoist: result.hoist,
				icon: result.icon,
				unicodeEmoji: result.unicode_emoji,
				position: result.position,
				permissions: result.permissions,
				managed: result.managed,
				mentionable: result.mentionable,
			},
		});
	} catch (error) {
		console.error('❌ Error creating guild role:', error);
		return formatErrorResponse('create_guild_role', error, { guildId, name });
	}
}

/**
 * Modify a role in a guild
 * @param {string} guildId - Guild ID
 * @param {string} roleId - Role ID
 * @param {Object} args - Role modification arguments
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Modified role
 */
export async function modifyGuildRole(guildId, roleId, args, botToken) {
	const { name, permissions, color, hoist, icon, unicodeEmoji, mentionable, reason } = args;

	try {
		const roleData = {};
		if (name !== undefined) roleData.name = name;
		if (permissions !== undefined) roleData.permissions = permissions;
		if (color !== undefined) roleData.color = color;
		if (hoist !== undefined) roleData.hoist = hoist;
		if (icon !== undefined) roleData.icon = icon;
		if (unicodeEmoji !== undefined) roleData.unicode_emoji = unicodeEmoji;
		if (mentionable !== undefined) roleData.mentionable = mentionable;

		const headers = {};
		if (reason) headers['X-Audit-Log-Reason'] = reason;

		const result = await makeDiscordRequest(`/guilds/${guildId}/roles/${roleId}`, botToken, {
			method: 'PATCH',
			body: roleData,
			headers,
		});

		return formatSuccessResponse('modify_guild_role', {
			guildId,
			roleId,
			role: {
				id: result.id,
				name: result.name,
				color: result.color,
				hoist: result.hoist,
				icon: result.icon,
				unicodeEmoji: result.unicode_emoji,
				position: result.position,
				permissions: result.permissions,
				managed: result.managed,
				mentionable: result.mentionable,
			},
		});
	} catch (error) {
		console.error('❌ Error modifying guild role:', error);
		return formatErrorResponse('modify_guild_role', error, { guildId, roleId });
	}
}

/**
 * Delete a role from a guild
 * @param {string} guildId - Guild ID
 * @param {string} roleId - Role ID
 * @param {string} reason - Reason for deletion
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Deletion result
 */
export async function deleteGuildRole(guildId, roleId, reason, botToken) {
	try {
		const headers = {};
		if (reason) headers['X-Audit-Log-Reason'] = reason;

		await makeDiscordRequest(`/guilds/${guildId}/roles/${roleId}`, botToken, {
			method: 'DELETE',
			headers,
		});

		return formatSuccessResponse('delete_guild_role', {
			guildId,
			roleId,
			deleted: true,
		});
	} catch (error) {
		console.error('❌ Error deleting guild role:', error);
		return formatErrorResponse('delete_guild_role', error, { guildId, roleId });
	}
}

/**
 * Add role to guild member
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @param {string} reason - Reason for role addition
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role addition result
 */
export async function addMemberRole(guildId, userId, roleId, reason, botToken) {
	try {
		const headers = {};
		if (reason) headers['X-Audit-Log-Reason'] = reason;

		await makeDiscordRequest(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, botToken, {
			method: 'PUT',
			headers,
		});

		return formatSuccessResponse('add_member_role', {
			guildId,
			userId,
			roleId,
			added: true,
		});
	} catch (error) {
		console.error('❌ Error adding member role:', error);
		return formatErrorResponse('add_member_role', error, { guildId, userId, roleId });
	}
}

/**
 * Remove role from guild member
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @param {string} reason - Reason for role removal
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role removal result
 */
export async function removeMemberRole(guildId, userId, roleId, reason, botToken) {
	try {
		const headers = {};
		if (reason) headers['X-Audit-Log-Reason'] = reason;

		await makeDiscordRequest(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, botToken, {
			method: 'DELETE',
			headers,
		});

		return formatSuccessResponse('remove_member_role', {
			guildId,
			userId,
			roleId,
			removed: true,
		});
	} catch (error) {
		console.error('❌ Error removing member role:', error);
		return formatErrorResponse('remove_member_role', error, { guildId, userId, roleId });
	}
}

/**
 * Modify multiple roles for a guild member
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {Object} args - Role modification arguments
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role modification result
 */
export async function modifyMemberRoles(guildId, userId, args, botToken) {
	const { roles, reason } = args;

	try {
		const headers = {};
		if (reason) headers['X-Audit-Log-Reason'] = reason;

		const result = await makeDiscordRequest(`/guilds/${guildId}/members/${userId}`, botToken, {
			method: 'PATCH',
			body: { roles },
			headers,
		});

		return formatSuccessResponse('modify_member_roles', {
			guildId,
			userId,
			roles: result.roles || [],
			modified: true,
		});
	} catch (error) {
		console.error('❌ Error modifying member roles:', error);
		return formatErrorResponse('modify_member_roles', error, { guildId, userId });
	}
}

/**
 * Get guild member with roles
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Member with roles
 */
export async function getMemberWithRoles(guildId, userId, botToken) {
	try {
		const result = await makeDiscordRequest(`/guilds/${guildId}/members/${userId}`, botToken);

		if (!result || typeof result !== 'object') {
			throw new Error('Invalid member data received from Discord API');
		}

		return formatSuccessResponse('get_member_with_roles', {
			guildId,
			userId,
			member: {
				user: result.user || null,
				nick: result.nick || null,
				roles: Array.isArray(result.roles) ? result.roles : [],
				joinedAt: result.joined_at || null,
				premiumSince: result.premium_since || null,
				permissions: result.permissions || null,
			},
		});
	} catch (error) {
		console.error('❌ Error getting member with roles:', error);
		return formatErrorResponse('get_member_with_roles', error, { guildId, userId });
	}
}

/**
 * Get role by ID
 * @param {string} guildId - Guild ID
 * @param {string} roleId - Role ID
 * @param {string} botToken - Bot token (required for role operations)
 * @returns {Object} Role information
 */
export async function getGuildRole(guildId, roleId, botToken) {
	try {
		const roles = await makeDiscordRequest(`/guilds/${guildId}/roles`, botToken);

		if (!Array.isArray(roles)) {
			throw new Error('Invalid roles data received from Discord API');
		}

		const role = roles.find(r => r.id === roleId);

		if (!role) {
			throw new Error(`Role with ID ${roleId} not found in guild ${guildId}`);
		}

		return formatSuccessResponse('get_guild_role', {
			guildId,
			roleId,
			role: {
				id: role.id,
				name: role.name,
				color: role.color,
				hoist: role.hoist,
				icon: role.icon,
				unicodeEmoji: role.unicode_emoji,
				position: role.position,
				permissions: role.permissions,
				managed: role.managed,
				mentionable: role.mentionable,
				tags: role.tags || null,
			},
		});
	} catch (error) {
		console.error('❌ Error getting guild role:', error);
		return formatErrorResponse('get_guild_role', error, { guildId, roleId });
	}
}
