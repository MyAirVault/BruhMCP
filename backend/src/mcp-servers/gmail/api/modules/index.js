/**
 * Gmail API Modules Export
 * Central export file for all Gmail API operation modules
 */

// Core request handling
export { makeGmailRequest } from './requestHandler.js';

// Message operations
export {
	sendEmail,
	fetchEmails,
	fetchMessageById,
	replyToEmail,
	deleteMessage,
	moveToTrash,
	searchEmails
} from './messageOperations.js';

// Draft operations
export {
	createDraft,
	sendDraft,
	listDrafts
} from './draftOperations.js';

// Thread operations
export {
	getThread
} from './threadOperations.js';

// Label operations
export {
	markAsRead,
	markAsUnread
} from './labelOperations.js';

// Attachment operations
export {
	downloadAttachment,
	listAttachments,
	sendEmailWithAttachments
} from './attachmentOperations.js';