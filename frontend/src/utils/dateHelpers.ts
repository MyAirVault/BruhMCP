/**
 * Converts human-readable expiration options to ISO date strings
 * @param expirationOption - The expiration option selected by user
 * @returns ISO date string for the expiration date
 */
export function convertExpirationToISODate(expirationOption: string): string {
  const now = new Date();
  
  switch (expirationOption) {
    // New standardized format (used in both create and renew modals)
    case '1 Hour':
    case '1h':
      now.setHours(now.getHours() + 1);
      break;
    case '6 Hours':
    case '6h':
      now.setHours(now.getHours() + 6);
      break;
    case '1 Day':
    case '1day':
      now.setDate(now.getDate() + 1);
      break;
    case '30 Days':
    case '30days':
      now.setDate(now.getDate() + 30);
      break;
    case 'Never':
    case 'never':
      // Set to far future date (100 years from now)
      now.setFullYear(now.getFullYear() + 100);
      break;
    
    // Legacy format (maintain backward compatibility)
    case '24 Hours':
      now.setHours(now.getHours() + 24);
      break;
    case '7 Days':
      now.setDate(now.getDate() + 7);
      break;
    case '90 Days':
      now.setDate(now.getDate() + 90);
      break;
    
    default:
      // Default to 30 days if unknown option
      now.setDate(now.getDate() + 30);
      break;
  }
  
  return now.toISOString();
}

/**
 * Formats a date for display purposes
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDisplayDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Checks if a date is in the past (expired)
 * @param date - Date to check
 * @returns True if date is expired
 */
export function isDateExpired(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}