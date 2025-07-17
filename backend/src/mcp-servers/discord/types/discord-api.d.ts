/**
 * Discord API Type Definitions
 * TypeScript definitions for Discord API responses and requests
 */

// Discord API Response Types
export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar?: string;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	banner?: string;
	accent_color?: number;
	locale?: string;
	verified?: boolean;
	email?: string;
	flags?: number;
	premium_type?: number;
	public_flags?: number;
}

export interface DiscordGuild {
	id: string;
	name: string;
	icon?: string;
	icon_hash?: string;
	splash?: string;
	discovery_splash?: string;
	owner?: boolean;
	owner_id: string;
	permissions?: string;
	region?: string;
	afk_channel_id?: string;
	afk_timeout: number;
	widget_enabled?: boolean;
	widget_channel_id?: string;
	verification_level: number;
	default_message_notifications: number;
	explicit_content_filter: number;
	roles: DiscordRole[];
	emojis: DiscordEmoji[];
	features: string[];
	mfa_level: number;
	application_id?: string;
	system_channel_id?: string;
	system_channel_flags: number;
	rules_channel_id?: string;
	max_presences?: number;
	max_members?: number;
	vanity_url_code?: string;
	description?: string;
	banner?: string;
	premium_tier: number;
	premium_subscription_count?: number;
	preferred_locale: string;
	public_updates_channel_id?: string;
	max_video_channel_users?: number;
	approximate_member_count?: number;
	approximate_presence_count?: number;
	welcome_screen?: DiscordWelcomeScreen;
	nsfw_level: number;
	stickers?: DiscordSticker[];
	premium_progress_bar_enabled: boolean;
}

export interface DiscordChannel {
	id: string;
	type: number;
	guild_id?: string;
	position?: number;
	permission_overwrites?: DiscordOverwrite[];
	name?: string;
	topic?: string;
	nsfw?: boolean;
	last_message_id?: string;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	recipients?: DiscordUser[];
	icon?: string;
	owner_id?: string;
	application_id?: string;
	parent_id?: string;
	last_pin_timestamp?: string;
	rtc_region?: string;
	video_quality_mode?: number;
	message_count?: number;
	member_count?: number;
	thread_metadata?: DiscordThreadMetadata;
	member?: DiscordThreadMember;
	default_auto_archive_duration?: number;
	permissions?: string;
	flags?: number;
	total_message_sent?: number;
}

export interface DiscordMessage {
	id: string;
	channel_id: string;
	author: DiscordUser;
	content: string;
	timestamp: string;
	edited_timestamp?: string;
	tts: boolean;
	mention_everyone: boolean;
	mentions: DiscordUser[];
	mention_roles: string[];
	mention_channels?: DiscordChannelMention[];
	attachments: DiscordAttachment[];
	embeds: DiscordEmbed[];
	reactions?: DiscordReaction[];
	nonce?: string | number;
	pinned: boolean;
	webhook_id?: string;
	type: number;
	activity?: DiscordMessageActivity;
	application?: DiscordApplication;
	application_id?: string;
	message_reference?: DiscordMessageReference;
	flags?: number;
	referenced_message?: DiscordMessage;
	interaction?: DiscordMessageInteraction;
	thread?: DiscordChannel;
	components?: DiscordComponent[];
	sticker_items?: DiscordStickerItem[];
	stickers?: DiscordSticker[];
	position?: number;
}

export interface DiscordRole {
	id: string;
	name: string;
	color: number;
	hoist: boolean;
	icon?: string;
	unicode_emoji?: string;
	position: number;
	permissions: string;
	managed: boolean;
	mentionable: boolean;
	tags?: DiscordRoleTags;
}

export interface DiscordEmbed {
	title?: string;
	type?: string;
	description?: string;
	url?: string;
	timestamp?: string;
	color?: number;
	footer?: DiscordEmbedFooter;
	image?: DiscordEmbedImage;
	thumbnail?: DiscordEmbedThumbnail;
	video?: DiscordEmbedVideo;
	provider?: DiscordEmbedProvider;
	author?: DiscordEmbedAuthor;
	fields?: DiscordEmbedField[];
}

export interface DiscordEmbedFooter {
	text: string;
	icon_url?: string;
	proxy_icon_url?: string;
}

export interface DiscordEmbedImage {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface DiscordEmbedThumbnail {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface DiscordEmbedVideo {
	url?: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface DiscordEmbedProvider {
	name?: string;
	url?: string;
}

export interface DiscordEmbedAuthor {
	name: string;
	url?: string;
	icon_url?: string;
	proxy_icon_url?: string;
}

export interface DiscordEmbedField {
	name: string;
	value: string;
	inline?: boolean;
}

export interface DiscordAttachment {
	id: string;
	filename: string;
	description?: string;
	content_type?: string;
	size: number;
	url: string;
	proxy_url: string;
	height?: number;
	width?: number;
	ephemeral?: boolean;
}

export interface DiscordReaction {
	count: number;
	me: boolean;
	emoji: DiscordEmoji;
}

export interface DiscordEmoji {
	id?: string;
	name?: string;
	roles?: string[];
	user?: DiscordUser;
	require_colons?: boolean;
	managed?: boolean;
	animated?: boolean;
	available?: boolean;
}

// Request Types
export interface DiscordApiRequest {
	method?: string;
	headers?: Record<string, string>;
	body?: string | object;
	timeout?: number;
}

export interface DiscordApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	statusCode?: number;
	headers?: Record<string, string>;
}

// Message Creation Types
export interface CreateMessageRequest {
	content?: string;
	tts?: boolean;
	embeds?: DiscordEmbed[];
	allowed_mentions?: DiscordAllowedMentions;
	message_reference?: DiscordMessageReference;
	components?: DiscordComponent[];
	sticker_ids?: string[];
	attachments?: DiscordAttachment[];
	flags?: number;
}

export interface EditMessageRequest {
	content?: string;
	embeds?: DiscordEmbed[];
	flags?: number;
	allowed_mentions?: DiscordAllowedMentions;
	components?: DiscordComponent[];
	attachments?: DiscordAttachment[];
}

export interface DiscordAllowedMentions {
	parse?: string[];
	roles?: string[];
	users?: string[];
	replied_user?: boolean;
}

export interface DiscordMessageReference {
	message_id?: string;
	channel_id?: string;
	guild_id?: string;
	fail_if_not_exists?: boolean;
}

// Component Types
export interface DiscordComponent {
	type: number;
	style?: number;
	label?: string;
	emoji?: DiscordEmoji;
	custom_id?: string;
	url?: string;
	disabled?: boolean;
	components?: DiscordComponent[];
}

// Additional Types
export interface DiscordOverwrite {
	id: string;
	type: number;
	allow: string;
	deny: string;
}

export interface DiscordThreadMetadata {
	archived: boolean;
	auto_archive_duration: number;
	archive_timestamp: string;
	locked: boolean;
	invitable?: boolean;
	create_timestamp?: string;
}

export interface DiscordThreadMember {
	id?: string;
	user_id?: string;
	join_timestamp: string;
	flags: number;
}

export interface DiscordChannelMention {
	id: string;
	guild_id: string;
	type: number;
	name: string;
}

export interface DiscordMessageActivity {
	type: number;
	party_id?: string;
}

export interface DiscordApplication {
	id: string;
	name: string;
	icon?: string;
	description: string;
	summary?: string;
	bot?: DiscordUser;
}

export interface DiscordMessageInteraction {
	id: string;
	type: number;
	name: string;
	user: DiscordUser;
	member?: DiscordGuildMember;
}

export interface DiscordGuildMember {
	user?: DiscordUser;
	nick?: string;
	avatar?: string;
	roles: string[];
	joined_at: string;
	premium_since?: string;
	deaf: boolean;
	mute: boolean;
	flags: number;
	pending?: boolean;
	permissions?: string;
	communication_disabled_until?: string;
}

export interface DiscordStickerItem {
	id: string;
	name: string;
	format_type: number;
}

export interface DiscordSticker {
	id: string;
	pack_id?: string;
	name: string;
	description?: string;
	tags: string;
	asset?: string;
	type: number;
	format_type: number;
	available?: boolean;
	guild_id?: string;
	user?: DiscordUser;
	sort_value?: number;
}

export interface DiscordRoleTags {
	bot_id?: string;
	integration_id?: string;
	premium_subscriber?: null;
	subscription_listing_id?: string;
	available_for_purchase?: null;
	guild_connections?: null;
}

export interface DiscordWelcomeScreen {
	description?: string;
	welcome_channels: DiscordWelcomeScreenChannel[];
}

export interface DiscordWelcomeScreenChannel {
	channel_id: string;
	description: string;
	emoji_id?: string;
	emoji_name?: string;
}

// Role Management Types
export interface CreateRoleRequest {
	name?: string;
	permissions?: string;
	color?: number;
	hoist?: boolean;
	icon?: string;
	unicode_emoji?: string;
	mentionable?: boolean;
}

export interface ModifyRoleRequest {
	name?: string;
	permissions?: string;
	color?: number;
	hoist?: boolean;
	icon?: string;
	unicode_emoji?: string;
	mentionable?: boolean;
}

// Invite Types
export interface DiscordInvite {
	code: string;
	guild?: DiscordGuild;
	channel?: DiscordChannel;
	inviter?: DiscordUser;
	target_type?: number;
	target_user?: DiscordUser;
	target_application?: DiscordApplication;
	approximate_presence_count?: number;
	approximate_member_count?: number;
	expires_at?: string;
	stage_instance?: DiscordStageInstance;
	guild_scheduled_event?: DiscordGuildScheduledEvent;
}

export interface CreateInviteRequest {
	max_age?: number;
	max_uses?: number;
	temporary?: boolean;
	unique?: boolean;
	target_type?: number;
	target_user_id?: string;
	target_application_id?: string;
}

export interface DiscordStageInstance {
	id: string;
	guild_id: string;
	channel_id: string;
	topic: string;
	privacy_level: number;
	discoverable_disabled: boolean;
	guild_scheduled_event_id?: string;
}

export interface DiscordGuildScheduledEvent {
	id: string;
	guild_id: string;
	channel_id?: string;
	creator_id?: string;
	name: string;
	description?: string;
	scheduled_start_time: string;
	scheduled_end_time?: string;
	privacy_level: number;
	status: number;
	entity_type: number;
	entity_id?: string;
	entity_metadata?: DiscordGuildScheduledEventEntityMetadata;
	creator?: DiscordUser;
	user_count?: number;
	image?: string;
}

export interface DiscordGuildScheduledEventEntityMetadata {
	location?: string;
}

// OAuth Types
export interface DiscordOAuthTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	scope: string;
}

export interface DiscordOAuthTokenRequest {
	grant_type: string;
	code?: string;
	redirect_uri?: string;
	client_id: string;
	client_secret: string;
	refresh_token?: string;
}

// Error Types
export interface DiscordApiError {
	code: number;
	message: string;
	errors?: Record<string, any>;
}

export interface DiscordApiErrorResponse {
	code: number;
	message: string;
	errors?: Record<string, any>;
}

// Rate Limit Types
export interface DiscordRateLimitInfo {
	limit: number;
	remaining: number;
	reset: number;
	resetAfter: number;
	bucket: string;
	global: boolean;
}

// Webhook Types
export interface DiscordWebhook {
	id: string;
	type: number;
	guild_id?: string;
	channel_id?: string;
	user?: DiscordUser;
	name?: string;
	avatar?: string;
	token?: string;
	application_id?: string;
	source_guild?: DiscordGuild;
	source_channel?: DiscordChannel;
	url?: string;
}

export interface WebhookExecuteRequest {
	content?: string;
	username?: string;
	avatar_url?: string;
	tts?: boolean;
	embeds?: DiscordEmbed[];
	allowed_mentions?: DiscordAllowedMentions;
	components?: DiscordComponent[];
	attachments?: DiscordAttachment[];
	flags?: number;
	thread_name?: string;
}

// Connection Types
export interface DiscordConnection {
	id: string;
	name: string;
	type: string;
	revoked?: boolean;
	integrations?: DiscordIntegration[];
	verified: boolean;
	friend_sync: boolean;
	show_activity: boolean;
	visibility: number;
}

export interface DiscordIntegration {
	id: string;
	name: string;
	type: string;
	enabled: boolean;
	syncing?: boolean;
	role_id?: string;
	enable_emoticons?: boolean;
	expire_behavior?: number;
	expire_grace_period?: number;
	user?: DiscordUser;
	account: DiscordIntegrationAccount;
	synced_at?: string;
	subscriber_count?: number;
	revoked?: boolean;
	application?: DiscordApplication;
	scopes?: string[];
}

export interface DiscordIntegrationAccount {
	id: string;
	name: string;
}
