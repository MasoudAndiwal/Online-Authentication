/**
 * Email Service for sending password reset codes
 * 
 * SETUP INSTRUCTIONS:
 * 
 * Using Nodemailer with Gmail (Server-side compatible)
 * 1. Create a Gmail account or use existing
 * 2. Enable 2-Factor Authentication on your Gmail
 * 3. Generate an App Password:
 *    - Go to Google Account → Security → 2-Step Verification → App passwords
 *    - Generate new app password for "Mail"
 * 4. Add to .env.local:
 *    EMAIL_USER=your-email@gmail.com
 *    EMAIL_PASS=your-app-password
 * 5. Install: npm install nodemailer
 */

import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Generate password reset email HTML template
 */
export function generateResetEmailHTML(resetCode: string, firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .code-container {
      background: #f8f9fa;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .expiry {
      margin-top: 15px;
      font-size: 14px;
      color: #e74c3c;
      font-weight: 500;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .warning-text {
      color: #856404;
      margin: 0;
      font-size: 14px;
    }
    .footer {
      background: #f8f9fa;
      padding: 25px;
      text-align: center;
      color: #666;
      font-size: 13px;
    }
    .footer p {
      margin: 5px 0;
    }
    .support-link {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${firstName},</div>
      <div class="message">
        We received a request to reset your password for your University Attendance System account. 
        Use the verification code below to complete the password reset process.
      </div>
      
      <div class="code-container">
        <div class="code-label">Your Reset Code</div>
        <div class="code">${resetCode}</div>
        <div class="expiry">⏰ This code expires in 15 minutes</div>
      </div>
      
      <div class="warning">
        <p class="warning-text">
          <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, 
          please ignore this email and ensure your account is secure.
        </p>
      </div>
      
      <div class="message">
        For security reasons, this code can only be used once and will expire after 15 minutes.
      </div>
    </div>
    <div class="footer">
      <p><strong>University Attendance System</strong></p>
      <p>Office Staff Portal</p>
      <p>Need help? Contact <a href="mailto:support@university.edu" class="support-link">support@university.edu</a></p>
      <p style="margin-top: 15px; color: #999;">© 2025 All rights reserved</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text version of reset email
 */
export function generateResetEmailText(resetCode: string, firstName: string): string {
  return `
Hello ${firstName},

We received a request to reset your password for your University Attendance System account.

Your password reset code is: ${resetCode}

This code expires in 15 minutes and can only be used once.

If you didn't request a password reset, please ignore this email and ensure your account is secure.

---
University Attendance System
Office Staff Portal
Need help? Contact support@university.edu
© 2025 All rights reserved
  `.trim();
}

/**
 * Send email using configured email service
 * 
 * This is a placeholder implementation. You need to choose one of the options:
 * - Resend (recommended)
 * - SendGrid
 * - Supabase Edge Functions
 * 
 * See EMAIL_SETUP.md for detailed instructions
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResponse> {
  try {
    // Check if Nodemailer is configured
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      return await sendEmailWithNodemailer(params, emailUser, emailPass);
    } else {
      return {
        success: false,
        message: 'Email service not configured. Please add EMAIL_USER and EMAIL_PASS to .env.local',
        error: 'Missing email environment variables',
      };
    }
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email using Nodemailer (Gmail)
 */
async function sendEmailWithNodemailer(
  params: SendEmailParams,
  emailUser: string,
  emailPass: string
): Promise<EmailResponse> {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"University Attendance System" <${emailUser}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetCode: string,
  firstName: string
): Promise<EmailResponse> {
  const html = generateResetEmailHTML(resetCode, firstName);
  const text = generateResetEmailText(resetCode, firstName);

  return sendEmail({
    to: email,
    subject: 'Password Reset Code - University Attendance System',
    html,
    text,
  });
}
