import { SHIPMENT_DATA, ALL_SHIPMENTS } from '../data/shipmentData';

// Airline prefix mapping (client-side copy for URL building without server)
const AIRLINE_PREFIXES = {
  '157': { name: 'Qatar Airways Cargo', url: (awb) => `https://www.qrcargo.com/s/tracking?awb=${awb}` },
  '176': { name: 'Emirates SkyCargo', url: (awb) => `https://eskycargo.emirates.com/app/offerBooking/#/shipment-tracking?awbNo=${awb.replace('-', '')}` },
  '607': { name: 'Etihad Cargo', url: (awb) => `https://etihadcargo.com/en/e-services/track-your-shipments?awb=${awb.replace('-', '')}` },
  '098': { name: 'Air India Cargo', url: (awb) => `https://www.aikinetix.com/search?type=awb&query=${awb.replace('-', '')}` },
  '585': { name: 'IndiGo CarGo', url: (awb) => `https://www.goindigo.in/cargo/tracking.html?awb=${awb}` },
  '220': { name: 'Lufthansa Cargo', url: (awb) => `https://www.lufthansa-cargo.com/tracking/shipment/${awb.replace('-', '')}` },
  '125': { name: 'British Airways Cargo', url: (awb) => `https://www.iagcargo.com/track-shipment?awb=${awb.replace('-', '')}` },
  '117': { name: 'Turkish Airlines Cargo', url: (awb) => `https://www.turkishcargo.com/en/tracking?awb=${awb.replace('-', '')}` },
  '006': { name: 'Delta Cargo', url: (awb) => `https://www.deltacargo.com/Cargo/trackShipment?awbNumber=${awb.replace('-', '')}` },
  '016': { name: 'United Cargo', url: (awb) => `https://www.unitedcargo.com/tracking?awb=${awb.replace('-', '')}` },
  '001': { name: 'American Airlines Cargo', url: (awb) => `https://www.aacargo.com/shipping/tracking.jhtml?awb=${awb.replace('-', '')}` },
  '023': { name: 'FedEx', url: (awb) => `https://www.fedex.com/fedextrack/?trknbr=${awb.replace('-', '')}` },
  '160': { name: 'Cathay Cargo', url: (awb) => `https://www.cathaycargo.com/cargo-tracking/?awb=${awb.replace('-', '')}` },
  '205': { name: 'ANA Cargo', url: (awb) => `https://cargo.ana.co.jp/anaicargo/tracking?awb=${awb.replace('-', '')}` },
  '180': { name: 'Korean Air Cargo', url: (awb) => `https://cargo.koreanair.com/tracking?awb=${awb.replace('-', '')}` },
  '057': { name: 'Air France Cargo', url: (awb) => `https://www.afklcargo.com/mycargo/shipment/detail/${awb.replace('-', '')}` },
  '071': { name: 'Ethiopian Airlines Cargo', url: (awb) => `https://www.ethiopianairlinescargo.com/tracking?awb=${awb.replace('-', '')}` },
  '045': { name: 'LATAM Cargo', url: (awb) => `https://www.latamcargo.com/en/trackshipment?docNumber=${awb.replace('-', '')}` },
  '164': { name: 'Saudia Cargo', url: (awb) => `https://www.saudiacargo.com/tracking?awb=${awb}` },
  '047': { name: 'Cargolux', url: (awb) => `https://www.cargolux.com/e-services/tracking?awb=${awb}` },
  '014': { name: 'Air Canada Cargo', url: (awb) => `https://www.aircanadacargo.com/tracking?awb=${awb.replace('-', '')}` },
  '131': { name: 'Japan Airlines Cargo', url: (awb) => `https://www.jalcargo.com/cms/tracking?awb=${awb.replace('-', '')}` },
};

/**
 * Data Service for Dashboard, Tracking, and Reports
 */

/**
 * Extract 3-digit airline prefix from AWB
 */
function extractPrefix(awb) {
  return awb.replace(/[\s-]/g, '').substring(0, 3);
}

/**
 * Get the direct carrier tracking URL for a given AWB
 * @param {string} awb - AWB number (e.g. "157-89692853")
 * @returns {{ url: string, carrierName: string } | null}
 */
export const getCarrierTrackingUrl = (awb) => {
  const prefix = extractPrefix(awb.trim().toUpperCase());
  const carrier = AIRLINE_PREFIXES[prefix];
  if (carrier) {
    return { url: carrier.url(awb.trim().toUpperCase()), carrierName: carrier.name };
  }
  // Fallback: use track-trace.com for any unknown airline
  return {
    url: `https://www.track-trace.com/aircargo?search=${awb.replace(/[\s-]/g, '')}`,
    carrierName: 'Track-Trace (Universal)'
  };
};

/**
 * Track a shipment by AWB number.
 * 1. First checks local hardcoded data
 * 2. Then calls the backend proxy API for real tracking
 */
export const trackShipment = async (awb) => {
  const normalizedAwb = awb.trim().toUpperCase();

  // 1. Check local data first (existing shipments)
  if (SHIPMENT_DATA[normalizedAwb]) {
    const carrierUrlInfo = getCarrierTrackingUrl(normalizedAwb);
    return {
      success: true,
      source: 'local',
      data: SHIPMENT_DATA[normalizedAwb],
      carrierUrl: carrierUrlInfo.url,
      carrierName: carrierUrlInfo.carrierName,
    };
  }

  // 2. Call the backend proxy API for real tracking
  try {
    const response = await fetch(`/api/track/${encodeURIComponent(normalizedAwb)}`);
    const result = await response.json();

    // Attach carrier URL info
    const carrierUrlInfo = getCarrierTrackingUrl(normalizedAwb);
    result.carrierUrl = result.carrierUrl || carrierUrlInfo.url;
    result.carrierName = result.carrierName || carrierUrlInfo.carrierName;

    return result;
  } catch (err) {
    // Backend is down - still provide the carrier tracking URL
    const carrierUrlInfo = getCarrierTrackingUrl(normalizedAwb);
    return {
      success: false,
      source: 'offline',
      message: `Backend proxy is offline. Track directly on the carrier website.`,
      carrierUrl: carrierUrlInfo.url,
      carrierName: carrierUrlInfo.carrierName,
    };
  }
};

export const getDashboardStats = () => {
  const total = ALL_SHIPMENTS.length;
  const pending = ALL_SHIPMENTS.filter(s => s.status === 'In Transit' || s.status === 'Pending').length;
  const delayed = ALL_SHIPMENTS.filter(s => s.status === 'Delayed').length;
  const deliveredToday = ALL_SHIPMENTS.filter(s => s.status === 'Delivered' || s.status === 'Arrived').length;
  
  return {
    totalCargo: 1248 + total, // Base number + our "real" ones
    pending: 342 + pending,
    delayed: 18 + delayed,
    deliveredToday: 156 + deliveredToday
  };
};

export const getRecentShipments = (limit = 5) => {
  return ALL_SHIPMENTS.slice(0, limit).map(s => ({
    awb: s.awb,
    route: `${s.origin.split(' - ')[0]} → ${s.destination.split(' - ')[0]}`,
    status: s.status,
    color: getStatusColor(s.status)
  }));
};

export const getReportData = (filters = {}) => {
  let data = ALL_SHIPMENTS.map(s => ({
    id: s.awb,
    date: s.date,
    awb: s.awb,
    origin: s.origin.split(' - ')[0],
    dest: s.destination.split(' - ')[0],
    status: s.status
  }));

  if (filters.status && filters.status !== 'All') {
    data = data.filter(s => s.status === filters.status);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter(s => s.awb.toLowerCase().includes(search));
  }

  return data;
};

export const exportToCSV = (data) => {
  const headers = ['Date', 'AWB Number', 'Origin', 'Destination', 'Status'];
  const rows = data.map(s => [s.date, s.awb, s.origin, s.dest, s.status]);
  
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `shipment_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Arrived':
    case 'Delivered': return 'var(--status-arrived)';
    case 'Delayed': return 'var(--status-delayed)';
    case 'Pending': return 'var(--status-pending)';
    default: return 'var(--status-transit)';
  }
};
