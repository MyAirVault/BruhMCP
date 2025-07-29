/**
 * Figma API main export file
 * Re-exports all Figma API functions from their respective modules
 */

// File operations
const { getFigmaFile, getFigmaNodes, getFigmaFileMeta, getFigmaFileVersions, getFigmaFileWithVersion } = require('./files.js');

// Component and style operations
const { getFigmaComponents, getFigmaStyles, getFigmaComponentSets, getFigmaComponentInfo, getFigmaComponentSetInfo } = require('./components.js');

// Comment operations
const { getFigmaComments, postFigmaComment, deleteFigmaComment } = require('./comments.js');

// Image operations
const { getFigmaImages, getFigmaImageFills } = require('./images.js');

// Team and project operations
const { getFigmaTeamProjects, getFigmaProjectFiles, getFigmaTeamComponents } = require('./teams.js');

// User operations
const { getFigmaUser } = require('./user.js');

// Variables operations (Enterprise only)
const { getFigmaLocalVariables, getFigmaPublishedVariables, postFigmaVariables, putFigmaVariables, deleteFigmaVariables } = require('./variables.js');

// Webhook operations
const { postFigmaWebhook, getFigmaWebhooks, putFigmaWebhook, deleteFigmaWebhook } = require('./webhooks.js');

// Common utilities and types
const { FIGMA_BASE_URL, handleApiError, makeAuthenticatedRequest } = require('./common.js');

module.exports = {
	// File operations
	getFigmaFile,
	getFigmaNodes,
	getFigmaFileMeta,
	getFigmaFileVersions,
	getFigmaFileWithVersion,
	
	// Component and style operations
	getFigmaComponents,
	getFigmaStyles,
	getFigmaComponentSets,
	getFigmaComponentInfo,
	getFigmaComponentSetInfo,
	
	// Comment operations
	getFigmaComments,
	postFigmaComment,
	deleteFigmaComment,
	
	// Image operations
	getFigmaImages,
	getFigmaImageFills,
	
	// Team and project operations
	getFigmaTeamProjects,
	getFigmaProjectFiles,
	getFigmaTeamComponents,
	
	// User operations
	getFigmaUser,
	
	// Variables operations (Enterprise only)
	getFigmaLocalVariables,
	getFigmaPublishedVariables,
	postFigmaVariables,
	putFigmaVariables,
	deleteFigmaVariables,
	
	// Webhook operations
	postFigmaWebhook,
	getFigmaWebhooks,
	putFigmaWebhook,
	deleteFigmaWebhook,
	
	// Common utilities and types
	FIGMA_BASE_URL,
	handleApiError,
	makeAuthenticatedRequest
};