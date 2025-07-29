/**
 * Validation utilities - Main export file
 * Re-exports all validation functions from specialized modules
 */

// Core validation functions
const {
	validateType,
	validateString,
	validateNumber,
	validateArray,
	validateProperty
} = require('./coreValidation');

// Schema validation functions
const {
	validateObject,
	validateToolArguments
} = require('./schemaValidation');

// Slack-specific validation functions
const {
	validateSlackChannelTypes,
	validateSlackFileId,
	validateSlackEmojiName,
	validateSlackReminderTime,
	validateSlackMessageText,
	validateSlackFilename
} = require('./slackValidation');

module.exports = {
	validateType,
	validateString,
	validateNumber,
	validateArray,
	validateProperty,
	validateObject,
	validateToolArguments,
	validateSlackChannelTypes,
	validateSlackFileId,
	validateSlackEmojiName,
	validateSlackReminderTime,
	validateSlackMessageText,
	validateSlackFilename
};