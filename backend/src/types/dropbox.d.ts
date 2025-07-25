/**
 * TypeScript type definitions for Dropbox MCP Server
 */

export interface DropboxMediaInfo {
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
    location?: {
      latitude: number;
      longitude: number;
    };
    time_taken?: string;
  };
}

export interface DropboxSharingInfo {
  read_only: boolean;
  parent_shared_folder_id?: string;
  modified_by?: string;
}

export interface DropboxPropertyGroup {
  template_id: string;
  fields: Array<{
    name: string;
    value: string;
  }>;
}

export interface DropboxContentOwnership {
  '.tag': 'user' | 'team';
}

export interface DropboxFileMetadata {
  '.tag': 'file' | 'folder';
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  size?: number;
  server_modified?: string;
  client_modified?: string;
  rev?: string;
  content_hash?: string;
  is_downloadable?: boolean;
  has_explicit_shared_members?: boolean;
  media_info?: DropboxMediaInfo;
  sharing_info?: DropboxSharingInfo;
  property_groups?: DropboxPropertyGroup[];
  content_ownership?: DropboxContentOwnership;
}

export interface DropboxFolder {
  '.tag': 'folder';
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  shared_folder_id?: string;
  sharing_info?: DropboxSharingInfo;
  property_groups?: DropboxPropertyGroup[];
}

export interface DropboxListFolderResponse {
  entries: (DropboxFileMetadata | DropboxFolder)[];
  cursor: string;
  has_more: boolean;
}

export interface DropboxSearchMatch {
  match_type: {
    '.tag': 'filename' | 'content' | 'both';
  };
  metadata: DropboxFileMetadata;
}

export interface DropboxSearchResponse {
  matches: DropboxSearchMatch[];
  has_more: boolean;
  cursor?: string;
  start?: number;
}

export interface DropboxSpaceUsage {
  used: number;
  allocation: {
    '.tag': 'individual' | 'team';
    allocated: number;
  };
}

export interface DropboxSharedLink {
  url: string;
  name: string;
  path_display: string;
  id: string;
  link_permissions: {
    can_revoke: boolean;
    resolved_visibility: {
      '.tag': 'public' | 'team_only' | 'password';
    };
  };
  expires?: string;
  visibility: string;
  team_member_info?: {
    display_name: string;
    member_id: string;
  };
}

export interface DropboxSharedLinksResponse {
  links: DropboxSharedLink[];
  has_more: boolean;
  cursor?: string;
}

export interface DropboxError {
  error_summary: string;
  error?: {
    '.tag': string;
    path?: string;
    reason?: string;
    message?: string;
  };
}

export interface DropboxAPIError extends Error {
  status: number;
  statusText: string;
  endpoint: string;
  dropboxError: DropboxError;
}

export interface CredentialsData {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  bearerToken?: string;
  expiresAt?: number;
  userId?: string;
  serviceActive?: boolean;
  status?: string;
}

export interface OAuthResult {
  success: boolean;
  authUrl?: string;
  tokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  error?: string;
}

export interface TokenRefreshResult {
  success: boolean;
  tokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  error?: string;
}

export interface DropboxApiArgs {
  path?: string;
  fromPath?: string;
  toPath?: string;
  query?: string;
  recursive?: boolean;
  limit?: number;
  maxResults?: number;
  fileStatus?: string;
  autorename?: boolean;
  shortUrl?: boolean;
  content?: string | Buffer;
  localPath?: string;
  dropboxPath?: string;
  overwrite?: boolean;
}

export interface ErrorOptions {
  error?: string;
  errorCode?: string;
  requiresReauth?: boolean;
  instanceId?: string;
  service?: string;
  status?: number;
  authType?: string;
}

export interface AuditLogEntry {
  instanceId: string;
  userId: string;
  service: string;
  timestamp: string;
  event: string;
  success: boolean;
  method?: string;
  error?: string;
}

export interface CachedCredentials {
  bearerToken: string;
  refreshToken: string;
  expiresAt: number;
  user_id: string;
  last_used?: string;
  refresh_attempts?: number;
  cached_at?: string;
  last_modified?: number;
  status?: string;
}

export interface ServiceConfig {
  name: string;
  displayName: string;
  version: string;
  port: number;
  authType: string;
  description: string;
}