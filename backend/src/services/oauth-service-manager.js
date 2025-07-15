/**
 * OAuth Service Manager
 * Manages dynamic starting and stopping of OAuth service
 */

import oauthApp from '../oauth-service/index.js';
import loggingService from './logging/loggingService.js';

class OAuthServiceManager {
  constructor() {
    this.server = null;
    this.isRunning = false;
    this.port = process.env.OAUTH_SERVICE_PORT || 3001;
  }

  /**
   * Start OAuth service if not already running
   * @returns {Promise<boolean>} true if started successfully
   */
  async startService() {
    if (this.isRunning) {
      console.log('🔐 OAuth service already running');
      return true;
    }

    try {
      this.server = oauthApp.listen(this.port, () => {
        console.log(`🔐 OAuth service started on port ${this.port}`);
        console.log(`📚 OAuth health check: http://localhost:${this.port}/health`);
        this.isRunning = true;
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to start OAuth service:', error);
      loggingService.logError(error, {
        operation: 'oauth_service_start',
        critical: false
      });
      return false;
    }
  }

  /**
   * Stop OAuth service if running
   * @returns {Promise<boolean>} true if stopped successfully
   */
  async stopService() {
    if (!this.isRunning || !this.server) {
      console.log('🔐 OAuth service not running');
      return true;
    }

    try {
      await new Promise((resolve) => {
        this.server.close(() => {
          console.log('✅ OAuth service stopped');
          this.isRunning = false;
          this.server = null;
          resolve();
        });
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to stop OAuth service:', error);
      loggingService.logError(error, {
        operation: 'oauth_service_stop',
        critical: false
      });
      return false;
    }
  }

  /**
   * Check if OAuth service is running
   * @returns {boolean} true if running
   */
  isServiceRunning() {
    return this.isRunning;
  }

  /**
   * Get OAuth service URL
   * @returns {string} OAuth service URL
   */
  getServiceUrl() {
    return `http://localhost:${this.port}`;
  }

  /**
   * Ensure OAuth service is running for an operation
   * @returns {Promise<boolean>} true if service is available
   */
  async ensureServiceRunning() {
    if (this.isRunning) {
      return true;
    }

    console.log('🔐 Starting OAuth service for operation...');
    return await this.startService();
  }
}

// Export singleton instance
export default new OAuthServiceManager();