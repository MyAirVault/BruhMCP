/**
 * Google Drive Advanced Operations Index
 * Re-exports all advanced operations from separate modules
 */

// Team Drive operations
const { listTeamDrives,
  getTeamDriveInfo,
  listTeamDriveFiles,
  addTeamDriveMember,
  moveToTeamDrive
 } = require('./teamDriveOperations');

module.exports = { listTeamDrives,
  getTeamDriveInfo,
  listTeamDriveFiles,
  addTeamDriveMember,
  moveToTeamDrive
 };

// Batch operations
const { batchDeleteFiles,
  batchUpdateMetadata,
  syncFolderPermissions
 } = require('./batchOperations');

module.exports = { batchDeleteFiles,
  batchUpdateMetadata,
  syncFolderPermissions
 };

// Activity and revision operations
const { getFileRevisions,
  getRecentActivity,
  getFileComments,
  trackFileChanges
 } = require('./activityOperations');

module.exports = { getFileRevisions,
  getRecentActivity,
  getFileComments,
  trackFileChanges
 };