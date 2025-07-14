// @ts-check

export interface AuthRequestTokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface AuthVerifyTokenResult {
  success: boolean;
  jwtToken?: string;
  user?: any;
  error?: 'TOKEN_NOT_FOUND' | 'TOKEN_EXPIRED' | string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
}