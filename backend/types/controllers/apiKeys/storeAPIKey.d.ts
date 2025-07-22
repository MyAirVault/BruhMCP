/**
 * Store API key for the authenticated user
 * @param {import('express').Request & { user: { id: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export function storeAPIKeyHandler(req: import("express").Request & {
    user: {
        id: string;
    };
}, res: import("express").Response): Promise<void>;
//# sourceMappingURL=storeAPIKey.d.ts.map