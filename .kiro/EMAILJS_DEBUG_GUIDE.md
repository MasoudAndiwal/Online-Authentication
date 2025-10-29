# EmailJS Troubleshooting Guide - Email Not Sending

## Quick Diagnosis Steps

### Step 1: Check Server Logs
Look at your terminal where `npm run dev` is running. You should see these logs when you submit the forgot password form:

**Expected Logs:**
```
🔍 Checking EmailJS configuration...
Service ID exists: true
Template ID exists: true
Public Key exists: true
Private Key exists: true
✅ All EmailJS credentials found, attempting to send...
📧 Attempting to send email via EmailJS...
To: your-email@example.com
Subject: Password Reset Code - University Attendance System
EmailJS API Response: OK
✅ Email sent successfully via EmailJS
```

**Problem Logs (Missing Config):**
```
🔍 Checking EmailJS configuration...
Service ID exists: false
Template ID exists: false
❌ Missing EmailJS environment variables!
```

### Step 2: Verify .env.local File

Your `.env.local` file should have **ALL 4** EmailJS variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# EmailJS Configuration (REQUIRED)
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxx
```

### Step 3: Get Your EmailJS Credentials

#### A. Service ID
1. Go to https://dashboard.emailjs.com/admin
2. Click **Email Services** in sidebar
3. Your Service ID is shown (e.g., `service_abc123`)

#### B. Template ID
1. Go to **Email Templates** in sidebar
2. Your Template ID is shown (e.g., `template_xyz789`)
3. Make sure template has these variables:
   - `{{to_name}}`
   - `{{to_email}}`
   - `{{subject}}`
   - `{{reset_code}}`
   - `{{from_name}}`

#### C. Public Key
1. Go to **Account** → **General**
2. Find "Public Key" (e.g., `abc123xyz`)

#### D. Private Key (Access Token)
1. Go to **Account** → **Security**
2. Create or find "Private Key" / "Access Token" (e.g., `def456uvw`)

### Step 4: Restart Your Server

**CRITICAL:** After adding/changing .env.local:
```bash
# Stop server: Ctrl+C
npm run dev
```

### Step 5: Test Again

1. Go to `http://localhost:3000/forgot-password`
2. Enter your email
3. Check **server terminal logs** for detailed debugging info

## Common Issues & Solutions

### Issue 1: "Missing EmailJS environment variables"

**Cause:** Environment variables not in `.env.local` or server not restarted

**Solution:**
1. Double-check all 4 variables are in `.env.local`
2. Restart dev server
3. Make sure variable names are EXACTLY:
   - `EMAILJS_SERVICE_ID` (not SERVICE_KEY)
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_PRIVATE_KEY` (not ACCESS_TOKEN)

### Issue 2: "Failed to send email via EmailJS"

**Cause:** Incorrect credentials or template setup

**Solution:**
1. Verify Service ID is correct
2. Verify Template ID is correct
3. Check EmailJS dashboard for errors
4. Make sure email service is connected (Gmail, etc.)

### Issue 3: Email sends but doesn't arrive

**Cause:** Email service not connected or wrong email

**Solution:**
1. Check EmailJS dashboard → Email Services
2. Make sure Gmail/Outlook is connected
3. Check spam/junk folder
4. Verify template has `{{to_email}}` variable

### Issue 4: Template variables not working

**Your template must have these EXACT variable names:**
```
{{to_name}} - Recipient name
{{to_email}} - Recipient email
{{subject}} - Email subject
{{reset_code}} - 6-digit code
{{from_name}} - Sender name
{{message}} - Full message text (optional)
```

## Test Checklist

- [ ] All 4 EmailJS env variables in `.env.local`
- [ ] Server restarted after adding variables
- [ ] EmailJS service connected (Gmail/Outlook)
- [ ] Template created with correct variables
- [ ] Service ID matches dashboard
- [ ] Template ID matches dashboard
- [ ] Public Key from Account → General
- [ ] Private Key from Account → Security
- [ ] Check server logs for detailed errors
- [ ] Email sent successfully (check terminal)
- [ ] Email received (check inbox/spam)

## Debugging Commands

### View Current Environment Variables (in API)
Check server logs when submitting forgot password - you'll see:
```
🔍 Checking EmailJS configuration...
Service ID exists: true/false
Template ID exists: true/false
...
```

### Manual Test
You can also test directly from EmailJS dashboard:
1. Go to Email Templates
2. Click "Test it" button
3. Fill in template variables
4. Click "Send Test Email"

## Still Not Working?

If emails still aren't sending after following all steps:

1. **Check Server Logs Carefully**
   - Look for exact error message
   - Note which variables are missing

2. **Verify EmailJS Account**
   - Free tier: 200 emails/month
   - Check you haven't hit limit
   - Check service is active

3. **Test Email Service Connection**
   - Go to Email Services
   - Click "Test Connection"
   - Make sure it succeeds

4. **Copy Credentials Carefully**
   - No extra spaces
   - No quotes around values in .env.local
   - Exact copy-paste from dashboard

## Example Working Configuration

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=abc123xyz456
EMAILJS_PRIVATE_KEY=def789uvw012
```

After adding these, restart server and test!
