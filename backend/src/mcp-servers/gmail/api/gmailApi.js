/**
 * Gmail API Integration
 * Re-exports all Gmail API operations from modular structure
 */

// Re-export all functions from modular structure
const {
	makeGmailRequest,
	sendEmail,
	fetchEmails,
	fetchMessageById,
	replyToEmail,
	deleteMessage,
	moveToTrash,
	searchEmails,
	createDraft,
	sendDraft,
	listDrafts,
	getThread,
	markAsRead,
	markAsUnread,
	downloadAttachment,
	listAttachments,
	sendEmailWithAttachments
} = require('./modules/index.js');

module.exports = {
	makeGmailRequest,
	sendEmail,
	fetchEmails,
	fetchMessageById,
	replyToEmail,
	deleteMessage,
	moveToTrash,
	searchEmails,
	createDraft,
	sendDraft,
	listDrafts,
	getThread,
	markAsRead,
	markAsUnread,
	downloadAttachment,
	listAttachments,
	sendEmailWithAttachments
};
