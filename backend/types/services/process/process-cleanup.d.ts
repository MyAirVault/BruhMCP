/**
 * Process Cleanup Service - Handles database cleanup for failed processes
 */
export class ProcessCleanupService {
    setupEventHandlers(): void;
    handleProcessExit(event: any): Promise<void>;
    handleProcessError(event: any): Promise<void>;
    handleHealthCheckFailure(event: any): Promise<void>;
    verifyHealthFailure(instanceId: any, port: any): Promise<boolean>;
    /**
     * Scan for orphaned database records and clean them up
     * @returns {Promise<Object>} Cleanup results
     */
    cleanupOrphanedInstances(): Promise<Object>;
    cleanupOrphanedInstance(instance: any): Promise<void>;
}
export const processCleanupService: ProcessCleanupService;
export default processCleanupService;
//# sourceMappingURL=process-cleanup.d.ts.map