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
    mcp_service_id: string;
    mcp_service_name: string;
    display_name: string;
    description?: string | undefined;
    icon_url_path?: string | undefined;
    port: number;
    type: string;
    is_active: boolean;
    total_instances_created: number;
    active_instances_count: number;
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
    access_token: string;
    status: ('active' | 'inactive' | 'expired');
    is_active: boolean;
    expiration_option: ('never' | '1h' | '6h' | '1day' | '30days');
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
//# sourceMappingURL=index.d.ts.map