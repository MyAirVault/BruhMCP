/**
 * Local development login/register
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function localLoginOrRegister(req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Get environment info for frontend
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function getEnvironmentInfo(_req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Test credentials without logging in (for CLI verification)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function testCredentials(req: import('express').Request, res: import('express').Response): Promise<void>;
//# sourceMappingURL=localAuthController.d.ts.map