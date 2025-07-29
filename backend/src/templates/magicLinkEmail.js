// @ts-check

/**
 * Generate HTML email template for magic link
 * @param {string} magicLink - The magic link URL
 * @param {string} email - Recipient email address
 * @returns {string} HTML email content
 */
function magicLinkEmailTemplate(magicLink, email) {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to BruhMCP</title>
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
            background: #f8fafc;
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
        
        .magic-link-button {
            display: inline-block;
            background: black !important;
            color: white !important;
            text-decoration: none !important;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
            border: none;
        }
        
        .magic-link-button:hover {
            transform: translateY(-2px);
        }
        
        .security-notice {
            background: white;
            border-left: 4px solid #667eea;
            padding: 16px 20px;
            margin: 30px 0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
        
        .link-fallback {
            margin-top: 20px;
            padding: 16px;
            background: white;
            border-radius: 8px;
            word-break: break-all;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        
        .link-fallback p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #4a5568;
        }
        
        .link-fallback a {
            color: #667eea;
            word-break: break-all;
            font-size: 12px;
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
            
            .magic-link-button {
                padding: 14px 24px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="header">
                <h1>😎 bruhMCP</h1>
                <p>Your secure sign-in link is ready</p>
            </div>
            
            <div class="content">
                <h2>Welcome back!</h2>
                <p>Click the button below to securely sign in to your BruhMCP account:</p>
                
                <a href="${magicLink}" class="magic-link-button">
                    Sign In to bruhMCP
                </a>
                
                <div class="security-notice">
                    <p><strong>🔒 Security Notice:</strong> This link will expire in 15 minutes and can only be used once. If you didn't request this sign-in link, you can safely ignore this email.</p>
                </div>
                
                <div class="link-fallback">
                    <p>Button not working? Copy and paste this link into your browser:</p>
                    <a href="${magicLink}">${magicLink}</a>
                </div>
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
	magicLinkEmailTemplate
};
