/**
 * URL validation utilities for Google Drive MCP Service
 */

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  const trimmed = url.trim();
  
  // Basic URL validation
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (error) {
    throw new Error('Invalid URL format');
  }
  
  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /<script/i,
    /onclick/i,
    /onerror/i
  ];
  
  const fullUrl = parsed.toString();
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      throw new Error('URL contains suspicious patterns');
    }
  }
  
  // Validate Google domains for Google Drive URLs
  if (fullUrl.includes('google.com') || fullUrl.includes('googleapis.com')) {
    const validGoogleDomains = [
      'drive.google.com',
      'docs.google.com',
      'sheets.google.com',
      'slides.google.com',
      'www.googleapis.com',
      'googleapis.com'
    ];
    
    if (!validGoogleDomains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain))) {
      throw new Error('Invalid Google domain');
    }
  }
  
  return fullUrl;
}