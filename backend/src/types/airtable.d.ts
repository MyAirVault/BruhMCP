/**
 * Airtable MCP Service Type Definitions
 */

export interface AirtableCredentials {
  api_key: string;
  instance_id: string;
  user_id: string;
  custom_name?: string;
  status: string;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: Record<string, any>;
}

export interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableField[];
}

export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export interface AirtableSchema {
  tables: AirtableTable[];
}

export interface ServiceConfig {
  name: string;
  displayName: string;
  port: number;
  authType: string;
  description: string;
  version: string;
  iconPath: string;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  expires: number;
}

export interface CacheStatistics {
  totalEntries: number;
  hitRate: number;
  lastCleanup: number;
}

export interface SessionStatistics {
  activeSessions: number;
  totalRequests: number;
  avgResponseTime: number;
}

export interface WatcherStatus {
  isActive: boolean;
  lastCheck: number;
  credentialsWatched: number;
}

export interface MCPRequest {
  method: string;
  params?: Record<string, any>;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

declare global {
  namespace Express {
    interface Request {
      instanceId?: string;
    }
  }
}