# EmailJS Setup Guide for Password Reset

## Why EmailJS?
- ✅ No domain verification required
- ✅ Free tier: 200 emails/month
- ✅ Easy setup
- ✅ Works with any email provider (Gmail, Outlook, etc.)

## Step-by-Step Setup

### 1. Create EmailJS Account
1. Go to https://www.emailjs.com
2. Sign up for free account
3. Verify your email

### 2. Add Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended)
4. Follow the connection steps
5. Note your **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Set up your template with these variables:

**Template Example:**
```
Subject: Password Reset Code - {{from_name}}

Hello {{to_name}},

We received a request to reset your password.

Your password reset code is: {{reset_code}}

This code expires in 15 minutes and can only be used once.

If you didn't request a password reset, please ignore this email.

---
{{from_name}}
University Attendance System
```

4. Note your **Template ID** (e.g., `template_xyz789`)

**Required Template Variables:**
- `{{to_name}}` - Recipient's first name
- `{{to_email}}` - Recipient's email
- `{{subject}}` - Email subject
- `{{message}}` - Full message text
- `{{reset_code}}` - 6-digit verification code
- `{{from_name}}` - Sender name

### 4. Get API Keys
1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `abc123xyz`)
3. Go to **Account** → **Security**
4. Create/find your **Private Key** (e.g., `def456uvw`)

### 5. Add to .env.local

Create or update your `.env.local` file:

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# EmailJS Configuration
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=abc123xyz
EMAILJS_PRIVATE_KEY=def456uvw
```

### 6. Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 7. Test Email Sending

1. Go to `http://localhost:3000/forgot-password`
2. Enter your office staff email
3. Check your inbox for the reset code

## EmailJS Template Setup Details

### Recommended Template Settings:

**Template Name:** Password Reset Code

**From Name:** `{{from_name}}`

**From Email:** Use your verified email in EmailJS service

**To Email:** `{{to_email}}`

**Subject:** `{{subject}}`

**Content (Plain Text):**
```
Hello {{to_name}},

{{message}}
```

**Content (HTML - Optional):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .code-box { background: #f0f0f0; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hello {{to_name}},</p>
    <p>We received a request to reset your password.</p>
    
    <div class="code-box">
      <div>Your Reset Code:</div>
      <div class="code">{{reset_code}}</div>
      <p style="color: #e74c3c; margin-top: 10px;">⏰ Expires in 15 minutes</p>
    </div>
    
    <p>If you didn't request this, please ignore this email.</p>
    
    <hr>
    <p style="color: #666; font-size: 12px;">
      {{from_name}}<br>
      University Attendance System<br>
      © 2025 All rights reserved
    </p>
  </div>
</body>
</html>
```

## Troubleshooting

### "Email not sent" error
- Check all 4 environment variables are set correctly
- Verify Service ID and Template ID match your EmailJS dashboard
- Make sure you restarted the dev server after adding .env.local

### Emails not arriving
- Check spam/junk folder
- Verify email service is connected in EmailJS dashboard
- Check EmailJS dashboard logs for delivery status
- Ensure template variables are correctly named

### "Invalid template" error
- Verify Template ID is correct
- Make sure template is published (not in draft)
- Check template variables match the code

### Rate Limiting
- Free tier: 200 emails/month
- Upgrade to paid plan if needed
- Requests are logged in EmailJS dashboard

## Environment Variables Summary

```env
EMAILJS_SERVICE_ID=      # From Email Services section
EMAILJS_TEMPLATE_ID=     # From Email Templates section  
EMAILJS_PUBLIC_KEY=      # From Account → General
EMAILJS_PRIVATE_KEY=     # From Account → Security
```

## Testing Checklist

- [ ] EmailJS account created and verified
- [ ] Email service connected (Gmail/Outlook/etc)
- [ ] Email template created with all variables
- [ ] All 4 environment variables added to .env.local
- [ ] Server restarted after adding variables
- [ ] Test email sent successfully
- [ ] Reset code received in inbox

## Support

**EmailJS Documentation:** https://www.emailjs.com/docs/
**EmailJS Dashboard:** https://dashboard.emailjs.com/

---

**Status:** Ready to use - no domain verification needed!
