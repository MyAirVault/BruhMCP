/**
 * Google Drive API Modules Index
 * Re-exports all API functions from separate modules
 */

// File operations
const { uploadFile, 
  downloadFile, 
  getFileMetadata 
 } = require('./fileOperations');

module.exports = { uploadFile, 
  downloadFile, 
  getFileMetadata 
 };

// List and search operations
const { listFiles, 
  searchFiles, 
  getDriveInfo 
 } = require('./listOperations');

module.exports = { listFiles, 
  searchFiles, 
  getDriveInfo 
 };

// File management operations
const { createFolder, 
  deleteFile, 
  copyFile, 
  moveFile 
 } = require('./fileManagement');

module.exports = { createFolder, 
  deleteFile, 
  copyFile, 
  moveFile 
 };

// Permission operations
const { shareFile, 
  getFilePermissions 
 } = require('./permissionOperations');

module.exports = { shareFile, 
  getFilePermissions 
 };