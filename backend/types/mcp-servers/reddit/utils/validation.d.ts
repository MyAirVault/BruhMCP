/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Object): void;
/**
 * Validate Reddit post ID format
 * @param {string} postId - Reddit post ID
 * @throws {Error} If post ID format is invalid
 */
export function validatePostId(postId: string): void;
/**
 * Validate Reddit comment ID format
 * @param {string} commentId - Reddit comment ID
 * @throws {Error} If comment ID format is invalid
 */
export function validateCommentId(commentId: string): void;
/**
 * Validate Reddit fullname format (t1_, t3_, etc.)
 * @param {string} fullname - Reddit fullname
 * @throws {Error} If fullname format is invalid
 */
export function validateFullname(fullname: string): void;
/**
 * Validate Reddit search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid characters
 */
export function validateRedditQuery(query: string): void;
/**
 * Validate vote direction
 * @param {number} direction - Vote direction
 * @throws {Error} If direction is invalid
 */
export function validateVoteDirection(direction: number): void;
/**
 * Validate Reddit post content
 * @param {string} content - Post content
 * @param {string} type - Content type ('title', 'text', 'url')
 * @throws {Error} If content is invalid
 */
export function validatePostContent(content: string, type: string): void;
//# sourceMappingURL=validation.d.ts.map