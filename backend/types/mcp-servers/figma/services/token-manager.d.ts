/**
 * Token Management Service for LLM-optimized responses
 * Provides token estimation, response chunking, and size management
 */
/**
 * Estimates token count for a given text or JSON object
 * Uses the common approximation of ~4 characters per token
 * @param {string|object} content - Content to estimate tokens for
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(content: string | object): number;
/**
 * Checks if content exceeds the specified token limit
 * @param {string|object} content - Content to check
 * @param {number} maxTokens - Maximum allowed tokens
 * @returns {boolean} True if content exceeds limit
 */
export function exceedsTokenLimit(content: string | object, maxTokens?: number): boolean;
/**
 * Truncates content to fit within token limits while preserving structure
 * @param {object} data - Data object to truncate
 * @param {number} maxTokens - Maximum allowed tokens
 * @returns {object} Truncated data with metadata
 */
export function truncateToTokenLimit(data: object, maxTokens?: number): object;
/**
 * Creates a continuation token for chunked responses
 * @param {string} fileKey - Figma file key
 * @param {string} operation - Operation type
 * @param {object} parameters - Additional parameters
 * @returns {string} Base64 encoded continuation token
 */
export function createContinuationToken(fileKey: string, operation: string, parameters?: object): string;
/**
 * Parses a continuation token
 * @param {string} token - Base64 encoded continuation token
 * @returns {object|null} Parsed token data or null if invalid
 */
export function parseContinuationToken(token: string): object | null;
/**
 * Determines optimal chunk size for large responses
 * @param {number} totalTokens - Total estimated tokens
 * @param {number} maxTokensPerChunk - Maximum tokens per chunk
 * @returns {object} Chunking strategy
 */
export function calculateChunkingStrategy(totalTokens: number, maxTokensPerChunk?: number): object;
//# sourceMappingURL=token-manager.d.ts.map