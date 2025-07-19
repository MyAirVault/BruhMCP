// @ts-check

/**
 * Generate HTML email template for magic link
 * @param {string} magicLink - The magic link URL
 * @param {string} email - Recipient email address
 * @returns {string} HTML email content
 */
export function magicLinkEmailTemplate(magicLink, email) {
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
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        
        .logo {
            width: 32px;
            height: 28px;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .magic-link-button:hover {
            transform: translateY(-2px);
        }
        
        .security-notice {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 16px 20px;
            margin: 30px 0;
            border-radius: 4px;
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
            background: #f8fafc;
            border-radius: 8px;
            word-break: break-all;
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
                <h1>
                    <svg class="logo" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6314 8.96042L26.7571 26.5033C27.0085 26.949 27.6485 26.9604 27.9342 26.5376L31.6828 20.7433C31.8199 20.5261 31.8314 20.2519 31.7056 20.0233L20.4828 0.62899C20.2199 0.171847 19.5571 0.171847 19.2942 0.62899L15.9914 6.32042C15.8656 6.53756 15.6371 6.66328 15.3971 6.66328H8.49421C8.24279 6.66328 8.02564 6.78899 7.89993 7.00613L0.37993 20.0576C0.254216 20.2747 0.254216 20.5261 0.37993 20.7433L4.05993 27.1433C4.18564 27.3604 4.41422 27.4861 4.65422 27.4861H19.4199C19.9456 27.4861 20.2771 26.9147 20.0142 26.4576L16.6199 20.5947C16.3571 20.1376 15.6942 20.1376 15.4314 20.5947L12.7914 25.189C12.5285 25.6461 11.8656 25.6461 11.6028 25.189L9.04279 20.7433C8.91707 20.5261 8.91707 20.2747 9.04279 20.0576L15.4314 8.97185C15.6942 8.51471 16.3571 8.51471 16.6199 8.97185L16.6314 8.96042Z" fill="#FF802C"/>
                    </svg>
                    bruhMCP
                </h1>
                <p>Your secure sign-in link is ready</p>
            </div>
            
            <div class="content">
                <h2>Welcome back!</h2>
                <p>Click the button below to securely sign in to your BruhMCP account:</p>
                
                <a href="${magicLink}" class="magic-link-button">
                    Sign In to BruhMCP
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
