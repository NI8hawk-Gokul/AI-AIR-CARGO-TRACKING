# 🔑 How to Get & Configure Your AfterShip API Key

## 5-Minute Setup

### Step 1️⃣: Create AfterShip Account

1. Open: **https://www.aftership.com/sign-up**
2. Enter:
   - Email address
   - Password (strong password recommended)
   - Phone number (optional)
3. Click **"Sign Up"**
4. Verify email (check inbox for verification link)

### Step 2️⃣: Get Your API Key

1. Log into AfterShip dashboard
2. Click on **Settings** (⚙️ icon, top right)
3. Click **"API Keys"** in left sidebar
4. Click **"Generate New Key"** (or find existing key)
5. Copy the API key (starts with `sk_`)

**Example:** `sk_1234abcd5678efgh`

### Step 3️⃣: Update `.env` File

Open the `.env` file in your project:

**Location:** `C:\AI-AIR-CARGO TRACKING\.env`

**Current content:**
```env
# ⚠️ ADD YOUR REAL AFTERSHIP API KEY HERE
# Get it from: https://www.aftership.com/api
# This file is GITIGNORED - never commit it!

AFTERSHIP_API_KEY=sk_YOUR_ACTUAL_API_KEY_HERE
AFTERSHIP_TIMEOUT=15000
CACHE_TTL=3600000

NODE_ENV=development
PORT=3001
```

**Replace `sk_YOUR_ACTUAL_API_KEY_HERE` with your REAL key:**

```env
# ⚠️ ADD YOUR REAL AFTERSHIP API KEY HERE
# Get it from: https://www.aftership.com/api
# This file is GITIGNORED - never commit it!

AFTERSHIP_API_KEY=sk_1234abcd5678efgh
AFTERSHIP_TIMEOUT=15000
CACHE_TTL=3600000

NODE_ENV=development
PORT=3001
```

**Save the file!** (Ctrl+S)

---

## ✅ Verification

### Check if it worked:

**Run the server:**
```bash
npm run server
```

**Look for this in the output:**
```
╔════════════════════════════════════════════════════════╗
║   🌐 AfterShip: ✅ ENABLED                             ║
╚════════════════════════════════════════════════════════╝
```

If you see `✅ ENABLED`, you're good! 🎉

### If you see `⚠️ NOT CONFIGURED`:
- Check that `.env` file has your API key
- Make sure there are no extra spaces
- Make sure it starts with `sk_`
- Restart the server (Ctrl+C, then `npm run server` again)

---

## 🔐 Safety Check

**⚠️ IMPORTANT:** 
- ✅ Your `.env` file is **GITIGNORED** (won't be committed)
- ✅ API key stays **server-side only** (not sent to frontend)
- ✅ `.env.example` is public (template only, no real keys)

**Never:**
- ❌ Share your `.env` file
- ❌ Commit `.env` to Git
- ❌ Push API key to GitHub
- ❌ Post API key in issues/comments

---

## 📝 Using in Your Code

Your server automatically uses the `.env` key:

**In `server.js`:**
```javascript
const AFTERSHIP_API_KEY = process.env.AFTERSHIP_API_KEY;
```

**You don't need to do anything!** It's loaded automatically by dotenv.

---

## 🧪 Test Your Setup

### Quick Test:

1. **Start server:**
   ```bash
   npm run server
   ```

2. **In another terminal, test the API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **You should see:**
   ```json
   {
     "status": "ok",
     "timestamp": "2024-05-25T...",
     "airlines": 40,
     "aftership": "✅ Configured"
   }
   ```

If you see `"aftership": "✅ Configured"`, you're all set! 🚀

---

## 📞 Troubleshooting

### Problem: "AfterShip: ⚠️ NOT CONFIGURED"

**Solution:**
1. Check `.env` file exists in project root
2. Check it has: `AFTERSHIP_API_KEY=sk_xxxxx`
3. Restart server: `Ctrl+C`, then `npm run server`

### Problem: "Invalid API key"

**Solution:**
1. Visit: https://www.aftership.com/api
2. Verify your API key is correct
3. Copy/paste it again (avoid spaces)
4. Make sure it starts with `sk_`

### Problem: "Too many requests"

**Solution:**
- Free tier: 100 trackings/month
- You've used all 100, wait until next month OR
- Upgrade to paid plan at https://www.aftership.com/pricing

### Problem: "AWB not found"

**Solution:**
- Normal! AfterShip will fallback to web scraping
- The app still works, just using a different data source
- Check console for fallback logs

---

## 💡 Pro Tips

### 1. Keep API Key Safe
Only share `.env.example` (without real keys):
```env
AFTERSHIP_API_KEY=sk_YOUR_API_KEY_HERE  # ← Template
```

### 2. Monitor Usage
Visit https://www.aftership.com/dashboard to see:
- How many trackings you've used
- When you hit the limit
- Your API usage stats

### 3. Use Different Keys
You can create multiple API keys:
- One for development
- One for production
- One for testing
- Manage them at: https://www.aftership.com/api

### 4. Rotate Keys Regularly
For security, generate new keys every 6 months:
1. Go to Settings → API Keys
2. Generate new key
3. Update your `.env`
4. Delete old key

---

## 🎯 Done!

You should now have:
- ✅ AfterShip account created
- ✅ API key in `.env` file
- ✅ Server recognizing the key
- ✅ Ready to track real AWBs!

**Next: Start tracking!**
```bash
npm run server
npm run dev
# Go to http://localhost:5173
# Enter a real AWB and search!
```
