// @ts-check
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, access } from 'fs/promises';

/**
 * @typedef {Object} ValidatorModule
 * @property {Function} default - Default export validator function/class
 */

/**
 * @typedef {Function|Object} ServiceValidator
 * @property {Function} [validate] - Validation function
 * @property {string} [name] - Validator name
 * @property {string} [version] - Validator version
 */

/**
 * @typedef {Object} FileSystemError
 * @property {string} code - Error code (e.g., 'ENOENT')
 * @property {string} message - Error message
 * @property {string} [path] - File path that caused the error
 */

/**
 * Validation registry that discovers and manages service validators
 */
class ValidationRegistry {
  constructor() {
    /** @type {Map<string, ServiceValidator>} */
    this.validators = new Map();
    /** @type {boolean} */
    this.initialized = false;
  }

  /**
   * Initialize the registry by discovering validators from MCP server folders
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const mcpServersPath = join(__dirname, '../../mcp-servers');

    try {
      // Get all service directories
      const serviceDirectories = await readdir(mcpServersPath, { withFileTypes: true });
      
      for (const dirent of serviceDirectories) {
        if (dirent.isDirectory()) {
          const serviceName = dirent.name;
          await this.loadServiceValidator(serviceName, mcpServersPath);
        }
      }

      this.initialized = true;
      console.log(`✅ Validation registry initialized with ${this.validators.size} validators`);
    } catch (error) {
      console.error('Failed to initialize validation registry:', error);
      throw error;
    }
  }

  /**
   * Load validator for a specific service
   * @param {string} serviceName - Name of the service
   * @param {string} mcpServersPath - Path to MCP servers directory
   * @returns {Promise<void>}
   */
  async loadServiceValidator(serviceName, mcpServersPath) {
    const validatorPath = join(mcpServersPath, serviceName, 'validation', 'credential-validator.js');
    
    try {
      // Check if validator file exists
      await access(validatorPath);
      
      // Import the validator
      /** @type {ValidatorModule} */
      const validatorModule = await import(validatorPath);
      
      if (validatorModule.default) {
        const validator = /** @type {ServiceValidator} */ (validatorModule.default);
        this.validators.set(serviceName, validator);
        console.log(`📝 Loaded validator for ${serviceName} from ${validatorPath}`);
        console.log(`   Validator type: ${typeof validator}`);
      } else {
        console.warn(`⚠️  No default export found in validator for ${serviceName} at ${validatorPath}`);
      }
    } catch (error) {
      // If validator doesn't exist, that's okay - not all services need custom validation
      const hasCode = error && typeof error === 'object' && 'code' in error;
      const errorCode = hasCode ? (/** @type {FileSystemError} */ (error)).code : null;
      if (errorCode !== 'ENOENT') {
        console.error(`Failed to load validator for ${serviceName}:`, error);
      }
    }
  }

  /**
   * Get validator for a service
   * @param {string} serviceName - Name of the service
   * @returns {ServiceValidator|null} Validator instance or null if not found
   */
  getValidator(serviceName) {
    return this.validators.get(serviceName) || null;
  }

  /**
   * Register a validator manually
   * @param {string} serviceName - Name of the service
   * @param {ServiceValidator} validator - Validator instance
   * @returns {void}
   */
  registerValidator(serviceName, validator) {
    this.validators.set(serviceName, validator);
    console.log(`📝 Manually registered validator for ${serviceName}`);
  }

  /**
   * Get all registered services
   * @returns {string[]} Array of service names
   */
  getRegisteredServices() {
    return Array.from(this.validators.keys());
  }

  /**
   * Check if a service has a validator
   * @param {string} serviceName - Name of the service
   * @returns {boolean} True if validator exists
   */
  hasValidator(serviceName) {
    return this.validators.has(serviceName);
  }
}

// Export singleton instance
export const validationRegistry = new ValidationRegistry();