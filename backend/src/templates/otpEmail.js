// @ts-check

/**
 * Generate HTML email template for OTP verification
 * @param {string} otp - The OTP code
 * @param {string} email - Recipient email address
 * @param {string} purpose - OTP purpose (signup_verification, login_otp, password_reset, email_change_verification, verification)
 * @param {number} expiryMinutes - OTP expiry time in minutes
 * @returns {string} HTML email content
 */
function otpEmailTemplate(otp, email, purpose = 'verification', expiryMinutes = 5) {
    const templates = {
        signup_verification: {
            title: '🎉 Welcome to bruhMCP!',
            heading: 'Welcome to our platform!',
            message: 'Thanks for signing up! To complete your account setup and start using all our features, please verify your email address.',
            footer: 'Once verified, you\'ll be automatically logged in and ready to go!'
        },
        login_otp: {
            title: '🔐 Secure Login Verification',
            heading: 'Secure Login Verification',
            message: 'Someone is trying to log into your account. For security, please verify it\'s you.',
            footer: 'If this wasn\'t you, please secure your account immediately.'
        },
        password_reset: {
            title: '🔑 Password Reset Request',
            heading: 'Password Reset Request',
            message: 'You requested to reset your password. Use the code below to proceed:',
            footer: 'If you didn\'t request a password reset, please ignore this email and consider securing your account.'
        },
        email_change_verification: {
            title: '🔄 Email Change Verification',
            heading: 'Email Change Verification',
            message: 'You requested to change your email address. To complete this process, please verify your new email address.',
            footer: 'If you didn\'t request this change, please ignore this email and secure your account immediately.'
        },
        verification: {
            title: '📧 Email Verification',
            heading: 'Email Verification',
            message: 'Please use this code to complete your verification process.',
            footer: 'Keep this code confidential and don\'t share it with anyone.'
        }
    };

    const template = templates[purpose] || templates.verification;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .email-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: black;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            text-align: center;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .content h2 {
            color: #1a202c;
            margin: 0 0 20px 0;
            font-size: 24px;
            font-weight: 600;
        }
        
        .content p {
            color: #4a5568;
            margin: 0 0 30px 0;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .otp-code {
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .otp-code p {
            margin: 0 0 10px 0;
            color: #4a5568;
            font-size: 14px;
        }
        
        .otp-digits {
            font-family: 'Courier New', monospace;
            font-size: 36px;
            font-weight: bold;
            color: #1a202c;
            letter-spacing: 8px;
            margin: 0;
            padding: 10px 0;
        }
        
        .expiry-notice {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: left;
        }
        
        .expiry-notice p {
            margin: 0;
            color: #c53030;
            font-size: 14px;
            font-weight: 500;
        }
        
        .security-notice {
            background: #f0fff4;
            border-left: 4px solid #38a169;
            padding: 16px 20px;
            margin: 30px 0;
            border-radius: 4px;
            text-align: left;
        }
        
        .security-notice p {
            margin: 0;
            color: #2d3748;
            font-size: 14px;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            color: #718096;
            margin: 0 0 8px 0;
            font-size: 14px;
        }
        
        .help-section {
            margin: 15px 0;
        }
        
        .help-section p {
            color: #718096;
            margin: 0 0 4px 0;
            font-size: 14px;
        }
        
        .help-section a {
            color: #667eea;
            text-decoration: none;
        }
        
        .help-section a:hover {
            text-decoration: underline;
        }

        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .otp-digits {
                font-size: 28px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="header">
                <h1>😎 bruhMCP</h1>
                <p>${template.title}</p>
            </div>
            
            <div class="content">
                <h2>${template.heading}</h2>
                <p>${template.message}</p>
                
                <div class="otp-code">
                    <p>Your verification code is:</p>
                    <div class="otp-digits">${otp}</div>
                </div>
                
                <div class="expiry-notice">
                    <p>⏰ This code will expire in ${expiryMinutes} minutes for security.</p>
                </div>
                
                <div class="security-notice">
                    <p><strong>🔒 Security Notice:</strong> Never share this code with anyone. Keep it confidential and use it only to complete your verification.</p>
                </div>
                
                <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                    ${template.footer}
                </p>
            </div>
            
            <div class="footer">
                <div class="help-section">
                    <p>Need help? Ask at <a href="mailto:support@bruhmcp.com">support@bruhmcp.com</a></p>
                    <p>or visit our <a href="https://help.bruhmcp.com">help center</a></p>
                </div>
                
                <p>This email was sent to <strong>${email}</strong></p>
                <p>© 2025 BruhMCP. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

module.exports = {
    otpEmailTemplate
};