# Gmail + Nodemailer Setup Guide

## ✅ Fixed: Server-Side Email Sending

**Problem:** EmailJS only works in browsers, not on servers (Node.js).  
**Solution:** Switched to Nodemailer - works perfectly on the server.

---

## 📧 Setup Gmail for Password Reset Emails

### Step 1: Prepare Your Gmail Account

**Option A: Use Existing Gmail**
- Use any Gmail account you already have

**Option B: Create New Gmail**
1. Go to https://accounts.google.com
2. Create a new Gmail account for your app (e.g., `universityapp2024@gmail.com`)

### Step 2: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** in left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA (use phone number)

### Step 3: Generate App Password

1. Stay on the **Security** page
2. Under "Signing in to Google", click **2-Step Verification**
3. Scroll down and click **App passwords** at the bottom
4. You might need to sign in again
5. In "Select app" dropdown, choose **Mail**
6. In "Select device" dropdown, choose **Other** and type: `University App`
7. Click **Generate**
8. **COPY THE 16-CHARACTER PASSWORD** (looks like: `abcd efgh ijkl mnop`)
   - You won't be able to see it again!

### Step 4: Update .env.local

Open or create `.env.local` in your project root:

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Gmail Configuration for Nodemailer
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Important:**
- `EMAIL_USER` = Your Gmail address
- `EMAIL_PASS` = The 16-character app password (with or without spaces)

**Example:**
```env
EMAIL_USER=universityapp2024@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### Step 5: Restart Your Server

```bash
# Stop server: Ctrl+C
npm run dev
```

### Step 6: Test Password Reset

1. Go to `http://localhost:3000/forgot-password`
2. Enter your office staff email
3. Submit the form
4. Check your inbox (and spam folder)
5. You should receive the reset code!

---

## 🔍 Troubleshooting

### "Invalid credentials" Error

**Cause:** Wrong email or app password

**Solution:**
1. Double-check `EMAIL_USER` is correct
2. Make sure `EMAIL_PASS` is the **App Password**, not your regular Gmail password
3. Remove all spaces from app password or keep them (both work)
4. Restart server after changing `.env.local`

### "Less secure app access" Error

**Cause:** Using regular password instead of app password

**Solution:**
- You MUST use an **App Password**, not your regular Gmail password
- Follow Step 3 above to generate one

### Email not arriving

**Check these:**
1. ✅ Check spam/junk folder
2. ✅ Verify email address is correct in office_staff table
3. ✅ Check server terminal for success message
4. ✅ Make sure account is active (`is_active = true`)

### "2FA not enabled" Error

**Solution:**
- You must enable 2-Factor Authentication first
- Go to Google Account → Security → 2-Step Verification
- Set it up, then generate app password

### Server logs say "Email sent" but nothing arrives

**Possible causes:**
1. Gmail delayed sending (wait 1-2 minutes)
2. Spam folder
3. Wrong email address in database
4. Gmail blocked the email (check Gmail "Sent" folder)

---

## ✅ Expected Server Logs

When password reset works correctly:

```
🚀 PASSWORD RESET REQUEST RECEIVED
📥 Request body: { email: '...' }
✅ Validation result: true

🔍 Looking up email in database: your@email.com
✅ User found: FirstName your@email.com
👤 Account active status: true

🔐 Generating reset code and token...
Generated code: 123456

💾 Storing new reset token in database...
Token storage result: SUCCESS

📧 ATTEMPTING TO SEND EMAIL
Email: your@email.com
Reset Code: 123456
First Name: FirstName

🔍 Checking email configuration...
Email user exists: true
Email password exists: true
✅ Email credentials found, attempting to send with Nodemailer...

📧 Attempting to send email via Nodemailer...
To: your@email.com
Subject: Password Reset Code - University Attendance System
✅ Email sent successfully via Nodemailer
Message ID: <random-id@gmail.com>

📬 EMAIL RESULT: {
  "success": true,
  "message": "Email sent successfully"
}
```

---

## 🎯 Benefits of Nodemailer vs EmailJS

| Feature | EmailJS | Nodemailer |
|---------|---------|------------|
| Works Server-Side | ❌ No | ✅ Yes |
| Domain Verification | Not needed | Not needed |
| Setup Complexity | Medium | Easy |
| Free Tier | 200/month | Gmail limits |
| Best For | Client-side | Server-side |

---

## 📝 Summary

**What Changed:**
- ❌ Removed EmailJS (browser-only)
- ✅ Added Nodemailer (server-compatible)
- ✅ Installed `nodemailer` and `@types/nodemailer`
- ✅ Updated email service to use Gmail

**What You Need:**
1. Gmail account
2. 2FA enabled
3. App password generated
4. Add to `.env.local`
5. Restart server

**That's it! Your password reset emails will now work!** 🎉
