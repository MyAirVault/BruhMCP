/**
 * Identity utilities * Type guards and utility functions for Figma object identification
 */
/**
 * Check if an object has a specific value * @param {string} key - Property key to check
 * @param {any} obj - Object to check
 * @param {Function} [typeGuard] - Optional type guard function
 * @returns {boolean} True if object has the key with valid value
 */
export function hasValue(key: string, obj: any, typeGuard?: Function): boolean;
/**
 * Check if value is a frame * @param {any} val - Value to check
 * @returns {boolean} True if value is a frame
 */
export function isFrame(val: any): boolean;
/**
 * Check if value has layout properties * @param {any} val - Value to check
 * @returns {boolean} True if value has layout properties
 */
export function isLayout(val: any): boolean;
/**
 * Checks if a node is a child to an auto layout frame and adheres to auto layout rules * @param {any} node - The node to check
 * @param {any} parent - The parent node
 * @returns {boolean} True if the node is a child of an auto layout frame
 */
export function isInAutoLayoutFlow(node: any, parent: any): boolean;
/**
 * Check if value is stroke weights object * @param {any} val - Value to check
 * @returns {boolean} True if value is stroke weights
 */
export function isStrokeWeights(val: any): boolean;
/**
 * Check if value is a rectangle * @param {string} key - Key to check
 * @param {any} obj - Object to check
 * @returns {boolean} True if object has rectangle at key
 */
export function isRectangle(key: string, obj: any): boolean;
/**
 * Check if value is rectangle corner radii array * @param {any} val - Value to check
 * @returns {boolean} True if value is corner radii array
 */
export function isRectangleCornerRadii(val: any): boolean;
/**
 * Check if value is CSS color value * @param {any} val - Value to check
 * @returns {boolean} True if value is CSS color
 */
export function isCSSColorValue(val: any): boolean;
/**
 * Check if value is truthy (utility function)
 * @param {any} val - Value to check
 * @returns {boolean} True if value is truthy
 */
export function isTruthy(val: any): boolean;
//# sourceMappingURL=identity.d.ts.map