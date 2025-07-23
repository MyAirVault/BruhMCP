/**
 * Figma API main export file
 * Re-exports all Figma API functions from their respective modules
 */

// File operations
export {
	getFigmaFile,
	getFigmaNodes,
	getFigmaFileMeta,
	getFigmaFileVersions,
	getFigmaFileWithVersion
} from './files.js';

// Component and style operations
export {
	getFigmaComponents,
	getFigmaStyles,
	getFigmaComponentSets,
	getFigmaComponentInfo,
	getFigmaComponentSetInfo
} from './components.js';

// Comment operations
export {
	getFigmaComments,
	postFigmaComment,
	deleteFigmaComment
} from './comments.js';

// Image operations
export {
	getFigmaImages,
	getFigmaImageFills
} from './images.js';

// Team and project operations
export {
	getFigmaTeamProjects,
	getFigmaProjectFiles,
	getFigmaTeamComponents
} from './teams.js';

// User operations
export {
	getFigmaUser
} from './user.js';

// Variables operations (Enterprise only)
export {
	getFigmaLocalVariables,
	getFigmaPublishedVariables,
	postFigmaVariables,
	putFigmaVariables,
	deleteFigmaVariables
} from './variables.js';

// Webhook operations
export {
	postFigmaWebhook,
	getFigmaWebhooks,
	putFigmaWebhook,
	deleteFigmaWebhook
} from './webhooks.js';

// Common utilities and types
export {
	FIGMA_BASE_URL,
	handleApiError,
	makeAuthenticatedRequest
} from './common.js';