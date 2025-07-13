/**
 * Database type definitions
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface MCPService {
  mcp_service_id: string;
  mcp_service_name: string;
  display_name: string;
  description?: string;
  icon_url_path?: string;
  port: number;
  type: 'api_key' | 'oauth';
  is_active: boolean;
  total_instances_created: number;
  active_instances_count: number;
  created_at: string;
  updated_at: string;
}

export interface MCPInstance {
  instance_id: string;
  user_id: string;
  mcp_service_id: string;
  api_key?: string;
  client_id?: string;
  client_secret?: string;
  status: 'active' | 'inactive' | 'expired';
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  custom_name?: string;
  renewed_count: number;
  last_renewed_at?: string;
  credentials_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MCPInstanceWithService extends MCPInstance {
  mcp_service_name: string;
  display_name: string;
  type: 'api_key' | 'oauth';
  port: number;
  is_active: boolean;
}

export interface CreateMCPRequest {
  mcp_type: string;
  custom_name?: string;
  expiration_option: 'never' | '1h' | '6h' | '1day' | '30days';
  credentials: {
    api_key?: string;
    client_id?: string;
    client_secret?: string;
  };
  config?: Record<string, unknown>;
}

export interface CredentialCacheEntry {
  credential: string;
  expires_at?: string;
  user_id: string;
  last_used: string;
  refresh_attempts: number;
  cached_at: string;
}

export interface CacheStatistics {
  total_entries: number;
  expired_entries: number;
  recently_used: number;
  cache_hit_rate_last_hour: string;
  memory_usage_mb: string;
}

export interface WatcherStatus {
  is_running: boolean;
  interval_ms: number;
  expiration_tolerance_ms: number;
  stale_threshold_hours: number;
  max_cache_size: number;
  uptime_seconds: number;
}