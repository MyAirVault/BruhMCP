/**
 * Process Health Monitor - Comprehensive monitoring and validation for MCP processes
 */
export class ProcessHealthMonitor extends EventEmitter<[never]> {
    constructor();
    healthChecks: Map<any, any>;
    startupValidation: Map<any, any>;
    retryAttempts: Map<any, any>;
    maxRetries: number;
    startupTimeout: number;
    healthCheckInterval: number;
    /**
     * Validate process startup with comprehensive checks
     * @param {string} instanceId - Instance ID
     * @param {Object} processInfo - Process information
     * @param {number} expectedPort - Expected port number
     * @returns {Promise<boolean>} True if process started successfully
     */
    validateProcessStartup(instanceId: string, processInfo: Object, expectedPort: number): Promise<boolean>;
    _performStartupValidation(instanceId: any, expectedPort: any, startTime: any, maxWaitTime: any, checkInterval: any, resolve: any, reject: any): Promise<void>;
    _isPortInUse(port: any): Promise<any>;
    _testConnectivity(instanceId: any, port: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    _testMCPProtocol(instanceId: any, port: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    _startContinuousHealthMonitoring(instanceId: any, port: any): void;
    _performHealthCheck(instanceId: any, port: any): Promise<{
        healthy: boolean;
        error?: undefined;
    } | {
        healthy: boolean;
        error: any;
    }>;
    /**
     * Stop monitoring for an instance
     * @param {string} instanceId - Instance ID
     */
    stopMonitoring(instanceId: string): void;
    /**
     * Get health status for all monitored instances
     * @returns {Promise<Array>} Health status array
     */
    getAllHealthStatus(): Promise<any[]>;
    /**
     * Clean up all monitoring
     */
    cleanup(): void;
}
export const processHealthMonitor: ProcessHealthMonitor;
export default processHealthMonitor;
import { EventEmitter } from 'events';
//# sourceMappingURL=process-health-monitor.d.ts.map