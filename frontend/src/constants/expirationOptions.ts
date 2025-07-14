import { type ExpirationOption } from '../types/createMCPModal';

/**
 * Standardized expiration options used across all MCP modals
 * These options are used in both Create MCP Modal and Renew Confirmation Modal
 */
export const EXPIRATION_OPTIONS: ExpirationOption[] = [
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '1 Day', value: '1day' },
  { label: '30 Days', value: '30days' },
  { label: 'Never', value: 'never' }
];

/**
 * Get expiration option labels only (for simple dropdown usage)
 */
export const EXPIRATION_LABELS = EXPIRATION_OPTIONS.map(option => option.label);

/**
 * Default expiration option for new instances
 */
export const DEFAULT_EXPIRATION = '30 Days';

/**
 * Find expiration option by value
 */
export function getExpirationOptionByValue(value: string): ExpirationOption | undefined {
  return EXPIRATION_OPTIONS.find(option => option.value === value);
}

/**
 * Find expiration option by label
 */
export function getExpirationOptionByLabel(label: string): ExpirationOption | undefined {
  return EXPIRATION_OPTIONS.find(option => option.label === label);
}