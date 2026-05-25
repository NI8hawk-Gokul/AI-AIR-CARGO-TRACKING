# 🎯 What You'll See When Tracking

## When Running `npm run server`

### ✅ With Valid API Key:
```
  ╔════════════════════════════════════════════════════════╗
  ║         🛫 AeroTrack Proxy Server Running             ║
  ║         📡 http://localhost:3001                      ║
  ║                                                        ║
  ║   API Endpoints:                                       ║
  ║   🔗 /api/track/:awb     → Track shipment (with cache) ║
  ║   📋 /api/carrier/:awb   → Carrier lookup              ║
  ║   💚 /api/health         → Health check                ║
  ║                                                        ║
  ║   🌐 AfterShip: ✅ ENABLED                             ║
  ║   🔄 Cache TTL: 1 hour                                 ║
  ║   📊 Fallback: Web Scraping + Carrier Redirect        ║
  ╚════════════════════════════════════════════════════════╝
```

### ❌ Without API Key (Will Still Work with Fallbacks):
```
⚠️  WARNING: AFTERSHIP_API_KEY not set in .env - AfterShip tracking will be skipped

  ╔════════════════════════════════════════════════════════╗
  ║   🌐 AfterShip: ⚠️ NOT CONFIGURED (set AFTERSHIP_API_KEY)│
  ╚════════════════════════════════════════════════════════╝
```

---

## Console Logs When Tracking an AWB

### 📡 Successful AfterShip Response (Real Data):
```
[Track] 🔍 AWB: 1234567890 | Carrier: FedEx

[Track] 📡 Attempting AfterShip API...
[AfterShip] Querying for AWB: 1234567890
[AfterShip] ✅ Found tracking data | Status: Delivered | Events: 5

Response sent to frontend ✨
```

### ⚡ Cache Hit (Instant):
```
[Track] 🔍 AWB: 1234567890 | Carrier: FedEx

[Track] ⚡ Returning cached data (60 min cache)

Response sent to frontend instantly ⚡
```

### 🔄 Fallback to Web Scraping:
```
[Track] 🔍 AWB: 123-456789 | Carrier: Qatar Airways

[Track] 📡 Attempting AfterShip API...
[AfterShip] Error: Network timeout
[Track] 🔄 AfterShip failed, attempting web scraper...
[Scraper] Successfully scraped 3 events from Qatar Airways

Response sent to frontend ✓
```

### 🔗 All Failed - Redirect:
```
[Track] 🔍 AWB: 999-999999 | Carrier: Unknown

[Track] 📡 Attempting AfterShip API...
[AfterShip] Error: AWB not found
[Track] 🔄 AfterShip failed, attempting web scraper...
[Scraper] Failed: Could not extract tracking data
[Track] ⚠️  All sources failed. Redirecting to carrier website.

Response sent with carrier.com redirect link 🔗
```

---

## Frontend Display

### When AfterShip Returns Data (Best Case ✨):

```
┌─────────────────────────────────────────────────────────┐
│  🛫 Live from Carrier                    [Live tracking] │
│                                                         │
│  1234567890                                             │
│  🟢 Delivered • FedEx • Expected: May 25, 2024 2:30 PM │
│                                                         │
│  Origin: New York, USA                                  │
│  Destination: Los Angeles, USA                          │
│  Weight: 2.5 Kg                  Pieces: 1              │
│                                                         │
│  ─── TIMELINE ─────────────────────────────────────────│
│                                                         │
│  📍 May 25 • 14:30                                      │
│     Delivered in Los Angeles, CA                        │
│     United States | 1 Pcs | 2.5 Kg                      │
│                                                         │
│  📍 May 25 • 10:15                                      │
│     Out for Delivery                                    │
│     Los Angeles, CA | United States                     │
│                                                         │
│  📍 May 24 • 22:45                                      │
│     In Transit                                          │
│     Hub in Chicago | United States                      │
│                                                         │
│  📦 May 23 • 09:00                                      │
│     Picked up from Shipper                              │
│     New York, USA                                       │
│                                                         │
│  [Download PDF] [Email] [Track on FedEx]               │
│                 [Track-Trace.com]                       │
└─────────────────────────────────────────────────────────┘
```

### When Using Mock Data (Cache Hit ⚡):

```
Same display but with "📦 Local Record" badge
Shows same professional timeline
Instant response (from cache)
```

### When Fallback to Carrier Website (🔗):

```
┌─────────────────────────────────────────────────────────┐
│  🔗 Carrier Redirect                                    │
│                                                         │
│  123-456789                                             │
│  🟡 Check Carrier Website                               │
│                                                         │
│  ⚠️ We identified this as a Qatar Airways shipment      │
│  but couldn't fetch live data. Use the direct tracking  │
│  link below.                                            │
│                                                         │
│  [Track on Qatar Airways] [Track-Trace.com]             │
│                                                         │
│  Need more details? Track directly on the carrier's     │
│  official website for the most accurate updates.        │
└─────────────────────────────────────────────────────────┘
```

---

## API Response Examples

### Success Response (Fresh from AfterShip):
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
        "time": "5/25/2024, 2:30:00 PM",
        "location": "Los Angeles, CA",
        "status": "Delivered",
        "details": "United States",
        "type": "check-circle",
        "completed": true
      },
      {
        "time": "5/25/2024, 10:15:00 AM",
        "location": "Los Angeles, CA",
        "status": "Out for Delivery",
        "details": "United States",
        "type": "plane",
        "completed": true
      }
    ],
    "weight": "N/A",
    "pieces": "N/A",
    "estimatedDelivery": "N/A",
    "flight": "N/A"
  },
  "carrierUrl": "https://tracking.fedex.com/tracking?statproesscheck=&appType=wcc&cntry_code=us&locale=en_US&tracknumbers=1234567890",
  "carrierName": "FedEx"
}
```

### Cache Hit Response:
```json
{
  "success": true,
  "source": "cache",
  "data": {
    "awb": "1234567890",
    "carrier": "FedEx",
    "status": "Delivered",
    ...
  },
  "carrierUrl": "https://..."
}
```

### Fallback Response:
```json
{
  "success": false,
  "source": "redirect",
  "message": "We identified this as a FedEx shipment but couldn't fetch live data. Use the direct tracking link below.",
  "carrierUrl": "https://tracking.fedex.com/...",
  "carrierName": "FedEx",
  "data": {
    "awb": "1234567890",
    "status": "Check Carrier Website",
    "origin": "N/A",
    "destination": "N/A"
  }
}
```

---

## Debugging Tips

### See which source is being used:
Look for `source` field:
- `"source": "aftership"` → Live from AfterShip ✨
- `"source": "cache"` → From 1-hour cache ⚡
- `"source": "carrier_scrape"` → Scraped from website 🔍
- `"source": "redirect"` → Showing carrier link 🔗

### Check console for timing:
```
[Track] 📡 Attempting AfterShip API...  // Start
[AfterShip] ✅ Found tracking data     // Success (usually ~1-2s)
[Track] 📡 Attempting AfterShip API...  // Start
[AfterShip] Error: timeout              // Timeout (then fallback)
```

### Monitor cache performance:
```
[Track] ⚡ Returning cached data (60 min cache)  // Cache hit! ✨
[Track] 📡 Attempting AfterShip API...            // Cache miss 📡
```

---

## Testing Checklist

After setting up, test these scenarios:

- [ ] ✅ Real AWB with AfterShip (see live data)
- [ ] ⚡ Same AWB twice (check cache hit)
- [ ] 🔍 Unknown AWB (see fallback)
- [ ] 🔗 Old AWB (see redirect)
- [ ] 🌐 Internet off (see carrier redirect)
- [ ] 📊 Check console logs for source attribution
- [ ] 🎯 Download PDF (should work)
- [ ] 📧 Send Email (should work)
- [ ] 🔗 Click carrier button (should open website)

---

## Need Real AWBs to Test?

Try these resources:
- **Shopifly:** https://www.shopifly.com (has real tracking examples)
- **Your own shipments:** Use a real AWB you're expecting
- **Test AWBs:** AfterShip has sample AWBs in their docs
- **Friends/family:** Ask for tracking numbers from recent orders

Once you enter real AWBs, you'll see live data! 🚀
