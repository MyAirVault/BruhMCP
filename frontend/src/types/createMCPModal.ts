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
  onSubmit: (data: CreateMCPFormData) => void;
}