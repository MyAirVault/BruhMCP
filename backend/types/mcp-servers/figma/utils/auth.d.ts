/**
 * Authentication utilities for Figma service
 */
/**
 * Extract API key from request headers
 * @param {{ headers: Record<string, string>, query: Record<string, string> }} req - Express request object
 * @returns {string|null} API key if found, null otherwise
 */
export function extractApiKey(req: {
    headers: Record<string, string>;
    query: Record<string, string>;
}): string | null;
/**
 * Validate API key format and structure
 * @param {string} apiKey - API key to validate
 */
export function validateApiKey(apiKey: string): {
    isValid: boolean;
    error: string;
} | {
    isValid: boolean;
    error: null;
};
/**
 * Create authentication middleware for routes
 */
export function createAuthMiddleware(): (req: any, res: any, next: any) => any;
//# sourceMappingURL=auth.d.ts.map