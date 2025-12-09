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
 * Generate password reset email HTML template - Modern Design
 */
export function generateResetEmailHTML(resetCode: string, firstName: string): string {
  // Split code into individual digits for better display
  const codeDigits = resetCode.split('');
  const digitBoxes = codeDigits.map(digit => `
    <td style="padding: 0 4px;">
      <div style="width: 48px; height: 60px; background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%); border-radius: 10px; line-height: 60px; text-align: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
        <span style="color: #ffffff; font-size: 28px; font-weight: 700; font-family: 'SF Mono', 'Courier New', monospace;">${digit}</span>
      </div>
    </td>
  `).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Password Reset Code - University AttendanceHub</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Wrapper Table -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo Icon -->
                    <div style="width: 70px; height: 70px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; display: inline-block; line-height: 70px; margin-bottom: 16px;">
                      <span style="font-size: 36px;">&#127891;</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      University AttendanceHub
                    </h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 14px; font-weight: 500;">
                      Secure Password Reset
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 45px 40px 35px 40px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px; font-weight: 600;">
                Hello ${firstName}! &#128075;
              </h2>
              
              <!-- Message -->
              <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.7;">
                We received a request to reset your password. Use the verification code below to complete the process. This code is valid for <strong style="color: #1e293b;">15 minutes</strong>.
              </p>
              
              <!-- Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 30px 20px; text-align: center;">
                    
                    <!-- Code Label -->
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                      Your Verification Code
                    </p>
                    
                    <!-- Code Digits -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        ${digitBoxes}
                      </tr>
                    </table>
                    
                    <!-- Timer -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-top: 20px;">
                      <tr>
                        <td style="background-color: #fef3c7; border-radius: 20px; padding: 8px 16px;">
                          <span style="color: #b45309; font-size: 13px; font-weight: 600;">
                            &#9201; Expires in 15 minutes
                          </span>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Instructions -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 30px;">
                <tr>
                  <td style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 8px 8px 0; padding: 16px 20px;">
                    <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                      <strong>&#128161; Quick Tip:</strong> Enter this code on the password reset page to create your new password.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 20px;">
                <tr>
                  <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; padding: 16px 20px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                      <strong>&#128274; Security Notice:</strong> If you didn't request this code, please ignore this email. Your account remains secure.
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent);"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px 40px 40px; text-align: center;">
              
              <!-- Help Section -->
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px;">
                Need help? We're here for you.
              </p>
              
              <!-- Support Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="background-color: #f1f5f9; border-radius: 8px; padding: 12px 24px;">
                    <a href="mailto:support@university.edu" style="color: #2563eb; font-size: 14px; font-weight: 600; text-decoration: none;">
                      &#128231; Contact Support
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Copyright -->
              <p style="margin: 25px 0 0 0; color: #94a3b8; font-size: 12px;">
                &copy; 2025 University AttendanceHub. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 11px;">
                This is an automated message. Please do not reply directly to this email.
              </p>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
}


/**
 * Generate plain text version of reset email
 */
export function generateResetEmailText(resetCode: string, firstName: string): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UNIVERSITY ATTENDANCEHUB
   Secure Password Reset
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${firstName}!

We received a request to reset your password for your University AttendanceHub account.

┌─────────────────────────────────────┐
│                                     │
│   YOUR VERIFICATION CODE:           │
│                                     │
│         ${resetCode}                     │
│                                     │
│   ⏱ Expires in 15 minutes          │
│                                     │
└─────────────────────────────────────┘

💡 WHAT TO DO NEXT:
Enter this code on the password reset page to create your new password.

🔒 SECURITY NOTICE:
If you didn't request this code, please ignore this email. Your account remains secure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Contact us at support@university.edu

© 2025 University AttendanceHub. All rights reserved.
This is an automated message. Please do not reply directly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

/**
 * Send email using configured email service
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
      from: `"University AttendanceHub" <${emailUser}>`,
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
    subject: '🔐 Password Reset Code - University AttendanceHub',
    html,
    text,
  });
}
