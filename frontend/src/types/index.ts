export interface MCPItem {
  id: string;
  name: string;
  email: string; // Contains access_url for backward compatibility
  status: 'active' | 'inactive' | 'expired';
  mcpType?: string; // Added to display MCP type properly
  access_url?: string; // Added to store URL directly
  icon_url?: string; // Added to store icon URL from backend
}

export interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'highlighted' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MCPType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon_url?: string;
  type: 'api_key' | 'oauth';
  config_template?: Record<string, unknown>;
  required_fields?: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  resource_limits?: {
    cpu: string;
    memory: string;
  };
  max_duration_minutes?: number;
  status: 'active' | 'inactive' | 'expired';
}

export interface MCPInstance {
  id: string;
  custom_name?: string;
  instance_number: number;
  access_token: string;
  access_url: string;
  process_id?: number;
  status: 'active' | 'inactive' | 'expired';
  oauth_status?: 'pending' | 'completed' | 'failed' | 'expired';
  expiration_option: string;
  expires_at: string;
  last_accessed?: string;
  mcp_type: {
    name: string;
    display_name: string;
    icon_url?: string;
  };
  metrics?: {
    requests: number;
    errors: number;
    uptime_hours: number;
  };
  config?: Record<string, unknown>;
  stats?: {
    cpu_percent: number;
    memory_mb: number;
    uptime_seconds: number;
  };
  created_at: string;
  updated_at?: string;
  oauth?: {
    requires_user_consent: boolean;
    authorization_url: string;
    provider: string;
    instance_id: string;
    message: string;
  };
}

export interface MCPInstanceCreationResponse {
  instance: MCPInstance;
  oauth?: {
    requires_user_consent: boolean;
    authorization_url: string;
    provider: string;
    instance_id: string;
    message: string;
  };
}

export interface APIKey {
  id: string;
  mcp_type_id: string;
  mcp_type: {
    id: string;
    name: string;
    display_name: string;
  };
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface MCPLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
  mcpId?: string;
  mcpName?: string;
}