export const emailService: EmailService;
export type EmailResult = {
    success: boolean;
    messageId?: string | undefined;
    error?: string | undefined;
};
/**
 * @typedef {Object} EmailResult
 * @property {boolean} success
 * @property {string} [messageId]
 * @property {string} [error]
 */
declare class EmailService {
    transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options> | null;
    /**
     * Initialize nodemailer transporter
     */
    initializeTransporter(): void;
    /**
     * Send magic link email to user
     * @param {string} email - Recipient email address
     * @param {string} token - Magic link token
     * @returns {Promise<EmailResult>}
     */
    sendMagicLink(email: string, token: string): Promise<EmailResult>;
    /**
     * Verify email service connection
     * @returns {Promise<boolean>}
     */
    verifyConnection(): Promise<boolean>;
}
import nodemailer from 'nodemailer';
export {};
//# sourceMappingURL=emailService.d.ts.map