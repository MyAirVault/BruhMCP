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
 * Convert color from RGBA to { hex, opacity }
 * @param {{ r: number, g: number, b: number, a: number }} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {{ hex: string, opacity: number }} The converted color
 */
export function convertColor(color: {
    r: number;
    g: number;
    b: number;
    a: number;
}, opacity?: number): {
    hex: string;
    opacity: number;
};
/**
 * Convert color from Figma RGBA to rgba(#, #, #, #) CSS format
 * @param {{ r: number, g: number, b: number, a: number }} color - The color to convert, including alpha channel
 * @param {number} opacity - The opacity of the color, if not included in alpha channel
 * @returns {string} The converted color
 */
export function formatRGBAColor(color: {
    r: number;
    g: number;
    b: number;
    a: number;
}, opacity?: number): string;
/**
 * Generate a 6-character random variable ID * @param {string} prefix - ID prefix
 * @returns {string} A 6-character random ID string with prefix
 */
export function generateVarId(prefix?: string): string;
/**
 * Generate a CSS shorthand for values that come with top, right, bottom, and left
 * @param {{ top: number, right: number, bottom: number, left: number }} values - The values to generate the shorthand for
 * @param {{ ignoreZero?: boolean, suffix?: string }} options - Options for generation
 * @returns {string|undefined} The generated shorthand
 */
export function generateCSSShorthand(values: {
    top: number;
    right: number;
    bottom: number;
    left: number;
}, options?: {
    ignoreZero?: boolean;
    suffix?: string;
}): string | undefined;
/**
 * Convert a Figma paint (solid, image, gradient) to a SimplifiedFill
 * @param {{ type: string, imageRef?: string, scaleMode?: string, color?: { r: number, g: number, b: number, a: number }, opacity?: number, gradientHandlePositions?: any[], gradientStops?: Array<{ position: number, color: { r: number, g: number, b: number, a: number } }> }} raw - The Figma paint to convert
 * @returns {string | { type: string, imageRef?: string, scaleMode?: string, gradientHandlePositions?: any[], gradientStops?: Array<{ position: number, color: { hex: string, opacity: number } }> }} The converted SimplifiedFill
 */
export function parsePaint(raw: {
    type: string;
    imageRef?: string;
    scaleMode?: string;
    color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    opacity?: number;
    gradientHandlePositions?: any[];
    gradientStops?: Array<{
        position: number;
        color: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    }>;
}): string | {
    type: string;
    imageRef?: string;
    scaleMode?: string;
    gradientHandlePositions?: any[];
    gradientStops?: Array<{
        position: number;
        color: {
            hex: string;
            opacity: number;
        };
    }>;
};
/**
 * Check if an element is visible
 * @param {{ visible?: boolean }} element - The item to check
 * @returns {boolean} True if the item is visible, false otherwise
 */
export function isVisible(element: {
    visible?: boolean;
}): boolean;
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