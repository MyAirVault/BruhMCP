/**
 * Gmail API Modules Export
 * Central export file for all Gmail API operation modules
 */

// Core request handling
;

// Message operations
;

// Draft operations
;

// Thread operations
;

// Label operations
;

// Attachment operations
;

module.exports = {
	makeGmailRequest: require('./requestHandler.js').makeGmailRequest,
	sendEmail: require('./messageOperations.js').sendEmail,
	fetchEmails: require('./messageOperations.js').fetchEmails,
	fetchMessageById: require('./messageOperations.js').fetchMessageById,
	replyToEmail: require('./messageOperations.js').replyToEmail,
	deleteMessage: require('./messageOperations.js').deleteMessage,
	moveToTrash: require('./messageOperations.js').moveToTrash,
	searchEmails: require('./messageOperations.js').searchEmails,
	createDraft: require('./draftOperations.js').createDraft,
	sendDraft: require('./draftOperations.js').sendDraft,
	listDrafts: require('./draftOperations.js').listDrafts,
	getThread: require('./threadOperations.js').getThread,
	markAsRead: require('./labelOperations.js').markAsRead,
	markAsUnread: require('./labelOperations.js').markAsUnread,
	downloadAttachment: require('./attachmentOperations.js').downloadAttachment,
	listAttachments: require('./attachmentOperations.js').listAttachments,
	sendEmailWithAttachments: require('./attachmentOperations.js').sendEmailWithAttachments
};