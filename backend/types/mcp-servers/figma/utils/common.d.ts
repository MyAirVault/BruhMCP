/**
 * Download Figma image and save it locally * @param {string} fileName - The filename to save as
 * @param {string} localPath - The local path to save to
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} Full file path where the image was saved
 */
export function downloadFigmaImage(fileName: string, localPath: string, imageUrl: string): Promise<string>;
/**
 * Remove keys with empty arrays or empty objects from an object * @param {any} input - The input object or value
 * @returns {any} The processed object or the original value
 */
export function removeEmptyKeys(input: any): any;
/**
 * Convert hex color value and opacity to rgba format * @param {string} hex - Hexadecimal color value (e.g., "#FF0000" or "#F00")
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} Color string in rgba format
 */
export function hexToRgba(hex: string, opacity?: number): string;
/**
 * Convert color from RGBA to { hex, opacity } * @param {Object} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {Object} The converted color
 */
export function convertColor(color: Object, opacity?: number): Object;
/**
 * Convert color from Figma RGBA to rgba(#, #, #, #) CSS format * @param {Object} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {string} The converted color
 */
export function formatRGBAColor(color: Object, opacity?: number): string;
/**
 * Generate a 6-character random variable ID * @param {string} prefix - ID prefix
 * @returns {string} A 6-character random ID string with prefix
 */
export function generateVarId(prefix?: string): string;
/**
 * Generate a CSS shorthand for values that come with top, right, bottom, and left * @param {Object} values - The values to generate the shorthand for
 * @param {Object} options - Options for generation
 * @returns {string|undefined} The generated shorthand
 */
export function generateCSSShorthand(values: Object, options?: Object): string | undefined;
/**
 * Convert a Figma paint (solid, image, gradient) to a SimplifiedFill * @param {Object} raw - The Figma paint to convert
 * @returns {any} The converted SimplifiedFill
 */
export function parsePaint(raw: Object): any;
/**
 * Check if an element is visible * @param {Object} element - The item to check
 * @returns {boolean} True if the item is visible, false otherwise
 */
export function isVisible(element: Object): boolean;
/**
 * Rounds a number to two decimal places, suitable for pixel value processing * @param {number} num - The number to be rounded
 * @returns {number} The rounded number with two decimal places
 */
export function pixelRound(num: number): number;
/**
 * Create a valid variable key from a component name
 * @param {string} name - Component name to convert
 * @returns {string} Valid variable key
 */
export function createVariableKey(name: string): string;
/**
 * Check if a value exists and is not null/undefined
 * @param {any} value - Value to check
 * @returns {boolean} True if value exists
 */
export function hasValue(value: any): boolean;
//# sourceMappingURL=common.d.ts.map