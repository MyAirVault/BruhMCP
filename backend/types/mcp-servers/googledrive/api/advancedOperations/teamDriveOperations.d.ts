/**
 * List available Team Drives/Shared Drives
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{drives: Array<any>, count: number, nextPageToken?: string}>} List of team drives
 */
export function listTeamDrives(bearerToken: string): Promise<{
    drives: Array<any>;
    count: number;
    nextPageToken?: string;
}>;
/**
 * Get Team Drive information
 * @param {string} driveId - Team Drive ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{id: string, name: string, colorRgb?: string, capabilities?: any, createdTime?: string, hidden?: boolean, restrictions?: any}>} Team drive information
 */
export function getTeamDriveInfo(driveId: string, bearerToken: string): Promise<{
    id: string;
    name: string;
    colorRgb?: string;
    capabilities?: any;
    createdTime?: string;
    hidden?: boolean;
    restrictions?: any;
}>;
/**
 * List files in a Team Drive
 * @param {string} driveId - Team Drive ID
 * @param {import('../types.js').ListOptions} [options={}] - List options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<any>} List of files
 */
export function listTeamDriveFiles(driveId: string, bearerToken: string, options?: import("../types.js").ListOptions): Promise<any>;
/**
 * Add a member to a Team Drive
 * @param {string} driveId - Team Drive ID
 * @param {string} emailAddress - Email address of the member
 * @param {string} role - Role to assign (organizer, fileOrganizer, writer, commenter, reader)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{success: boolean, driveId: string, permissionId: string, emailAddress: string, role: string, message: string}>} Result
 */
export function addTeamDriveMember(driveId: string, emailAddress: string, role: string, bearerToken: string): Promise<{
    success: boolean;
    driveId: string;
    permissionId: string;
    emailAddress: string;
    role: string;
    message: string;
}>;
/**
 * Move files to a Team Drive
 * @param {string} fileId - File ID to move
 * @param {string} teamDriveId - Target Team Drive ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<any>} Moved file information
 */
export function moveToTeamDrive(fileId: string, teamDriveId: string, bearerToken: string): Promise<any>;
//# sourceMappingURL=teamDriveOperations.d.ts.map