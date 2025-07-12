/**
 * Get API keys for the authenticated user
 * @param {import('express').Request & { user: { id: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export function getAPIKeys(req: import("express").Request & {
    user: {
        id: string;
    };
}, res: import("express").Response): Promise<void>;
//# sourceMappingURL=getAPIKeys.d.ts.map