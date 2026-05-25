# ✅ AfterShip Integration Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Your AfterShip API Key
1. Visit: https://www.aftership.com/sign-up
2. Create a **free account** (email + password)
3. Go to **Dashboard → Settings → API Keys**
4. Copy your API Key (format: `sk_xxxxxxxxx`)

**Free tier includes:** 100 trackings/month (perfect for testing!)

### Step 2: Add API Key to `.env`
Edit the `.env` file in the project root:

```env
# Replace YOUR_API_KEY with your actual AfterShip API key
AFTERSHIP_API_KEY=sk_YOUR_API_KEY_HERE
AFTERSHIP_TIMEOUT=15000
CACHE_TTL=3600000

NODE_ENV=development
PORT=3001
```

### Step 3: Run the Server
```bash
npm run server
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║         🛫 AeroTrack Proxy Server Running             ║
║         📡 http://localhost:3001                      ║
║   🌐 AfterShip: ✅ ENABLED                             ║
║   🔄 Cache TTL: 1 hour                                 ║
╚════════════════════════════════════════════════════════╝
```

### Step 4: Test Real AWB Tracking

**In a new terminal:**
```bash
npm run dev
```

Then open http://localhost:5173 and try tracking a **real AWB number**:

#### Test AWBs (for demo):
- **1234567890** - Test number (most carriers will recognize format)
- **Track any real AWB** - It will query AfterShip for live data!

### How It Works

#### Priority Order:
1. **🔄 Cache** (1 hour) - Instant response if already searched
2. **📡 AfterShip API** - Real-time data from 1000+ carriers
3. **🔍 Web Scraper** - Fallback to airline website scraping
4. **🔗 Carrier Redirect** - Direct link to carrier's tracking page

#### What You'll See:
- ✅ `[AfterShip] ✅ Found tracking data` → Live data from AfterShip
- ⚡ `[Track] ⚡ Returning cached data` → From cache (fast!)
- 🔄 `[Track] 🔄 AfterShip failed, attempting web scraper...` → Fallback
- ⚠️ `[Track] ⚠️ All sources failed` → Redirect to carrier website

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AFTERSHIP_API_KEY` | Required | Your AfterShip API key |
| `AFTERSHIP_TIMEOUT` | 15000 | Request timeout in ms |
| `CACHE_TTL` | 3600000 | Cache time-to-live (1 hour) |
| `NODE_ENV` | development | Environment mode |
| `PORT` | 3001 | Server port |

---

## Features

### ✨ Real-Time Tracking
- Query 1000+ carriers via AfterShip
- Live checkpoint updates
- Status mapping (Pending, In Transit, Delivered, etc.)

### ⚡ Smart Caching
- 1-hour cache prevents duplicate API calls
- Instant results for repeated searches
- Configurable TTL in `.env`

### 🔄 Fallback Chain
- **No data from AfterShip?** → Try web scraping
- **Web scraper fails?** → Show carrier website link
- **All fails?** → Universal fallback to Track-Trace.com

### 📊 Detailed Logging
```
[AfterShip] Querying for AWB: 1234567890
[AfterShip] ✅ Found tracking data | Status: Delivered | Events: 5
[Track] ⏱️  Request timeout
[Track] 📡 Attempting AfterShip API...
```

---

## Pricing

**Free Tier:** 100 trackings/month
**Paid:** $0.02 per tracking after free tier
**API Limits:** 100 requests/second

For your app size, **free tier is usually enough!**

---

## API Response Format

### Success Response (AfterShip)
```json
{
  "success": true,
  "source": "aftership",
  "data": {
    "awb": "1234567890",
    "carrier": "FedEx",
    "carrierCode": "FDX",
    "status": "Delivered",
    "origin": "New York, USA",
    "destination": "Los Angeles, USA",
    "events": [
      {
        "time": "2024-05-25 14:30:00",
        "location": "Los Angeles, CA",
        "status": "Delivered",
        "details": "United States",
        "type": "check-circle",
        "completed": true
      }
    ],
    "estimatedDelivery": "2024-05-25 14:30:00"
  },
  "carrierUrl": "https://...",
  "carrierName": "FedEx"
}
```

### Cache Hit Response
```json
{
  "success": true,
  "source": "cache",
  "data": { /* ... */ }
}
```

### Fallback Response
```json
{
  "success": false,
  "source": "redirect",
  "message": "...",
  "carrierUrl": "https://...",
  "data": { /* partial data */ }
}
```

---

## Troubleshooting

### ⚠️ "AFTERSHIP_API_KEY not set in .env"
**Fix:** Create `.env` file with your API key (see Step 2 above)

### ❌ "Invalid API key"
**Fix:** Check that your API key is correct in `.env`
- Visit https://www.aftership.com/api to verify
- Make sure the key starts with `sk_`

### 🔄 "Request timeout"
**Fix:** Either:
- Increase `AFTERSHIP_TIMEOUT` in `.env` (e.g., 20000)
- Check your internet connection
- Check if AfterShip API is up: https://www.aftership.com/status

### 📦 "AWB not found on AfterShip"
**Fix:** This is normal! AfterShip will fallback to web scraping
- Check that AWB format is correct (11 digits, 3-digit prefix)
- The shipment might be too old (AfterShip keeps 90 days)

---

## Next Steps

### Monitor Performance
Check server console for cache hit rates:
```
[Track] ⚡ Returning cached data (60 min cache)  // Cache hit!
[Track] 📡 Attempting AfterShip API...            // Cache miss
```

### Upgrade to Paid Plan
When you hit 100/month limit:
1. Go to https://www.aftership.com/pricing
2. Choose your plan (starts at $0.02/tracking)
3. No code changes needed!

### Add More Features
- **Webhooks:** Get notified when status changes
- **Batch Tracking:** Track multiple AWBs at once
- **Analytics:** Monitor tracking performance

---

## Support

- **AfterShip Docs:** https://www.aftership.com/api
- **API Status:** https://www.aftership.com/status
- **Pricing:** https://www.aftership.com/pricing
