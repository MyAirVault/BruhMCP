/**
 * Delete API key
 * @param {import('express').Request & { user: { id: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>}
 */
export function deleteAPIKeyHandler(
	req: import('express').Request & {
		user: {
			id: string;
		};
	},
	res: import('express').Response
): Promise<import('express').Response | void>;
//# sourceMappingURL=deleteAPIKey.d.ts.map
