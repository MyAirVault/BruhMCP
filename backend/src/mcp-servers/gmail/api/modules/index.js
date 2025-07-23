/**
 * Gmail API Modules Export
 * Central export file for all Gmail API operation modules
 */

// Core request handling
export { makeGmailRequest } from './request-handler.js';

// Message operations
export {
	sendEmail,
	fetchEmails,
	fetchMessageById,
	replyToEmail,
	deleteMessage,
	moveToTrash,
	searchEmails
} from './message-operations.js';

// Draft operations
export {
	createDraft,
	sendDraft,
	listDrafts
} from './draft-operations.js';

// Thread operations
export {
	getThread
} from './thread-operations.js';

// Label operations
export {
	markAsRead,
	markAsUnread
} from './label-operations.js';

// Attachment operations
export {
	downloadAttachment,
	listAttachments,
	sendEmailWithAttachments
} from './attachment-operations.js';