import { SHIPMENT_DATA } from '../data/shipmentData';

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

function extractPrefix(awb) {
  return awb.replace(/[\s-]/g, '').substring(0, 3);
}

export const getCarrierTrackingUrl = (awb) => {
  const prefix = extractPrefix(awb.trim().toUpperCase());
  const carrier = AIRLINE_PREFIXES[prefix];
  if (carrier) {
    return { url: carrier.url(awb.trim().toUpperCase()), carrierName: carrier.name };
  }
  return {
    url: `https://www.track-trace.com/aircargo?search=${awb.replace(/[\s-]/g, '')}`,
    carrierName: 'Track-Trace (Universal)'
  };
};

// Local storage helper functions
export const getCustomShipments = () => {
  if (typeof window === 'undefined') return {};
  try {
    const customDataStr = localStorage.getItem('custom_shipments');
    return customDataStr ? JSON.parse(customDataStr) : {};
  } catch (e) {
    console.error("Failed to read custom shipments", e);
    return {};
  }
};

export const saveCustomShipmentToLocal = (shipment) => {
  if (typeof window === 'undefined') return;
  try {
    const custom = getCustomShipments();
    custom[shipment.awb] = shipment;
    localStorage.setItem('custom_shipments', JSON.stringify(custom));
  } catch (e) {
    console.error("Failed to save custom shipment", e);
  }
};

// Fetch combined list of all shipments (Supabase DB + default static fallback)
export const getAllShipmentsList = async () => {
  try {
    const response = await fetch('/api/db/shipments');
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const dbShipments = result.data;
        const merged = { ...SHIPMENT_DATA };
        dbShipments.forEach(s => {
          merged[s.awb] = s;
        });
        return Object.values(merged);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch shipments from database, falling back to local storage.", err);
  }
  
  // Local fallback
  const custom = getCustomShipments();
  const merged = { ...SHIPMENT_DATA, ...custom };
  return Object.values(merged);
};

// Fetch search history
export const getSearchHistory = async () => {
  try {
    const response = await fetch('/api/db/history');
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch search history from database, falling back to local storage.", err);
  }

  // Fallback to localStorage
  if (typeof window === 'undefined') return [];
  try {
    const historyStr = localStorage.getItem('search_history');
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (e) {
    console.error("Failed to read search history", e);
    return [];
  }
};

// Add search history event
export const addToSearchHistory = async (shipment) => {
  if (!shipment) return;
  try {
    const response = await fetch('/api/db/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipment)
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return;
      }
    }
  } catch (err) {
    console.warn("Failed to save search history to database, falling back to local storage.", err);
  }

  // Fallback to localStorage
  if (typeof window === 'undefined') return;
  try {
    let history = [];
    const historyStr = localStorage.getItem('search_history');
    if (historyStr) {
      history = JSON.parse(historyStr);
    }
    history = history.filter(item => item.awb !== shipment.awb);
    history.unshift({
      awb: shipment.awb,
      carrier: shipment.carrier,
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      flight: shipment.flight,
      date: shipment.date || new Date().toISOString().split('T')[0]
    });
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save search history", e);
  }
};

// Clear search history
export const clearSearchHistory = async () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('search_history');
};

// Run AI analysis
export const runShipmentAIAnalysis = async (awb) => {
  const normalizedAwb = awb.trim().toUpperCase();

  try {
    const response = await fetch(`/api/db/analysis/${encodeURIComponent(normalizedAwb)}`, {
      method: 'POST'
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        await addToSearchHistory(result.data);
        return result.data;
      }
    }
  } catch (err) {
    console.warn("Failed to run AI analysis in database, falling back to local simulation.", err);
  }

  // Fallback local simulation
  const custom = getCustomShipments();
  let shipment = custom[normalizedAwb] || SHIPMENT_DATA[normalizedAwb];

  if (!shipment) {
    const prefix = normalizedAwb.replace(/[\s-]/g, '').substring(0, 3);
    const carrier = AIRLINE_PREFIXES[prefix] || { name: 'Universal Cargo', code: 'UC' };
    shipment = {
      awb: normalizedAwb,
      carrier: carrier.name,
      carrierCode: carrier.code || prefix,
      status: 'In Transit',
      origin: "DXB - Dubai, UAE",
      destination: "LHR - London, UK",
      estimatedDelivery: "May 28, 2026 - 15:40",
      weight: "1200 kg",
      pieces: 3,
      flight: `${carrier.code || 'UC'}502`,
      currentLocation: [35.0, 15.0],
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
    shipment.delayRisk = "None";
    shipment.delayRiskPercent = 0;
    shipment.delayReason = "Shipment delivered successfully.";
    shipment.aiAnalysisRun = true;
  } else {
    const num = parseInt(normalizedAwb.replace(/[^0-9]/g, '')) || 50;
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

    shipment.delayRisk = delayRisk;
    shipment.delayRiskPercent = riskPercent;
    shipment.delayReason = delayReason;
    shipment.aiAnalysisRun = true;
  }

  saveCustomShipmentToLocal(shipment);
  await addToSearchHistory(shipment);
  return shipment;
};

// Add a custom shipment
export const addCustomShipment = async (formData) => {
  const awb = formData.awb.trim().toUpperCase();
  if (!awb) return false;
  
  const status = formData.status || 'In Transit';
  const isDelivered = status === 'Delivered' || status === 'Arrived';
  
  const prefix = awb.replace(/[\s-]/g, '').substring(0, 3);
  const carrierInfo = AIRLINE_PREFIXES[prefix] || { name: 'Universal Cargo', code: 'UC' };
  
  const shipment = {
    awb,
    carrier: carrierInfo.name,
    carrierCode: carrierInfo.code || prefix,
    status: status,
    origin: formData.origin,
    destination: formData.destination,
    estimatedDelivery: isDelivered ? "Delivered" : formData.date || "May 28, 2026",
    weight: formData.weight ? `${formData.weight} kg` : "N/A",
    pieces: 1,
    flight: formData.flight || "N/A",
    currentLocation: isDelivered ? [51.4700, -0.4543] : [35.0, 15.0],
    route: [[25.2048, 55.2708], [51.4700, -0.4543]],
    telemetry: isDelivered 
      ? { altitude: "0 ft", speed: "0 km/h", temp: "15°C", humidity: "50%" }
      : { altitude: "35,000 ft", speed: "880 km/h", temp: "-50°C", humidity: "12%" },
    eta: isDelivered ? "Delivered" : formData.date || "May 28, 2026",
    aiAnalysisRun: isDelivered ? true : false,
    delayRisk: isDelivered ? "None" : undefined,
    delayRiskPercent: isDelivered ? 0 : undefined,
    delayReason: isDelivered ? "Shipment delivered successfully." : undefined,
    date: formData.date || new Date().toISOString().split('T')[0],
    events: isDelivered ? [
      { time: new Date().toLocaleString(), location: formData.origin, status: "Shipment Received", completed: true },
      { time: new Date().toLocaleString(), location: formData.destination, status: "Shipment Delivered", completed: true }
    ] : [
      { time: new Date().toLocaleString(), location: formData.origin, status: "Shipment Received", completed: true },
      { time: new Date().toLocaleString(), location: "In Air", status: "In Transit", completed: true }
    ]
  };

  try {
    const response = await fetch('/api/db/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipment)
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        await addToSearchHistory(shipment);
        return true;
      }
    }
  } catch (err) {
    console.warn("Failed to save custom shipment to database, falling back to local storage.", err);
  }

  // Fallback to localStorage
  saveCustomShipmentToLocal(shipment);
  await addToSearchHistory(shipment);
  return true;
};

// Track shipment by AWB number
export const trackShipment = async (awb) => {
  const normalizedAwb = awb.trim().toUpperCase();
  const carrierUrlInfo = getCarrierTrackingUrl(normalizedAwb);

  // 1. Try backend API tracker first (which queries Supabase internally)
  try {
    const response = await fetch(`/api/track/${encodeURIComponent(normalizedAwb)}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const isDelivered = result.data.status === 'Delivered' || result.data.status === 'Arrived';
        const enrichedData = {
          ...result.data,
          aiAnalysisRun: result.data.aiAnalysisRun ?? (isDelivered ? true : false),
          delayRisk: result.data.delayRisk ?? (isDelivered ? "None" : undefined),
          delayRiskPercent: result.data.delayRiskPercent ?? (isDelivered ? 0 : undefined),
          delayReason: result.data.delayReason ?? (isDelivered ? "Shipment delivered successfully." : undefined),
          eta: result.data.estimatedDelivery || result.data.eta || "N/A"
        };

        // Cache locally for offline fallback
        saveCustomShipmentToLocal(enrichedData);
        await addToSearchHistory(enrichedData);

        return {
          ...result,
          data: enrichedData
        };
      }
    }
  } catch (err) {
    console.warn("Backend API track request failed, using local fallback.", err);
  }

  // 2. Local Fallback - Check custom shipments from local storage
  const custom = getCustomShipments();
  if (custom[normalizedAwb]) {
    await addToSearchHistory(custom[normalizedAwb]);
    return {
      success: true,
      source: 'local',
      data: custom[normalizedAwb],
      carrierUrl: carrierUrlInfo.url,
      carrierName: carrierUrlInfo.carrierName,
    };
  }

  // 3. Local Fallback - Check local static data (default shipments)
  if (SHIPMENT_DATA[normalizedAwb]) {
    await addToSearchHistory(SHIPMENT_DATA[normalizedAwb]);
    return {
      success: true,
      source: 'local',
      data: SHIPMENT_DATA[normalizedAwb],
      carrierUrl: carrierUrlInfo.url,
      carrierName: carrierUrlInfo.carrierName,
    };
  }

  // 4. Return API tracking failed error
  return {
    success: false,
    source: 'api_failed',
    message: `No active record found for ${normalizedAwb} on carrier systems.`,
    carrierUrl: carrierUrlInfo.url,
    carrierName: carrierUrlInfo.carrierName
  };
};

export const getDashboardStats = async () => {
  const shipments = await getAllShipmentsList();
  const total = shipments.length;
  const pending = shipments.filter(s => s.status === 'In Transit' || s.status === 'Pending').length;
  const delayed = shipments.filter(s => s.status === 'Delayed').length;
  const deliveredToday = shipments.filter(s => s.status === 'Delivered' || s.status === 'Arrived').length;
  
  return {
    totalCargo: total,
    pending: pending, 
    delayed: delayed, 
    deliveredToday: deliveredToday
  };
};

export const getRecentShipments = async (limit = 5) => {
  const shipments = await getAllShipmentsList();
  return shipments.slice(0, limit).map(s => ({
    awb: s.awb,
    route: `${s.origin?.split(' - ')[0] || 'N/A'} → ${s.destination?.split(' - ')[0] || 'N/A'}`,
    status: s.status,
    color: getStatusColor(s.status)
  }));
};

export const getReportData = async (filters = {}) => {
  const shipments = await getAllShipmentsList();
  let data = shipments.map(s => ({
    id: s.awb,
    date: s.date || new Date().toISOString().split('T')[0],
    awb: s.awb,
    origin: s.origin?.split(' - ')[0] || 'N/A',
    dest: s.destination?.split(' - ')[0] || 'N/A',
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

export const getAIDelayPredictions = async () => {
  const shipments = await getAllShipmentsList();
  const activeShipments = shipments.filter(
    s => s.status !== 'Delivered' && s.status !== 'Arrived' && s.aiAnalysisRun === true
  );
  
  return activeShipments.map(s => {
    const riskPercent = s.delayRiskPercent || (s.delayRisk ? parseInt(s.delayRisk.replace(/[^0-9]/g, '')) : 15);
    const reason = s.delayReason || "Clear weather, on schedule";
    return {
      awb: s.awb,
      flight: s.flight || 'N/A',
      prob: `${riskPercent}%`,
      reason: reason
    };
  });
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
