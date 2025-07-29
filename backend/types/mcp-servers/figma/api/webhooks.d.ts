/**
 * Create a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {any} webhookData - Webhook configuration data
 * @returns {Promise<any>}
 */
export function postFigmaWebhook(apiKey: string, webhookData: any): Promise<any>;
/**
 * Get webhooks (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} [teamId] - Optional team ID to filter webhooks
 * @returns {Promise<any>}
 */
export function getFigmaWebhooks(apiKey: string, teamId?: string | undefined): Promise<any>;
/**
 * Update a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to update
 * @param {any} webhookData - Updated webhook configuration data
 * @returns {Promise<any>}
 */
export function putFigmaWebhook(apiKey: string, webhookId: string, webhookData: any): Promise<any>;
/**
 * Delete a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to delete
 * @returns {Promise<any>}
 */
export function deleteFigmaWebhook(apiKey: string, webhookId: string): Promise<any>;
//# sourceMappingURL=webhooks.d.ts.map