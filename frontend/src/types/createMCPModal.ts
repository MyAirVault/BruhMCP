export interface CreateMCPFormData {
  name: string;
  type: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  expiration: string;
  credentials: Record<string, string>;
}

export interface ValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  apiInfo: {
    service?: string;
    quota_remaining?: number;
    permissions?: string[];
  } | null;
  failureCount: number;
  lastFailedCredentials: string | null; // Hash of credentials that last failed
}

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  flipUp: boolean;
}

export interface ExpirationOption {
  label: string;
  value: string;
}

export interface CreateMCPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMCPFormData) => Promise<import('../types').MCPInstanceCreationResponse>;
  onPlanLimitReached?: (title: string, message: string) => void;
  onSuccess?: (mcp: import('../types').MCPItem) => void;
}