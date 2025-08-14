// @ts-check
const nodemailer = require('nodemailer');
const { magicLinkEmailTemplate } = require('../templates/magicLinkEmail.js');
const { otpEmailTemplate } = require('../templates/otpEmail.js');
const { SENDER_EMAIL } = require('../config/env.js');

/**
 * @typedef {Object} EmailResult
 * @property {boolean} success
 * @property {string} [messageId]
 * @property {string} [error]
 */

class EmailService {
	constructor() {
		this.transporter = null;
		this.initializeTransporter();
	}

	/**
	 * Initialize nodemailer transporter
	 */
	initializeTransporter() {
		try {
			this.transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: parseInt(process.env.SMTP_PORT || '587'),
				secure: process.env.SMTP_PORT === '465', // true for port 465, false for other ports
				auth: {
					user: process.env.SMTP_USERNAME,
					pass: process.env.SMTP_PASSWORD,
				},
			});

			console.log('Email service initialized successfully');
		} catch (error) {
			console.error('Failed to initialize email service:', error instanceof Error ? error.message : error);
		}
	}

	/**
	 * Send magic link email to user
	 * @param {string} email - Recipient email address
	 * @param {string} token - Magic link token
	 * @returns {Promise<EmailResult>}
	 */
	async sendMagicLink(email, token) {
		if (!this.transporter) {
			console.error('Email transporter not initialized');
			return {
				success: false,
				error: 'Email service not available',
			};
		}

		try {
			// Generate magic link URL
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
			const magicLink = `${frontendUrl}/verify?token=${token}`;

			// Generate HTML email content
			const htmlContent = magicLinkEmailTemplate(magicLink, email);

			// Email options
			const mailOptions = {
				from: SENDER_EMAIL || 'no-reply@bruhmcp.com',
				to: email,
				subject: 'Your Magic Link - Sign in to BruhMCP',
				html: htmlContent,
				text: `Click this link to sign in: ${magicLink}`,
			};

			// Send email
			const result = await this.transporter.sendMail(mailOptions);

			console.log(`✅ Magic link email sent to ${email}:`, result.messageId);

			return {
				success: true,
				messageId: result.messageId,
			};
		} catch (error) {
			console.error(`❌ Failed to send magic link email to ${email}:`, error);

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	/**
	 * Send OTP email to user
	 * @param {string} email - Recipient email address
	 * @param {string} otp - OTP code
	 * @param {string} purpose - OTP purpose (signup_verification, login_otp, password_reset, email_change_verification, verification)
	 * @param {number} expiryMinutes - OTP expiry time in minutes
	 * @returns {Promise<EmailResult>}
	 */
	async sendOTP(email, otp, purpose = 'verification', expiryMinutes = 5) {
		if (!this.transporter) {
			console.error('Email transporter not initialized');
			return {
				success: false,
				error: 'Email service not available',
			};
		}

		try {
			// Generate HTML email content
			const htmlContent = otpEmailTemplate(otp, email, purpose, expiryMinutes);
			
			// Get subject based on purpose
			/** @type {Record<string, string>} */
			const subjects = {
				signup_verification: 'Welcome! Verify your email to get started',
				login_otp: 'Your login verification code',
				password_reset: 'Reset your password',
				email_change_verification: 'Verify your new email address',
				verification: 'Your verification code'
			};
			
			const subject = subjects[purpose] || subjects.verification;

			// Email options
			const mailOptions = {
				from: SENDER_EMAIL || 'no-reply@bruhmcp.com',
				to: email,
				subject: subject,
				html: htmlContent,
				text: `Your verification code is: ${otp}. This code will expire in ${expiryMinutes} minutes.`,
			};

			// Send email
			const result = await this.transporter.sendMail(mailOptions);

			console.log(`✅ OTP email sent to ${email}:`, result.messageId);

			return {
				success: true,
				messageId: result.messageId,
			};
		} catch (error) {
			console.error(`❌ Failed to send OTP email to ${email}:`, error);

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	/**
	 * Verify email service connection
	 * @returns {Promise<boolean>}
	 */
	async verifyConnection() {
		if (!this.transporter) {
			return false;
		}

		try {
			await this.transporter.verify();
			console.log('✅ Email service connection verified');
			return true;
		} catch (error) {
			console.error('❌ Email service connection failed:', error);
			return false;
		}
	}
}

// Export singleton instance
const emailService = new EmailService();
module.exports = { emailService };
