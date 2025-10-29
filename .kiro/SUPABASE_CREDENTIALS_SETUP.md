# 🔐 Supabase Environment Variables Setup

## 🚨 Error You're Seeing:
```
Error: Missing Supabase environment variables. 
Please check SUPABASE_URL and SUPABASE_ANON_KEY.
```

## ✅ Quick Fix (5 minutes)

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Log in to your account

2. **Select Your Project:**
   - Click on your project (or create a new one if you haven't)

3. **Get Your Credentials:**
   - Click on **⚙️ Settings** in the left sidebar
   - Click on **API** section
   - You'll see two important values:

   ```
   📍 Project URL (SUPABASE_URL)
   Example: https://xxxxxxxxxxxxx.supabase.co
   
   🔑 anon public key (SUPABASE_ANON_KEY)
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### Step 2: Add to Your `.env` File

1. **Open your `.env` file** (located in the root directory: `d:\Collage\onlineAuth\.env`)

2. **Add these two lines** at the end of the file:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

3. **Replace the values** with your actual credentials from Step 1

**Example:**
```env
# Supabase Configuration
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk4NjU4MzcsImV4cCI6MjAwNTQ0MTgzN30.example_signature_here
```

---

### Step 3: Restart Your Development Server

**IMPORTANT:** Environment variables are only loaded when the server starts!

1. **Stop your current server:**
   - Press `Ctrl + C` in the terminal

2. **Restart the server:**
   ```bash
   npm run dev
   ```

3. **Wait for it to fully start:**
   ```
   ▲ Next.js 15.5.4
   - Local:        http://localhost:3000
   ```

---

### Step 4: Test Again

1. Navigate to: `http://localhost:3000/dashboard/schedule`
2. Click **"Create Schedule"**
3. Fill in the form and click **"Create Schedule"**
4. ✅ Success! Your class should be created

---

## 📋 Complete `.env` File Example

Your `.env` file should look something like this:

```env
# Other existing environment variables...
# (keep everything that's already there)

# Supabase Configuration (ADD THESE TWO LINES)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

---

## 🔍 Troubleshooting

### ❌ Error: "Invalid API key"
- Check that you copied the **anon public** key (not the service_role key)
- Make sure there are no extra spaces or line breaks

### ❌ Error: "Failed to fetch"
- Verify your SUPABASE_URL is correct
- Check your internet connection
- Make sure you've restarted the dev server

### ❌ Still getting environment variable error?
- Check that the variable names are exactly: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- No typos or extra characters
- Must restart the server after adding variables

### ❌ Error: "relation does not exist"
- You need to run the SQL migration first
- See: `SCHEDULE_BACKEND_SETUP.md` for instructions

---

## 🎯 Quick Checklist

Before testing:
- [ ] Got SUPABASE_URL from Supabase dashboard
- [ ] Got SUPABASE_ANON_KEY from Supabase dashboard
- [ ] Added both to `.env` file
- [ ] Saved the `.env` file
- [ ] Stopped the dev server (Ctrl+C)
- [ ] Started the dev server again (`npm run dev`)
- [ ] Ran the SQL migration in Supabase (see SCHEDULE_BACKEND_SETUP.md)

---

## 🗄️ Don't Forget the Database Tables!

After adding the environment variables, you also need to create the database tables:

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy the SQL** from: `supabase/migrations/create_schedule_tables.sql`
3. **Paste and Run** in SQL Editor
4. **Verify:** You should see `classes` and `schedule_entries` tables

See full instructions in: `SCHEDULE_BACKEND_SETUP.md`

---

## 🔒 Security Note

**IMPORTANT:** 
- Never commit your `.env` file to Git (it's already in `.gitignore`)
- Never share your Supabase keys publicly
- The `anon` key is safe for frontend use
- Never use the `service_role` key in frontend code

---

## ✅ You're Done!

Once you've completed all steps:
1. ✅ Environment variables added
2. ✅ Dev server restarted
3. ✅ Database tables created
4. 🎉 Ready to create classes!

---

## 📚 Related Guides

- `SCHEDULE_BACKEND_SETUP.md` - Complete backend setup
- `QUICK_START_UI.md` - UI features guide
- `UI_IMPROVEMENTS_SUMMARY.md` - Design improvements

---

**Need Help?**
If you're still having issues, check:
1. Supabase Dashboard → Project Settings → API (verify credentials)
2. Your `.env` file format (no quotes needed around values)
3. Terminal logs for specific error messages
