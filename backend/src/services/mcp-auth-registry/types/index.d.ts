/**
 * @fileoverview TypeScript type definitions for MCP Auth Registry
 */

export interface ValidationResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface InstanceResult {
  success: boolean;
  instanceId?: string;
  message: string;
  data?: any;
}

export interface OAuthResult {
  success: boolean;
  authUrl?: string;
  state?: string;
  message: string;
}

export interface RevokeResult {
  success: boolean;
  message: string;
}

export type ServiceType = 'apikey' | 'oauth' | 'hybrid';

export interface ServiceFunctions {
  validateCredentials?: Function;
  createInstance?: Function;
  initiateOAuth?: Function;
  oauthCallback?: Function;
  revokeInstance?: Function;
}

export interface ServiceRegistryEntry {
  type: ServiceType;
  functions: ServiceFunctions;
  path: string;
  isActive: boolean;
}

export type ServiceRegistry = Record<string, ServiceRegistryEntry>;

export interface CredentialsData {
  apiKey?: string;
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  additionalData?: any;
}

export interface InstanceData {
  credentials: CredentialsData;
  customName?: string;
  metadata?: any;
}

export interface ServiceError {
  code: string;
  message: string;
  serviceName?: string;
  functionName?: string;
  originalError?: Error;
}