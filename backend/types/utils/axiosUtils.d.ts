export type AxiosResponse = {
    /**
     * - Response data
     */
    data: any;
    /**
     * - HTTP status code
     */
    status: number;
    /**
     * - HTTP status text
     */
    statusText: string;
    /**
     * - Response headers
     */
    headers: Object;
    /**
     * - Request configuration
     */
    config: Object;
};
export type AxiosError = {
    /**
     * - Error message
     */
    message: string;
    /**
     * - HTTP status code
     */
    status?: number | undefined;
    /**
     * - Error response data
     */
    data?: any;
    /**
     * - Request configuration
     */
    config?: Object | undefined;
};
/**
 * Wrapper around axios.get with comprehensive error handling
 * @param {string} url - The URL to make GET request to
 * @param {Object} [config] - Axios configuration object
 * @param {any} [config.headers] - Request headers
 * @param {number} [config.timeout] - Request timeout in milliseconds
 * @param {Object} [config.params] - URL parameters
 * @param {'json'|'text'|'arraybuffer'|'blob'|'document'|'stream'} [config.responseType] - Response type
 * @returns {Promise<AxiosResponse>} Promise that resolves to axios response
 * @throws {AxiosError} Throws formatted error with status and data
 */
export function axiosGet(url: string, config?: {
    headers?: any;
    timeout?: number | undefined;
    params?: Object | undefined;
    responseType?: "stream" | "json" | "text" | "arraybuffer" | "blob" | "document" | undefined;
} | undefined): Promise<AxiosResponse>;
/**
 * Wrapper around axios.post with comprehensive error handling
 * @param {string} url - The URL to make POST request to
 * @param {any} [data] - Request body data
 * @param {Object} [config] - Axios configuration object
 * @param {any} [config.headers] - Request headers
 * @param {number} [config.timeout] - Request timeout in milliseconds
 * @param {Object} [config.params] - URL parameters
 * @returns {Promise<AxiosResponse>} Promise that resolves to axios response
 * @throws {AxiosError} Throws formatted error with status and data
 */
export function axiosPost(url: string, data?: any, config?: {
    headers?: any;
    timeout?: number | undefined;
    params?: Object | undefined;
} | undefined): Promise<AxiosResponse>;
/**
 * Wrapper around axios.put with comprehensive error handling
 * @param {string} url - The URL to make PUT request to
 * @param {any} [data] - Request body data
 * @param {Object} [config] - Axios configuration object
 * @returns {Promise<AxiosResponse>} Promise that resolves to axios response
 * @throws {AxiosError} Throws formatted error with status and data
 */
export function axiosPut(url: string, data?: any, config?: any): Promise<AxiosResponse>;
/**
 * Wrapper around axios.delete with comprehensive error handling
 * @param {string} url - The URL to make DELETE request to
 * @param {Object} [config] - Axios configuration object
 * @returns {Promise<AxiosResponse>} Promise that resolves to axios response
 * @throws {AxiosError} Throws formatted error with status and data
 */
export function axiosDelete(url: string, config?: any): Promise<AxiosResponse>;
import axios_1 = require("axios");
import axios = axios_1.default;
export { axios };
//# sourceMappingURL=axiosUtils.d.ts.map