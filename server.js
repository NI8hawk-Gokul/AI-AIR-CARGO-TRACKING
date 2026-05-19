import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getCarrierInfo, extractPrefix, buildTrackingUrl, buildFallbackTrackingUrl } from './airlinePrefixes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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
 * Main tracking endpoint. Attempts to scrape real tracking data.
 * Always returns carrier info and direct tracking URL regardless of scrape success.
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

    console.log(`[Track] AWB: ${awb} | Carrier: ${carrierInfo.name} | Attempting scrape...`);

    // Try scraping the carrier's tracking page
    const scrapedData = await scrapeCarrierPage(carrierInfo, awb);

    if (scrapedData && scrapedData.events.length > 0) {
      console.log(`[Track] ✅ Scraped ${scrapedData.events.length} events from ${carrierInfo.name}`);
      return res.json({
        success: true,
        source: 'carrier_scrape',
        data: {
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
          flight: carrierInfo.code + ' —',
        },
        carrierUrl: trackingUrlInfo?.url,
        carrierName: carrierInfo.name,
        fallbackUrl
      });
    }

    // Scraping failed - return carrier info with tracking URLs
    console.log(`[Track] ⚠️ Could not scrape ${carrierInfo.name}. Returning carrier redirect.`);
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
      }
    });
  } catch (err) {
    console.error('[Track] Error:', err.message);
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
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), airlines: 40 });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   🛫  AeroTrack Proxy Server Running        ║');
  console.log(`  ║   📡  http://localhost:${PORT}                  ║`);
  console.log('  ║   🔗  /api/track/:awb  → Track shipment     ║');
  console.log('  ║   📋  /api/carrier/:awb → Carrier lookup     ║');
  console.log('  ║   💚  /api/health       → Health check       ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
