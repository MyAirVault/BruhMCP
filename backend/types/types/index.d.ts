export type User = {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | undefined;
};
export type MCPType = {
    id: string;
    name: string;
    display_name: string;
    description?: string | undefined;
    icon_url?: string | undefined;
    server_script: string;
    config_template: Object;
    created_at: Date;
    updated_at: Date;
};
export type MCPInstance = {
    id: string;
    user_id: string;
    mcp_type_id: string;
    api_key_id?: string | undefined;
    custom_name?: string | undefined;
    instance_number: number;
    process_id?: number | undefined;
    access_token: string;
    assigned_port?: number | undefined;
    status: ("active" | "inactive" | "expired");
    is_active: boolean;
    expiration_option: ("never" | "1h" | "6h" | "1day" | "30days");
    expires_at?: Date | undefined;
    last_renewed_at?: Date | undefined;
    config: Object;
    created_at: Date;
    updated_at: Date;
};
export type ApiKey = {
    id: string;
    user_id: string;
    mcp_type_id: string;
    encrypted_key: Object;
    key_hint?: string | undefined;
    created_at: Date;
    updated_at: Date;
    expires_at?: Date | undefined;
};
export type ApiResponse = {
    success: boolean;
    data?: any;
    error?: string | undefined;
    message?: string | undefined;
};
export type PaginationParams = {
    page: number;
    limit: number;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
};
export type AuthTokenData = {
    email: string;
    expiry: Date;
    createdAt: Date;
};
export type SessionData = {
    userId: string;
    createdAt: Date;
    expiresAt: Date;
};
export type AuthRequest = {
    email: string;
};
export type AuthVerifyRequest = {
    token: string;
};
export type AuthResponse = {
    success: boolean;
    sessionToken?: string | undefined;
    message?: string | undefined;
    error?: string | undefined;
};
export type ProcessInfo = {
    pid: number;
    mcpId: string;
    mcpType: string;
    port: number;
    status: ("starting" | "running" | "stopping" | "stopped" | "crashed");
};
//# sourceMappingURL=index.d.ts.map