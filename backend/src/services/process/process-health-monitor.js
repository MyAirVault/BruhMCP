import fetch from 'node-fetch';
import { EventEmitter } from 'events';
import portManager from '../portManager.js';

/**
 * Process Health Monitor - Comprehensive monitoring and validation for MCP processes
 */
export class ProcessHealthMonitor extends EventEmitter {
    constructor() {
        super();
        this.healthChecks = new Map(); // instanceId -> health check interval
        this.startupValidation = new Map(); // instanceId -> startup promise
        this.retryAttempts = new Map(); // instanceId -> retry count
        this.maxRetries = 3;
        this.startupTimeout = 30000; // 30 seconds
        this.healthCheckInterval = 60000; // 1 minute
    }

    /**
     * Validate process startup with comprehensive checks
     * @param {string} instanceId - Instance ID
     * @param {Object} processInfo - Process information
     * @param {number} expectedPort - Expected port number
     * @returns {Promise<boolean>} True if process started successfully
     */
    async validateProcessStartup(instanceId, processInfo, expectedPort) {
        console.log(`🔍 Validating startup for instance ${instanceId} on port ${expectedPort}`);
        
        const startTime = Date.now();
        const maxWaitTime = this.startupTimeout;
        const checkInterval = 1000; // Check every second

        return new Promise((resolve, reject) => {
            const startupPromise = this._performStartupValidation(
                instanceId, 
                expectedPort, 
                startTime, 
                maxWaitTime, 
                checkInterval,
                resolve,
                reject
            );
            
            this.startupValidation.set(instanceId, { resolve, reject, startTime });

            // Handle process exit during startup
            if (processInfo.process) {
                processInfo.process.once('exit', (code) => {
                    if (this.startupValidation.has(instanceId)) {
                        console.log(`❌ Process ${instanceId} exited during startup with code ${code}`);
                        this.startupValidation.delete(instanceId);
                        reject(new Error(`Process exited during startup with code ${code}`));
                    }
                });

                // Handle process error during startup
                processInfo.process.once('error', (error) => {
                    if (this.startupValidation.has(instanceId)) {
                        console.log(`❌ Process ${instanceId} error during startup:`, error.message);
                        this.startupValidation.delete(instanceId);
                        reject(new Error(`Process error during startup: ${error.message}`));
                    }
                });
            }

            startupPromise;
        });
    }

    async _performStartupValidation(instanceId, expectedPort, startTime, maxWaitTime, checkInterval, resolve, reject) {
        const checkHealth = async () => {
            try {
                const elapsed = Date.now() - startTime;
                
                if (elapsed > maxWaitTime) {
                    this.startupValidation.delete(instanceId);
                    reject(new Error(`Startup timeout after ${maxWaitTime}ms`));
                    return;
                }

                // Check if port is actually in use
                const portInUse = await this._isPortInUse(expectedPort);
                if (!portInUse) {
                    console.log(`⏳ Port ${expectedPort} not yet in use, waiting... (${elapsed}ms)`);
                    setTimeout(checkHealth, checkInterval);
                    return;
                }

                // Test basic connectivity
                const connectivityResult = await this._testConnectivity(instanceId, expectedPort);
                if (!connectivityResult.success) {
                    console.log(`⏳ Connectivity test failed, retrying... (${elapsed}ms): ${connectivityResult.error}`);
                    setTimeout(checkHealth, checkInterval);
                    return;
                }

                // Test MCP protocol endpoints
                const protocolResult = await this._testMCPProtocol(instanceId, expectedPort);
                if (!protocolResult.success) {
                    console.log(`⏳ MCP protocol test failed, retrying... (${elapsed}ms): ${protocolResult.error}`);
                    setTimeout(checkHealth, checkInterval);
                    return;
                }

                // All checks passed
                console.log(`✅ Instance ${instanceId} startup validation successful after ${elapsed}ms`);
                this.startupValidation.delete(instanceId);
                this._startContinuousHealthMonitoring(instanceId, expectedPort);
                resolve(true);

            } catch (error) {
                const elapsed = Date.now() - startTime;
                console.log(`❌ Health check error for ${instanceId} after ${elapsed}ms:`, error.message);
                setTimeout(checkHealth, checkInterval);
            }
        };

        // Start the validation process
        setTimeout(checkHealth, 1000); // Give process 1 second to start
    }

    async _isPortInUse(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();
            
            server.listen(port, () => {
                server.close(() => resolve(false));
            });
            
            server.on('error', () => resolve(true));
        });
    }

    async _testConnectivity(instanceId, port) {
        try {
            const response = await fetch(`http://localhost:${port}/health`, {
                timeout: 5000,
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async _testMCPProtocol(instanceId, port) {
        try {
            // Test info endpoint
            const infoResponse = await fetch(`http://localhost:${port}/${instanceId}/mcp/figma/info`, {
                timeout: 5000,
                signal: AbortSignal.timeout(5000)
            });
            
            if (!infoResponse.ok) {
                return { success: false, error: `Info endpoint failed: HTTP ${infoResponse.status}` };
            }

            // Test tools endpoint
            const toolsResponse = await fetch(`http://localhost:${port}/${instanceId}/mcp/figma/tools`, {
                timeout: 5000,
                signal: AbortSignal.timeout(5000)
            });
            
            if (!toolsResponse.ok) {
                return { success: false, error: `Tools endpoint failed: HTTP ${toolsResponse.status}` };
            }

            const toolsData = await toolsResponse.json();
            if (!toolsData.tools || !Array.isArray(toolsData.tools)) {
                return { success: false, error: 'Invalid tools response format' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    _startContinuousHealthMonitoring(instanceId, port) {
        if (this.healthChecks.has(instanceId)) {
            clearInterval(this.healthChecks.get(instanceId));
        }

        const interval = setInterval(async () => {
            const health = await this._performHealthCheck(instanceId, port);
            if (!health.healthy) {
                console.log(`⚠️  Health check failed for instance ${instanceId}: ${health.error}`);
                this.emit('health-check-failed', { instanceId, port, error: health.error });
            }
        }, this.healthCheckInterval);

        this.healthChecks.set(instanceId, interval);
        console.log(`💗 Started continuous health monitoring for instance ${instanceId}`);
    }

    async _performHealthCheck(instanceId, port) {
        try {
            const connectivity = await this._testConnectivity(instanceId, port);
            if (!connectivity.success) {
                return { healthy: false, error: `Connectivity failed: ${connectivity.error}` };
            }

            const protocol = await this._testMCPProtocol(instanceId, port);
            if (!protocol.success) {
                return { healthy: false, error: `Protocol failed: ${protocol.error}` };
            }

            return { healthy: true };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    /**
     * Stop monitoring for an instance
     * @param {string} instanceId - Instance ID
     */
    stopMonitoring(instanceId) {
        if (this.healthChecks.has(instanceId)) {
            clearInterval(this.healthChecks.get(instanceId));
            this.healthChecks.delete(instanceId);
            console.log(`🛑 Stopped health monitoring for instance ${instanceId}`);
        }

        if (this.startupValidation.has(instanceId)) {
            const validation = this.startupValidation.get(instanceId);
            this.startupValidation.delete(instanceId);
            validation.reject(new Error('Monitoring stopped'));
        }
    }

    /**
     * Get health status for all monitored instances
     * @returns {Promise<Array>} Health status array
     */
    async getAllHealthStatus() {
        const results = [];
        for (const [instanceId, interval] of this.healthChecks) {
            // Extract port from the monitoring data (would need to store this)
            // For now, we'll just return the instance as healthy if it's being monitored
            results.push({
                instanceId,
                healthy: true,
                lastCheck: new Date(),
                monitoring: true
            });
        }
        return results;
    }

    /**
     * Clean up all monitoring
     */
    cleanup() {
        for (const [instanceId, interval] of this.healthChecks) {
            clearInterval(interval);
        }
        this.healthChecks.clear();
        this.startupValidation.clear();
        this.retryAttempts.clear();
        console.log('🧹 Health monitor cleanup completed');
    }
}

// Create singleton instance
export const processHealthMonitor = new ProcessHealthMonitor();
export default processHealthMonitor;