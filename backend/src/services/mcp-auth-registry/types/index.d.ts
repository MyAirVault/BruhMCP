/**
 * @fileoverview TypeScript type definitions for MCP Auth Registry
 */

export interface AuthCredentials {
  client_id?: string;
  client_secret?: string;
  api_token?: string;
  api_key?: string;
  scopes?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  userInfo?: {
    id?: string;
    email?: string;
    name?: string;
    handle?: string;
  };
}

export interface OAuthFlowResult {
  authUrl: string;
  state: string;
  instanceId: string;
}

export interface OAuthCallbackResult {
  success: boolean;
  error?: string;
  tokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
}

export interface ServiceConfig {
  name: string;
  type: 'oauth' | 'apikey';
  validator: CredentialValidator;
  oauthHandler?: OAuthHandler;
  requiredFields: string[];
}

export interface CredentialValidator {
  validateCredentials(credentials: AuthCredentials): Promise<ValidationResult>;
}

export interface OAuthHandler {
  initiateFlow(instanceId: string, credentials: AuthCredentials): Promise<OAuthFlowResult>;
  handleCallback(code: string, state: string): Promise<OAuthCallbackResult>;
  refreshToken?(refreshToken: string, credentials: AuthCredentials): Promise<any>;
}

export interface InstanceCreationData {
  serviceName: string;
  credentials: AuthCredentials;
  userId: string;
  metadata?: {
    userEmail?: string;
    createdVia?: string;
    authType?: string;
    validatedAt?: string;
  };
}

export interface AuthRegistryConfig {
  servicesPath: string;
  baseUrl: string;
  autoDiscovery: boolean;
  discoveryInterval?: number;
}

export interface MCPAuthRegistry {
  oauthCoordinator: OAuthCoordinator;
  apiKeyCoordinator: ApiKeyCoordinator;
  initialize(config?: Partial<AuthRegistryConfig>): Promise<void>;
  getRouter(): any;
  hasService(serviceName: string): boolean;
}

export interface OAuthCoordinator {
  hasService(serviceName: string): boolean;
  validateCredentials(serviceName: string, credentials: AuthCredentials): Promise<ValidationResult>;
  initiateOAuthFlow(serviceName: string, instanceId: string, credentials: AuthCredentials): Promise<OAuthFlowResult>;
  handleOAuthCallback(serviceName: string, code: string, state: string): Promise<OAuthCallbackResult>;
}

export interface ApiKeyCoordinator {
  hasService(serviceName: string): boolean;
  validateCredentials(serviceName: string, credentials: AuthCredentials): Promise<ValidationResult>;
  validateAndCreateInstance(serviceName: string, creationData: InstanceCreationData): Promise<{
    success: boolean;
    instanceId?: string;
    error?: string;
    userInfo?: any;
  }>;
}