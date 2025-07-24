/**
 * Text formatting utilities for Slack
 * Handles text processing, mentions, and timestamp formatting
 */

/**
 * Format Slack timestamp to human readable format
 * @param {string} ts - Slack timestamp
 * @returns {string|null} Human readable timestamp
 */
export function formatSlackTimestamp(ts) {
	if (!ts) return null;
	
	const date = new Date(parseFloat(ts) * 1000);
	return date.toISOString();
}

/**
 * Format Slack message text with user mentions
 * @param {string} text - Raw message text
 * @param {Object[]} users - Array of user objects for mention resolution
 * @returns {string} Formatted text with resolved mentions
 */
export function formatSlackText(text, users = []) {
	if (!text) return text;

	let formattedText = text;

	// Replace user mentions
	const userMentions = text.match(/<@(U[A-Z0-9]+)>/g);
	if (userMentions) {
		userMentions.forEach(mention => {
			const match = mention.match(/<@(U[A-Z0-9]+)>/);
			if (match && match[1]) {
				const userId = match[1];
				const user = users.find(u => u && u.id === userId);
				if (user && user.name) {
					formattedText = formattedText.replace(mention, `@${user.name}`);
				}
			}
		});
	}

	// Replace channel mentions
	const channelMentions = text.match(/<#(C[A-Z0-9]+)\|([^>]+)>/g);
	if (channelMentions) {
		channelMentions.forEach(mention => {
			const match = mention.match(/<#(C[A-Z0-9]+)\|([^>]+)>/);
			if (match && match[2]) {
				const channelName = match[2];
				formattedText = formattedText.replace(mention, `#${channelName}`);
			}
		});
	}

	// Replace special mentions
	formattedText = formattedText.replace(/<!channel>/g, '@channel');
	formattedText = formattedText.replace(/<!here>/g, '@here');
	formattedText = formattedText.replace(/<!everyone>/g, '@everyone');

	// Replace links
	const linkMatches = text.match(/<(https?:\/\/[^|>]+)(\|([^>]+))?>/g);
	if (linkMatches) {
		linkMatches.forEach(match => {
			const parts = match.match(/<(https?:\/\/[^|>]+)(\|([^>]+))?>/);
			const url = parts[1];
			const linkText = parts[3] || url;
			formattedText = formattedText.replace(match, `[${linkText}](${url})`);
		});
	}

	return formattedText;
}

/**
 * Sanitize content for safe display
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeContent(content) {
	if (!content || typeof content !== 'string') return content;
	
	// Remove potentially harmful characters and scripts
	return content
		.replace(/<script[^>]*>.*?<\/script>/gi, '')
		.replace(/<[^>]+>/g, '')
		.replace(/javascript:/gi, '')
		.replace(/on\w+\s*=/gi, '')
		.trim();
}

/**
 * Truncate long text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
	if (!text || text.length <= maxLength) return text;
	
	return text.substring(0, maxLength - 3) + '...';
}