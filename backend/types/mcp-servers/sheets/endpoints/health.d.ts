export = healthCheck;
/**
 * Health check endpoint handler
 * @param {{params: {instanceId: string}}} req - Express request object
 * @param {{json: Function, status: Function}} res - Express response object
 */
declare function healthCheck(req: {
    params: {
        instanceId: string;
    };
}, res: {
    json: Function;
    status: Function;
}): Promise<void>;
//# sourceMappingURL=health.d.ts.map