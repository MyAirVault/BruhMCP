// @ts-check

/**
 * Axios Utility Functions
 * @fileoverview Wrapper functions around axios.get and axios.post with error handling
 */

const axios = require('axios').default;

/**
 * @typedef {Object} AxiosResponse
 * @property {any} data - Response data
 * @property {number} status - HTTP status code
 * @property {string} statusText - HTTP status text
 * @property {Object} headers - Response headers
 * @property {Object} config - Request configuration
 */

/**
 * @typedef {Object} AxiosError
 * @property {string} message - Error message
 * @property {number} [status] - HTTP status code
 * @property {any} [data] - Error response data
 * @property {Object} [config] - Request configuration
 */

/**
 * Handle axios errors consistently
 * @param {any} error - The error object from axios
 * @throws {AxiosError} Formatted error with status and data
 */
function handleAxiosError(error) {
    if (error.response) {
        // Server responded with error status
        const axiosError = /** @type {any} */ (new Error(`HTTP ${error.response.status}: ${error.response.statusText || 'Request failed'}`));
        axiosError.status = error.response.status;
        axiosError.data = error.response.data;
        axiosError.config = error.config;
        throw axiosError;
    } else if (error.request) {
        // Request was made but no response received
        const axiosError = /** @type {any} */ (new Error('Network error: No response received from server'));
        axiosError.config = error.config;
        throw axiosError;
    } else {
        // Something else happened in setting up the request
        const axiosError = /** @type {any} */ (new Error(`Request setup error: ${error.message}`));
        axiosError.config = error.config;
        throw axiosError;
    }
}

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
async function axiosGet(url, config = {}) {
    try {
        const response = await axios.get(url, {
            timeout: 30000, // 30 second default timeout
            ...config,
            headers: /** @type {any} */ (config.headers || {})
        });
        
        return response;
    } catch (error) {
        handleAxiosError(error);
        throw error; // This line will never execute but satisfies TypeScript
    }
}

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
async function axiosPost(url, data = null, config = {}) {
    try {
        const response = await axios.post(url, data, {
            timeout: 30000, // 30 second default timeout
            ...config,
            headers: /** @type {any} */ (config.headers || {})
        });
        
        return response;
    } catch (error) {
        handleAxiosError(error);
        throw error; // This line will never execute but satisfies TypeScript
    }
}

/**
 * Wrapper around axios.put with comprehensive error handling
 * @param {string} url - The URL to make PUT request to
 * @param {any} [data] - Request body data
 * @param {Object} [config] - Axios configuration object
 * @returns {Promise<AxiosResponse>} Promise that resolves to axios response
 * @throws {AxiosError} Throws formatted error with status and data
 */
async function axiosPut(url, data = null, /** @type {any} */ config = {}) {
    try {
        const response = await axios.put(url, data, {
            timeout: 30000, // 30 second default timeout
            ...config,
            headers: /** @type {any} */ (config.headers || {})
        });
        
        return response;
    } catch (error) {
        handleAxiosError(error);
        throw error; // This line will never execute but satisfies TypeScript
    }
}

/**
 * Wrapper around axios.delete with comprehensive error handling
 * @param {string} url - The URL to make DELETE request to
 * @param {Object} [config] - Axios configuration object
 * @returns {Promise<AxiosResponse>} Promise that resolves to axios response
 * @throws {AxiosError} Throws formatted error with status and data
 */
async function axiosDelete(url, /** @type {any} */ config = {}) {
    try {
        const response = await axios.delete(url, {
            timeout: 30000, // 30 second default timeout
            ...config,
            headers: /** @type {any} */ (config.headers || {})
        });
        
        return response;
    } catch (error) {
        handleAxiosError(error);
        throw error; // This line will never execute but satisfies TypeScript
    }
}

module.exports = {
    axiosGet,
    axiosPost,
    axiosPut,
    axiosDelete,
    axios // Export raw axios for direct use with config objects
};