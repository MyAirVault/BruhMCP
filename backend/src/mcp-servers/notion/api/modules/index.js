/**
 * Notion API Modules Export
 * Central export file for all Notion API operation modules
 */

// Core request handling
const { makeNotionRequest  } = require('./requestHandler');

module.exports = { makeNotionRequest  };

// Page operations
const { getPage,
	getPageBlocks,
	createPage,
	updatePage
 } = require('./pageOperations');

module.exports = { getPage,
	getPageBlocks,
	createPage,
	updatePage
 };

// Database operations
const { getDatabase,
	queryDatabase,
	createDatabase,
	updateDatabase
 } = require('./databaseOperations');

module.exports = { getDatabase,
	queryDatabase,
	createDatabase,
	updateDatabase
 };

// Block operations
const { appendBlocks,
	deleteBlock
 } = require('./blockOperations');

module.exports = { appendBlocks,
	deleteBlock
 };

// User operations
const { getCurrentUser,
	listUsers
 } = require('./userOperations');

module.exports = { getCurrentUser,
	listUsers
 };

// Search operations
const { searchNotion
 } = require('./searchOperations');

module.exports = { searchNotion
 };

// Utility operations
const { makeRawApiCall
 } = require('./utilityOperations');

module.exports = { makeRawApiCall
 };