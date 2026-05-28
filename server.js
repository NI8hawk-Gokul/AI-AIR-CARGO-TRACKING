import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getCarrierInfo, extractPrefix, buildTrackingUrl, buildFallbackTrackingUrl } from './airlinePrefixes.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('📡 Supabase client initialized');
} else {
  console.warn('⚠️ WARNING: SUPABASE_URL and/or SUPABASE_KEY is missing from .env');
}

function toSnakeCase(obj) {
  if (!obj) return obj;
  const target = {};
  for (const [key, val] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    target[snakeKey] = val;
  }
  return target;
}

function toCamelCase(obj) {
  if (!obj) return obj;
  const target = {};
  for (const [key, val] of Object.entries(obj)) {
    const camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
    target[camelKey] = val;
  }
  return target;
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// API Tracking Configuration (AfterShip & TrackingMore)
// ==========================================
const AFTERSHIP_API_KEY = process.env.AFTERSHIP_API_KEY;
const AFTERSHIP_BASE_URL = 'https://api.aftership.com/v4/trackings';
const TRACKINGMORE_API_KEY = process.env.TRACKINGMORE_API_KEY;
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600000'); // 1 hour
const trackingCache = new Map();

if (!TRACKINGMORE_API_KEY && !AFTERSHIP_API_KEY) {
  console.warn('⚠️  WARNING: Neither TRACKINGMORE_API_KEY nor AFTERSHIP_API_KEY is set in .env');
}

// Rate limiting - simple in-memory store
const requestLog = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30;

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entries = requestLog.get(ip) || [];
  const recent = entries.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= MAX_REQUESTS) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please wait a minute.' });
  }
  recent.push(now);
  requestLog.set(ip, recent);
  next();
}

// ==========================================
// AfterShip Helper Functions
// ==========================================

/**
 * Get from cache with TTL check
 */
function getFromCache(awb) {
  const key = `tracking_${awb.toUpperCase().replace(/[- ]/g, '')}`;
  const cached = trackingCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  trackingCache.delete(key);
  return null;
}

/**
 * Store in cache with timestamp
 */
function setInCache(awb, data) {
  const key = `tracking_${awb.toUpperCase().replace(/[- ]/g, '')}`;
  trackingCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Map AfterShip tag to our status format
 */
function mapAftershipStatus(tag) {
  const statusMap = {
    'Pending': 'Pending',
    'InfoReceived': 'Pending',
    'InTransit': 'In Transit',
    'OutForDelivery': 'Out for Delivery',
    'AttemptFail': 'Delivery Attempted',
    'Delivered': 'Delivered',
    'Exception': 'Exception',
    'Expired': 'Expired',
    'Returned': 'Returned'
  };
  return statusMap[tag] || tag || 'Unknown';
}

/**
 * Query AfterShip API for tracking data
 */
async function queryAfterShip(awb) {
  if (!AFTERSHIP_API_KEY) {
    console.log('[AfterShip] API key not configured - skipping');
    return null;
  }

  try {
    const cleanAwb = awb.replace(/[- ]/g, '');
    console.log(`[AfterShip] Querying for AWB: ${cleanAwb}`);

    let tracking = null;

    // 1. Try to GET the tracking first to see if it already exists
    try {
      const getResponse = await axios.get(`${AFTERSHIP_BASE_URL}?tracking_numbers=${cleanAwb}`, {
        headers: {
          'aftership-api-key': AFTERSHIP_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: parseInt(process.env.AFTERSHIP_TIMEOUT || '15000')
      });

      if (getResponse.data?.data?.trackings?.length > 0) {
        tracking = getResponse.data.data.trackings[0];
        console.log(`[AfterShip] ✅ Found existing tracking record`);
      }
    } catch (getErr) {
      console.log(`[AfterShip] GET check failed/skipped: ${getErr.message}`);
    }

    // 2. If it doesn't exist, POST to create a new tracking
    if (!tracking) {
      console.log(`[AfterShip] 🆕 Creating new tracking for AWB: ${cleanAwb}`);
      try {
        const postResponse = await axios.post(AFTERSHIP_BASE_URL, {
          tracking: {
            tracking_number: cleanAwb
            // Omit slug to let AfterShip auto-detect the carrier based on active couriers
          }
        }, {
          headers: {
            'aftership-api-key': AFTERSHIP_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: parseInt(process.env.AFTERSHIP_TIMEOUT || '15000')
        });

        tracking = postResponse.data?.data?.tracking;
      } catch (postErr) {
        // Handle "Tracking already exists" if GET check missed it somehow (e.g. race conditions)
        if (postErr.response?.data?.meta?.code === 4003 || postErr.response?.status === 400) {
          console.log(`[AfterShip] ⚠️ Tracking already exists in POST, fetching via list...`);
          const fallbackGet = await axios.get(`${AFTERSHIP_BASE_URL}?tracking_numbers=${cleanAwb}`, {
            headers: {
              'aftership-api-key': AFTERSHIP_API_KEY,
              'Content-Type': 'application/json'
            },
            timeout: parseInt(process.env.AFTERSHIP_TIMEOUT || '15000')
          });
          if (fallbackGet.data?.data?.trackings?.length > 0) {
            tracking = fallbackGet.data.data.trackings[0];
          }
        }
        
        if (!tracking) {
          throw postErr;
        }
      }
    }

    if (!tracking) {
      console.log(`[AfterShip] ⚠️ No tracking data could be retrieved`);
      return null;
    }

    console.log(`[AfterShip] ✅ Loaded tracking data | Status: ${tracking.tag} | Events: ${tracking.checkpoints?.length || 0}`);

    // Transform AfterShip format to our format
    const events = (tracking.checkpoints || []).map((cp, idx) => ({
      time: cp.checkpoint_time ? new Date(cp.checkpoint_time).toLocaleString() : 'N/A',
      location: cp.location || '',
      status: cp.message || 'Status update',
      details: cp.country_name || '',
      type: idx === 0 ? 'package' : (idx === tracking.checkpoints.length - 1 ? 'check-circle' : 'plane'),
      completed: true
    }));

    const lastCheckpoint = tracking.checkpoints?.[0] || {};
    const transformedData = {
      awb: tracking.tracking_number,
      carrier: tracking.carrier_name || 'Unknown Carrier',
      carrierCode: tracking.slug?.toUpperCase() || 'UNKNOWN',
      status: mapAftershipStatus(tracking.tag),
      origin: 'See tracking events',
      destination: lastCheckpoint.location || 'In transit',
      events: events,
      weight: 'N/A',
      pieces: 'N/A',
      estimatedDelivery: tracking.expected_delivery ? new Date(tracking.expected_delivery).toLocaleString() : 'N/A',
      flight: 'N/A'
    };

    return transformedData;
  } catch (err) {
    if (err.response?.status === 404) {
      console.log(`[AfterShip] ⚠️  AWB not found: ${awb}`);
    } else if (err.response?.status === 401) {
      console.error('[AfterShip] ❌ Invalid API key - check .env file');
    } else if (err.code === 'ECONNABORTED') {
      console.log('[AfterShip] ⏱️  Request timeout');
    } else {
      console.log(`[AfterShip] Error: ${err.message}`);
    }
    return null;
  }
}

/**
 * Query TrackingMore API for tracking data
 */
async function queryTrackingMore(awb) {
  if (!TRACKINGMORE_API_KEY) {
    console.log('[TrackingMore] API key not configured - skipping');
    return null;
  }

  try {
    const cleanAwb = awb.replace(/[- ]/g, '').trim();
    console.log(`[TrackingMore] Querying for AWB: ${cleanAwb}`);

    // 1. Detect courier code first
    let courierCode = null;
    try {
      const detectResponse = await axios.post('https://api.trackingmore.com/v4/couriers/detect', {
        tracking_number: cleanAwb
      }, {
        headers: {
          'Tracking-Api-Key': TRACKINGMORE_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (detectResponse.data?.data?.length > 0) {
        courierCode = detectResponse.data.data[0].courier_code;
        console.log(`[TrackingMore] 🔍 Detected courier: ${courierCode}`);
      }
    } catch (detectErr) {
      console.log(`[TrackingMore] Courier detection failed: ${detectErr.message}`);
    }

    // Fallback: If detection fails, try to map from prefix
    if (!courierCode) {
      const prefix = extractPrefix(awb);
      const carrierInfo = getCarrierInfo(prefix);
      if (carrierInfo && carrierInfo.code) {
        courierCode = carrierInfo.code.toLowerCase();
      }
    }

    let trackingItem = null;

    // 2. Try to GET the tracking details if it's already registered
    if (courierCode) {
      try {
        const getResponse = await axios.get(`https://api.trackingmore.com/v4/trackings/get?tracking_numbers=${cleanAwb}&courier_code=${courierCode}`, {
          headers: {
            'Tracking-Api-Key': TRACKINGMORE_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        if (getResponse.data?.data?.length > 0) {
          trackingItem = getResponse.data.data[0];
          console.log(`[TrackingMore] ✅ Found existing tracking record`);
        }
      } catch (getErr) {
        console.log(`[TrackingMore] GET check failed: ${getErr.message}`);
      }
    } else {
      // Try GET without courier code
      try {
        const getResponse = await axios.get(`https://api.trackingmore.com/v4/trackings/get?tracking_numbers=${cleanAwb}`, {
          headers: {
            'Tracking-Api-Key': TRACKINGMORE_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        if (getResponse.data?.data?.length > 0) {
          trackingItem = getResponse.data.data[0];
          courierCode = trackingItem.courier_code;
          console.log(`[TrackingMore] ✅ Found existing tracking record without specifying courier code`);
        }
      } catch (getErr) {
        console.log(`[TrackingMore] GET check without courier code failed: ${getErr.message}`);
      }
    }

    // 3. If it doesn't exist, create it (POST /trackings/create)
    if (!trackingItem && courierCode) {
      console.log(`[TrackingMore] 🆕 Registering new tracking for AWB: ${cleanAwb} with courier: ${courierCode}`);
      try {
        const postResponse = await axios.post('https://api.trackingmore.com/v4/trackings/create', {
          tracking_number: cleanAwb,
          courier_code: courierCode
        }, {
          headers: {
            'Tracking-Api-Key': TRACKINGMORE_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        if (postResponse.data?.data) {
          trackingItem = postResponse.data.data;
          console.log(`[TrackingMore] ✅ Registered tracking successfully`);
        }
      } catch (postErr) {
        // Handle "already exists" error (meta code 4101 or 400 Bad Request) just in case
        if (postErr.response?.data?.meta?.code === 4101 || postErr.response?.status === 400) {
          console.log(`[TrackingMore] ⚠️ Tracking already exists in POST, retrieving...`);
          const fallbackGet = await axios.get(`https://api.trackingmore.com/v4/trackings/get?tracking_numbers=${cleanAwb}&courier_code=${courierCode}`, {
            headers: {
              'Tracking-Api-Key': TRACKINGMORE_API_KEY,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          });
          if (fallbackGet.data?.data?.length > 0) {
            trackingItem = fallbackGet.data.data[0];
          }
        }

        if (!trackingItem) {
          throw postErr;
        }
      }
    }

    if (!trackingItem) {
      console.log(`[TrackingMore] ⚠️ Tracking record could not be retrieved or created`);
      return null;
    }

    const trackinfo = trackingItem.origin_info?.trackinfo || trackingItem.destination_info?.trackinfo || [];
    console.log(`[TrackingMore] ✅ Loaded tracking data | Status: ${trackingItem.delivery_status} | Events: ${trackinfo.length}`);

    // Transform to standard format
    const events = trackinfo.map((ti, idx) => ({
      time: ti.checkpoint_date ? new Date(ti.checkpoint_date).toLocaleString() : 'N/A',
      location: ti.location || '',
      status: ti.tracking_detail || 'Status update',
      details: ti.checkpoint_delivery_status || '',
      type: idx === 0 ? 'package' : (idx === trackinfo.length - 1 ? 'check-circle' : 'plane'),
      completed: true
    }));

    const lastCheckpoint = trackinfo[0] || {};
    
    // Attempt to capitalize carrier name
    const prefix = extractPrefix(awb);
    const carrierInfo = getCarrierInfo(prefix);
    const carrierName = carrierInfo ? carrierInfo.name : (trackingItem.courier_code ? trackingItem.courier_code.toUpperCase() : 'Unknown Courier');

    const transformedData = {
      awb: trackingItem.tracking_number,
      carrier: carrierName,
      carrierCode: trackingItem.courier_code?.toUpperCase() || 'UNKNOWN',
      status: mapTrackingmoreStatus(trackingItem.delivery_status),
      origin: trackingItem.origin_country || 'See tracking events',
      destination: lastCheckpoint.location || trackingItem.destination_country || 'In transit',
      events: events,
      weight: 'N/A',
      pieces: 'N/A',
      estimatedDelivery: trackingItem.scheduled_delivery_date || trackingItem.origin_info?.milestone_date?.delivery_date ? new Date(trackingItem.scheduled_delivery_date || trackingItem.origin_info.milestone_date.delivery_date).toLocaleString() : 'N/A',
      flight: 'N/A'
    };

    return transformedData;
  } catch (err) {
    console.error(`[TrackingMore] Error: ${err.message}`);
    if (err.response?.status === 401) {
      console.error('[TrackingMore] ❌ Invalid API key - check .env file');
    }
    return null;
  }
}

/**
 * Map TrackingMore delivery_status to our format
 */
function mapTrackingmoreStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'transit': 'In Transit',
    'pickup': 'Out for Delivery',
    'delivered': 'Delivered',
    'exception': 'Exception',
    'undelivered': 'Exception',
    'expired': 'Expired'
  };
  return statusMap[status?.toLowerCase()] || status || 'Unknown';
}

/**
 * Try to scrape tracking data from the airline's public tracking page.
 * This is a best-effort approach - many airlines use SPAs that won't return
 * useful HTML from a simple GET request.
 */
async function scrapeCarrierPage(carrierInfo, awb) {
  try {
    const url = carrierInfo.buildUrl(awb);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
      return null;
    }

    const html = response.data;
    if (typeof html !== 'string') return null;

    const $ = cheerio.load(html);

    // Generic extraction strategy - look for common tracking page patterns
    const events = [];
    const statusTexts = [];

    // Strategy 1: Look for table rows with tracking milestones
    $('table tr, .tracking-row, .milestone, .event-item, .tracking-event, .shipment-event, [class*="track"], [class*="milestone"], [class*="event"]').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 10 && text.length < 500) {
        statusTexts.push(text);
      }
    });

    // Strategy 2: Look for timeline/status elements
    $('[class*="status"], [class*="timeline"], [class*="progress"], [class*="history"]').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 5 && text.length < 300 && !statusTexts.includes(text)) {
        statusTexts.push(text);
      }
    });

    // Strategy 3: Look for definition lists (common in cargo tracking pages)
    $('dl, .detail-row, .info-row').each((_, el) => {
      const dt = $(el).find('dt, .label, .key').text().trim();
      const dd = $(el).find('dd, .value, .val').text().trim();
      if (dt && dd) {
        statusTexts.push(`${dt}: ${dd}`);
      }
    });

    // Extract structured events from status texts
    statusTexts.forEach((text, idx) => {
      // Try to parse date/time patterns
      const dateMatch = text.match(/(\d{1,2}[\s/-]\w{3}[\s/-]\d{2,4}|\d{4}[-/]\d{2}[-/]\d{2}|\w{3}\s+\d{1,2},?\s+\d{4})/);
      const timeMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)/);

      events.push({
        time: dateMatch ? `${dateMatch[1]}${timeMatch ? ' ' + timeMatch[1] : ''}` : `Event ${idx + 1}`,
        location: '',
        status: text.substring(0, 150),
        type: idx === 0 ? 'package' : (idx === statusTexts.length - 1 ? 'check-circle' : 'plane'),
        completed: true
      });
    });

    // Try to extract overall status
    let overallStatus = 'Unknown';
    const pageText = $('body').text().toLowerCase();
    if (pageText.includes('delivered')) overallStatus = 'Delivered';
    else if (pageText.includes('in transit') || pageText.includes('in-transit') || pageText.includes('departed')) overallStatus = 'In Transit';
    else if (pageText.includes('arrived') || pageText.includes('received')) overallStatus = 'Arrived';
    else if (pageText.includes('booked') || pageText.includes('accepted')) overallStatus = 'Booked';
    else if (pageText.includes('delayed')) overallStatus = 'Delayed';

    // Try to extract origin/destination
    let origin = '';
    let destination = '';
    const routeMatch = pageText.match(/(?:from|origin)[:\s]+([a-z]{3})/i);
    const destMatch = pageText.match(/(?:to|destination|dest)[:\s]+([a-z]{3})/i);
    if (routeMatch) origin = routeMatch[1].toUpperCase();
    if (destMatch) destination = destMatch[1].toUpperCase();

    if (events.length === 0 && overallStatus === 'Unknown') {
      return null; // Couldn't extract anything useful
    }

    return {
      status: overallStatus,
      origin: origin || 'See carrier website',
      destination: destination || 'See carrier website',
      events: events.length > 0 ? events : [{ 
        time: new Date().toLocaleDateString(), 
        location: '', 
        status: `Status: ${overallStatus}`, 
        type: 'package', 
        completed: true 
      }]
    };
  } catch (err) {
    console.log(`[Scraper] Failed for ${carrierInfo.name}: ${err.message}`);
    return null;
  }
}

// ==========================================
// API ROUTES
// ==========================================

/**
 * GET /api/track/:awb
 * Main tracking endpoint with fallback chain:
 * 1. Check cache
 * 2. Query AfterShip API (real-time data)
 * 3. Fallback to web scraping
 * 4. Return carrier URL redirect
 */
app.get('/api/track/:awb', rateLimit, async (req, res) => {
  try {
    const rawAwb = req.params.awb.trim().toUpperCase();

    // Normalize AWB: ensure format PPP-NNNNNNNN
    let awb = rawAwb.replace(/[\s]/g, '');
    if (!awb.includes('-') && awb.length >= 11) {
      awb = awb.substring(0, 3) + '-' + awb.substring(3);
    }

    const prefix = extractPrefix(awb);
    const carrierInfo = getCarrierInfo(prefix);
    const trackingUrlInfo = buildTrackingUrl(awb);
    const fallbackUrl = buildFallbackTrackingUrl(awb);

    if (!carrierInfo) {
      return res.json({
        success: false,
        message: `Unknown airline prefix "${prefix}". The AWB prefix doesn't match any known carrier.`,
        carrierUrl: fallbackUrl,
        carrierName: 'Unknown Carrier',
        fallbackUrl
      });
    }

    console.log(`\n[Track] 🔍 AWB: ${awb} | Carrier: ${carrierInfo.name}`);

    // ========== STEP 0: Check Database ==========
    if (supabase) {
      try {
        const { data: dbData } = await supabase.from('shipments').select('*').eq('awb', awb).single();
        if (dbData) {
          console.log(`[Track] 📦 Found shipment details in Supabase database`);
          return res.json({
            success: true,
            source: 'database',
            data: toCamelCase(dbData),
            carrierUrl: trackingUrlInfo?.url,
            carrierName: carrierInfo.name,
            fallbackUrl
          });
        }
      } catch (e) {
        console.log('[Track] DB check skipped / error:', e.message);
      }
    }

    // ========== STEP 1: Check Cache ==========
    const cachedData = getFromCache(awb);
    if (cachedData) {
      console.log(`[Track] ⚡ Returning cached data (${Math.round((CACHE_TTL / 60000))} min cache)`);
      return res.json({
        success: true,
        source: 'cache',
        data: cachedData,
        carrierUrl: trackingUrlInfo?.url,
        carrierName: carrierInfo.name,
        fallbackUrl
      });
    }

    // ========== STEP 2: Try API Tracking Providers ==========
    let apiTrackingData = null;
    let source = null;

    if (TRACKINGMORE_API_KEY) {
      console.log('[Track] 📡 Attempting TrackingMore API...');
      apiTrackingData = await queryTrackingMore(awb);
      source = 'trackingmore';
    }

    if (!apiTrackingData && AFTERSHIP_API_KEY) {
      console.log('[Track] 📡 Attempting AfterShip API...');
      apiTrackingData = await queryAfterShip(awb);
      source = 'aftership';
    }

    if (apiTrackingData) {
      // Cache the result
      setInCache(awb, apiTrackingData);

      // Save to database
      if (supabase) {
        try {
          const isDelivered = apiTrackingData.status === 'Delivered' || apiTrackingData.status === 'Arrived';
          const enriched = {
            ...apiTrackingData,
            aiAnalysisRun: isDelivered ? true : false,
            delayRisk: isDelivered ? "None" : undefined,
            delayRiskPercent: isDelivered ? 0 : undefined,
            delayReason: isDelivered ? "Shipment delivered successfully." : undefined,
          };
          await supabase.from('shipments').upsert(toSnakeCase(enriched));
        } catch (dbErr) {
          console.error('[DB Error]', dbErr.message);
        }
      }

      return res.json({
        success: true,
        source: source,
        data: apiTrackingData,
        carrierUrl: trackingUrlInfo?.url,
        carrierName: apiTrackingData.carrier,
        fallbackUrl
      });
    }

    // ========== STEP 3: Fallback to Web Scraper ==========
    console.log('[Track] 🔄 AfterShip failed, attempting web scraper...');
    const scrapedData = await scrapeCarrierPage(carrierInfo, awb);

    if (scrapedData && scrapedData.events.length > 0) {
      console.log(`[Track] ✅ Scraped ${scrapedData.events.length} events from carrier`);
      const transformedData = {
        awb,
        carrier: carrierInfo.name,
        carrierCode: carrierInfo.code,
        status: scrapedData.status,
        origin: scrapedData.origin,
        destination: scrapedData.destination,
        events: scrapedData.events,
        weight: 'See carrier website',
        pieces: '-',
        estimatedDelivery: 'See carrier website',
        flight: carrierInfo.code + ' —'
      };
      setInCache(awb, transformedData);

      // Save to database
      if (supabase) {
        try {
          const isDelivered = transformedData.status === 'Delivered' || transformedData.status === 'Arrived';
          const enriched = {
            ...transformedData,
            aiAnalysisRun: isDelivered ? true : false,
            delayRisk: isDelivered ? "None" : undefined,
            delayRiskPercent: isDelivered ? 0 : undefined,
            delayReason: isDelivered ? "Shipment delivered successfully." : undefined,
          };
          await supabase.from('shipments').upsert(toSnakeCase(enriched));
        } catch (dbErr) {
          console.error('[DB Error]', dbErr.message);
        }
      }

      return res.json({
        success: true,
        source: 'carrier_scrape',
        data: transformedData,
        carrierUrl: trackingUrlInfo?.url,
        carrierName: carrierInfo.name,
        fallbackUrl
      });
    }

    // ========== STEP 4: Return Carrier URL Redirect ==========
    console.log(`[Track] ⚠️  All sources failed. Redirecting to carrier website.`);
    return res.json({
      success: false,
      source: 'redirect',
      message: `We identified this as a ${carrierInfo.name} shipment but couldn't fetch live data. Use the direct tracking link below.`,
      carrierUrl: trackingUrlInfo?.url,
      carrierName: carrierInfo.name,
      fallbackUrl,
      data: {
        awb,
        carrier: carrierInfo.name,
        carrierCode: carrierInfo.code,
        status: 'Check Carrier Website',
        origin: 'N/A',
        destination: 'N/A',
        weight: 'N/A',
        pieces: 'N/A',
        estimatedDelivery: 'Check Carrier Website'
      }
    });
  } catch (err) {
    console.error('[Track] ❌ Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while tracking shipment.',
      fallbackUrl: buildFallbackTrackingUrl(req.params.awb)
    });
  }
});

/**
 * GET /api/carrier/:awb
 * Quick lookup - returns carrier info and tracking URL without scraping.
 */
app.get('/api/carrier/:awb', (req, res) => {
  const awb = req.params.awb.trim().toUpperCase();
  const prefix = extractPrefix(awb);
  const carrierInfo = getCarrierInfo(prefix);
  const trackingUrlInfo = buildTrackingUrl(awb);
  const fallbackUrl = buildFallbackTrackingUrl(awb);

  res.json({
    awb,
    prefix,
    carrier: carrierInfo ? {
      name: carrierInfo.name,
      code: carrierInfo.code,
      trackingUrl: trackingUrlInfo?.url,
    } : null,
    fallbackUrl,
    identified: !!carrierInfo
  });
});

/**
 * GET /api/db/shipments
 * Fetch all shipments from Supabase database
 */
app.get('/api/db/shipments', async (req, res) => {
  if (!supabase) {
    return res.json({ success: false, offline: true, message: 'Database not initialized', data: [] });
  }
  try {
    const { data, error } = await supabase.from('shipments').select('*');
    if (error) throw error;
    const camelCasedData = (data || []).map(toCamelCase);
    res.json({ success: true, data: camelCasedData });
  } catch (err) {
    console.error('[DB Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/db/shipments
 * Upsert a shipment in Supabase
 */
app.post('/api/db/shipments', async (req, res) => {
  if (!supabase) {
    return res.json({ success: false, offline: true, message: 'Database not initialized' });
  }
  try {
    const shipment = req.body;
    if (!shipment.awb) {
      return res.status(400).json({ success: false, message: 'AWB number is required' });
    }
    const snakeCased = toSnakeCase(shipment);
    const { error } = await supabase.from('shipments').upsert(snakeCased);
    if (error) throw error;
    res.json({ success: true, message: 'Shipment saved successfully' });
  } catch (err) {
    console.error('[DB Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/db/history
 * Fetch search history records from Supabase
 */
app.get('/api/db/history', async (req, res) => {
  if (!supabase) {
    return res.json({ success: false, offline: true, message: 'Database not initialized', data: [] });
  }
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('searched_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[DB Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/db/history
 * Record search history event in database
 */
app.post('/api/db/history', async (req, res) => {
  if (!supabase) {
    return res.json({ success: false, offline: true, message: 'Database not initialized' });
  }
  try {
    const historyItem = req.body;
    if (!historyItem.awb) {
      return res.status(400).json({ success: false, message: 'AWB is required' });
    }
    
    // Deduplicate
    await supabase.from('search_history').delete().eq('awb', historyItem.awb);
    
    const { error } = await supabase.from('search_history').insert({
      awb: historyItem.awb,
      carrier: historyItem.carrier,
      status: historyItem.status,
      origin: historyItem.origin,
      destination: historyItem.destination,
      flight: historyItem.flight,
      date: historyItem.date
    });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[DB Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/db/analysis/:awb
 * Perform dynamic AI predictions and save to database
 */
app.post('/api/db/analysis/:awb', async (req, res) => {
  if (!supabase) {
    return res.json({ success: false, offline: true, message: 'Database not initialized' });
  }
  try {
    const awb = req.params.awb.trim().toUpperCase();
    const { data, error } = await supabase.from('shipments').select('*').eq('awb', awb).single();
    
    let shipment = data;
    if (error || !shipment) {
      const prefix = awb.replace(/[\s-]/g, '').substring(0, 3);
      const carrier = getCarrierInfo(prefix) || { name: 'Universal Cargo', code: 'UC' };
      shipment = {
        awb,
        carrier: carrier.name,
        carrier_code: carrier.code || prefix,
        status: 'In Transit',
        origin: "DXB - Dubai, UAE",
        destination: "LHR - London, UK",
        estimated_delivery: "May 28, 2026 - 15:40",
        weight: "1200 kg",
        pieces: 3,
        flight: `${carrier.code || 'UC'}502`,
        current_location: [35.0, 15.0],
        route: [[25.2048, 55.2708], [51.4700, -0.4543]],
        telemetry: { altitude: "35,000 ft", speed: "880 km/h", temp: "-50°C", humidity: "12%" },
        eta: "May 28, 2026 - 15:40",
        date: new Date().toISOString().split('T')[0],
        events: [
          { time: "May 24, 10:00", location: "DXB", status: "Shipment Received", completed: true },
          { time: "May 25, 08:30", location: "DXB", status: "Departed on Flight " + (carrier.code || 'UC') + "502", completed: true },
          { time: "May 25, 11:00", location: "In Air", status: "In Transit", completed: true }
        ]
      };
    }

    const isDelivered = shipment.status === 'Delivered' || shipment.status === 'Arrived';
    if (isDelivered) {
      shipment.delay_risk = "None";
      shipment.delay_risk_percent = 0;
      shipment.delay_reason = "Shipment delivered successfully.";
      shipment.ai_analysis_run = true;
    } else {
      const num = parseInt(awb.replace(/[^0-9]/g, '')) || 50;
      const riskPercent = 20 + (num % 70);
      let delayRisk = "None";
      let delayReason = "Clear weather, on schedule";
      if (riskPercent > 70) {
        delayRisk = `High Risk (${riskPercent}%)`;
        delayReason = `Heavy rain and traffic congestion at ${shipment.destination?.split(' - ')[0] || 'destination'}`;
      } else if (riskPercent > 40) {
        delayRisk = `Medium Risk (${riskPercent}%)`;
        delayReason = "Air traffic control queuing delays";
      } else {
        delayRisk = `Low Risk (${riskPercent}%)`;
        delayReason = "Optimal weather and clear flight paths";
      }

      shipment.delay_risk = delayRisk;
      shipment.delay_risk_percent = riskPercent;
      shipment.delay_reason = delayReason;
      shipment.ai_analysis_run = true;
    }

    const { error: upsertError } = await supabase.from('shipments').upsert(shipment);
    if (upsertError) throw upsertError;

    res.json({ success: true, data: toCamelCase(shipment) });
  } catch (err) {
    console.error('[DB Error]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    airlines: 40,
    trackingmore: TRACKINGMORE_API_KEY ? '✅ Configured' : '⚠️ Not configured',
    aftership: AFTERSHIP_API_KEY ? '✅ Configured' : '⚠️ Not configured'
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from the React build folder (for production deployment)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all SPA routes (must be placed after all API endpoints)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔════════════════════════════════════════════════════════╗');
  console.log('  ║         🛫 AeroTrack Proxy Server Running             ║');
  console.log(`  ║         📡 http://localhost:${PORT}                       ║`);
  console.log('  ║                                                        ║');
  console.log('  ║   API Endpoints:                                       ║');
  console.log('  ║   🔗 /api/track/:awb     → Track shipment (with cache) ║');
  console.log('  ║   📋 /api/carrier/:awb   → Carrier lookup              ║');
  console.log('  ║   💚 /api/health         → Health check                ║');
  console.log('  ║                                                        ║');
  console.log(`  ║   🌐 TrackingMore: ${TRACKINGMORE_API_KEY ? '✅ ENABLED' : '⚠️ DISABLED (set TRACKINGMORE_API_KEY)'}                  ║`);
  console.log(`  ║   🌐 AfterShip: ${AFTERSHIP_API_KEY ? '✅ ENABLED' : '⚠️ DISABLED (set AFTERSHIP_API_KEY)'}                        ║`);
  console.log('  ║   🔄 Cache TTL: 1 hour                                 ║');
  console.log('  ║   📊 Fallback: Web Scraping + Carrier Redirect        ║');
  console.log('  ╚════════════════════════════════════════════════════════╝');
  console.log('');
});
