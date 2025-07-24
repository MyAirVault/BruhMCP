/**
 * Google Drive Advanced Operations Index
 * Re-exports all advanced operations from separate modules
 */

// Team Drive operations
export {
  listTeamDrives,
  getTeamDriveInfo,
  listTeamDriveFiles,
  addTeamDriveMember,
  moveToTeamDrive
} from './teamDriveOperations.js';

// Batch operations
export {
  batchDeleteFiles,
  batchUpdateMetadata,
  syncFolderPermissions
} from './batchOperations.js';

// Activity and revision operations
export {
  getFileRevisions,
  getRecentActivity,
  getFileComments,
  trackFileChanges
} from './activityOperations.js';