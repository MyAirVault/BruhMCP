/**
 * Google Drive API Modules Index
 * Re-exports all API functions from separate modules
 */

// File operations
export { 
  uploadFile, 
  downloadFile, 
  getFileMetadata 
} from './fileOperations.js';

// List and search operations
export { 
  listFiles, 
  searchFiles, 
  getDriveInfo 
} from './listOperations.js';

// File management operations
export { 
  createFolder, 
  deleteFile, 
  copyFile, 
  moveFile 
} from './fileManagement.js';

// Permission operations
export { 
  shareFile, 
  getFilePermissions 
} from './permissionOperations.js';