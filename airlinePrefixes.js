/**
 * Airline Prefix Database
 * Maps the 3-digit AWB prefix to carrier info and tracking URLs.
 * AWB format: PPP-NNNNNNNN (PPP = 3-digit airline prefix)
 */

const AIRLINE_PREFIXES = {
  // --- Middle East ---
  '157': { name: 'Qatar Airways Cargo', code: 'QR', trackingUrl: 'https://www.qrcargo.com/s/tracking', buildUrl: (awb) => `https://www.qrcargo.com/s/tracking?awb=${awb}` },
  '176': { name: 'Emirates SkyCargo', code: 'EK', trackingUrl: 'https://eskycargo.emirates.com', buildUrl: (awb) => `https://eskycargo.emirates.com/app/offerBooking/#/shipment-tracking?awbNo=${awb.replace('-', '')}` },
  '607': { name: 'Etihad Cargo', code: 'EY', trackingUrl: 'https://etihadcargo.com', buildUrl: (awb) => `https://etihadcargo.com/en/e-services/track-your-shipments?awb=${awb.replace('-', '')}` },
  '164': { name: 'Saudia Cargo', code: 'SV', trackingUrl: 'https://www.saudiacargo.com', buildUrl: (awb) => `https://www.saudiacargo.com/tracking?awb=${awb}` },
  '994': { name: 'Oman Air Cargo', code: 'WY', trackingUrl: 'https://www.omanair.com', buildUrl: (awb) => `https://www.omanair.com/cargo/tracking?awb=${awb}` },

  // --- India & South Asia ---
  '098': { name: 'Air India Cargo', code: 'AI', trackingUrl: 'https://www.aikinetix.com', buildUrl: (awb) => `https://www.aikinetix.com/search?type=awb&query=${awb.replace('-', '')}` },
  '585': { name: 'IndiGo CarGo', code: '6E', trackingUrl: 'https://www.goindigo.in', buildUrl: (awb) => `https://www.goindigo.in/cargo/tracking.html?awb=${awb}` },
  '624': { name: 'SpiceJet Cargo', code: 'SG', trackingUrl: 'https://book.spicejet.com', buildUrl: (awb) => `https://book.spicejet.com/cargo/tracking?awb=${awb}` },
  '781': { name: 'Blue Dart Aviation', code: 'BZ', trackingUrl: 'https://www.bluedart.com', buildUrl: (awb) => `https://www.bluedart.com/tracking?awb=${awb}` },
  '217': { name: 'SriLankan Cargo', code: 'UL', trackingUrl: 'https://www.srilankan.com', buildUrl: (awb) => `https://www.srilankan.com/cargo/tracking?awb=${awb}` },

  // --- Europe ---
  '220': { name: 'Lufthansa Cargo', code: 'LH', trackingUrl: 'https://www.lufthansa-cargo.com', buildUrl: (awb) => `https://www.lufthansa-cargo.com/tracking/shipment/${awb.replace('-', '')}` },
  '125': { name: 'British Airways Cargo', code: 'BA', trackingUrl: 'https://www.iagcargo.com', buildUrl: (awb) => `https://www.iagcargo.com/track-shipment?awb=${awb.replace('-', '')}` },
  '057': { name: 'Air France Cargo', code: 'AF', trackingUrl: 'https://www.afklcargo.com', buildUrl: (awb) => `https://www.afklcargo.com/mycargo/shipment/detail/${awb.replace('-', '')}` },
  '074': { name: 'KLM Cargo', code: 'KL', trackingUrl: 'https://www.afklcargo.com', buildUrl: (awb) => `https://www.afklcargo.com/mycargo/shipment/detail/${awb.replace('-', '')}` },
  '117': { name: 'Turkish Airlines Cargo', code: 'TK', trackingUrl: 'https://www.turkishcargo.com', buildUrl: (awb) => `https://www.turkishcargo.com/en/tracking?awb=${awb.replace('-', '')}` },
  '047': { name: 'Cargolux', code: 'CV', trackingUrl: 'https://www.cargolux.com', buildUrl: (awb) => `https://www.cargolux.com/e-services/tracking?awb=${awb}` },
  '082': { name: 'Iberia Cargo', code: 'IB', trackingUrl: 'https://www.iagcargo.com', buildUrl: (awb) => `https://www.iagcargo.com/track-shipment?awb=${awb.replace('-', '')}` },
  '053': { name: 'Swiss WorldCargo', code: 'LX', trackingUrl: 'https://www.swissworldcargo.com', buildUrl: (awb) => `https://www.swissworldcargo.com/tracking?awb=${awb}` },
  '114': { name: 'Aeroflot Cargo', code: 'SU', trackingUrl: 'https://www.aeroflotsales.com', buildUrl: (awb) => `https://www.aeroflotsales.com/cargo/tracking?awb=${awb}` },

  // --- North America ---
  '006': { name: 'Delta Cargo', code: 'DL', trackingUrl: 'https://www.deltacargo.com', buildUrl: (awb) => `https://www.deltacargo.com/Cargo/trackShipment?awbNumber=${awb.replace('-', '')}` },
  '016': { name: 'United Cargo', code: 'UA', trackingUrl: 'https://www.unitedcargo.com', buildUrl: (awb) => `https://www.unitedcargo.com/tracking?awb=${awb.replace('-', '')}` },
  '001': { name: 'American Airlines Cargo', code: 'AA', trackingUrl: 'https://www.aacargo.com', buildUrl: (awb) => `https://www.aacargo.com/shipping/tracking.jhtml?awb=${awb.replace('-', '')}` },
  '014': { name: 'Air Canada Cargo', code: 'AC', trackingUrl: 'https://www.aircanadacargo.com', buildUrl: (awb) => `https://www.aircanadacargo.com/tracking?awb=${awb.replace('-', '')}` },
  '023': { name: 'FedEx', code: 'FX', trackingUrl: 'https://www.fedex.com', buildUrl: (awb) => `https://www.fedex.com/fedextrack/?trknbr=${awb.replace('-', '')}` },
  '618': { name: 'UPS Airlines', code: '5X', trackingUrl: 'https://www.ups.com', buildUrl: (awb) => `https://www.ups.com/track?tracknum=${awb.replace('-', '')}` },
  '580': { name: 'DHL Aviation', code: 'DH', trackingUrl: 'https://www.dhl.com', buildUrl: (awb) => `https://www.dhl.com/en/express/tracking.html?AWB=${awb.replace('-', '')}` },

  // --- Asia Pacific ---
  '160': { name: 'Cathay Cargo', code: 'CX', trackingUrl: 'https://www.cathaycargo.com', buildUrl: (awb) => `https://www.cathaycargo.com/cargo-tracking/?awb=${awb.replace('-', '')}` },
  '618': { name: 'Singapore Airlines Cargo', code: 'SQ', trackingUrl: 'https://www.siacargo.com', buildUrl: (awb) => `https://www.siacargo.com/tracking?awb=${awb.replace('-', '')}` },
  '205': { name: 'ANA Cargo', code: 'NH', trackingUrl: 'https://cargo.ana.co.jp', buildUrl: (awb) => `https://cargo.ana.co.jp/anaicargo/tracking?awb=${awb.replace('-', '')}` },
  '131': { name: 'Japan Airlines Cargo', code: 'JL', trackingUrl: 'https://www.jalcargo.com', buildUrl: (awb) => `https://www.jalcargo.com/cms/tracking?awb=${awb.replace('-', '')}` },
  '180': { name: 'Korean Air Cargo', code: 'KE', trackingUrl: 'https://cargo.koreanair.com', buildUrl: (awb) => `https://cargo.koreanair.com/tracking?awb=${awb.replace('-', '')}` },
  '297': { name: 'Malaysia Airlines Cargo', code: 'MH', trackingUrl: 'https://www.maskargo.com', buildUrl: (awb) => `https://www.maskargo.com/tracking?awb=${awb.replace('-', '')}` },
  '217': { name: 'Thai Airways Cargo', code: 'TG', trackingUrl: 'https://www.thaicargo.com', buildUrl: (awb) => `https://www.thaicargo.com/tracking?awb=${awb.replace('-', '')}` },
  '999': { name: 'Air China Cargo', code: 'CA', trackingUrl: 'https://www.airchinacargo.com', buildUrl: (awb) => `https://www.airchinacargo.com/tracking?awb=${awb.replace('-', '')}` },
  '112': { name: 'China Airlines Cargo', code: 'CI', trackingUrl: 'https://cargo.china-airlines.com', buildUrl: (awb) => `https://cargo.china-airlines.com/ccnetv2/content/manage/TracknTrace.aspx?awb=${awb.replace('-', '')}` },
  '297': { name: 'EVA Air Cargo', code: 'BR', trackingUrl: 'https://www.brcargo.com', buildUrl: (awb) => `https://www.brcargo.com/tracking?awb=${awb.replace('-', '')}` },
  '833': { name: 'Vistara Cargo', code: 'UK', trackingUrl: 'https://www.airindia.com', buildUrl: (awb) => `https://www.airindia.com/cargo/tracking?awb=${awb}` },

  // --- Africa ---
  '071': { name: 'Ethiopian Airlines Cargo', code: 'ET', trackingUrl: 'https://www.ethiopianairlinescargo.com', buildUrl: (awb) => `https://www.ethiopianairlinescargo.com/tracking?awb=${awb.replace('-', '')}` },
  '083': { name: 'South African Airways Cargo', code: 'SA', trackingUrl: 'https://www.flysaa.com', buildUrl: (awb) => `https://www.flysaa.com/cargo/tracking?awb=${awb}` },
  '145': { name: 'Kenya Airways Cargo', code: 'KQ', trackingUrl: 'https://cargo.kenya-airways.com', buildUrl: (awb) => `https://cargo.kenya-airways.com/tracking?awb=${awb}` },

  // --- South America ---
  '045': { name: 'LATAM Cargo', code: 'LA', trackingUrl: 'https://www.latamcargo.com', buildUrl: (awb) => `https://www.latamcargo.com/en/trackshipment?docNumber=${awb.replace('-', '')}` },
  '729': { name: 'Avianca Cargo', code: 'AV', trackingUrl: 'https://www.aviancacargo.com', buildUrl: (awb) => `https://www.aviancacargo.com/tracking?awb=${awb}` },
};

/**
 * Get carrier info from AWB prefix
 * @param {string} prefix - 3-digit airline prefix
 * @returns {{ name: string, code: string, trackingUrl: string, buildUrl: function } | null}
 */
export function getCarrierInfo(prefix) {
  return AIRLINE_PREFIXES[prefix] || null;
}

/**
 * Extract the 3-digit prefix from a full AWB number
 * Handles formats: "157-89692853", "15789692853", "157 89692853"
 * @param {string} awb
 * @returns {string} 3-digit prefix
 */
export function extractPrefix(awb) {
  const cleaned = awb.replace(/[\s-]/g, '');
  return cleaned.substring(0, 3);
}

/**
 * Build the direct tracking URL for a given AWB
 * @param {string} awb - Full AWB number
 * @returns {{ url: string, carrierName: string } | null}
 */
export function buildTrackingUrl(awb) {
  const prefix = extractPrefix(awb);
  const carrier = getCarrierInfo(prefix);
  if (!carrier) return null;
  return {
    url: carrier.buildUrl(awb),
    carrierName: carrier.name
  };
}

/**
 * Build a fallback URL using track-trace.com (works for ANY airline)
 * @param {string} awb - Full AWB number
 * @returns {string}
 */
export function buildFallbackTrackingUrl(awb) {
  const cleaned = awb.replace(/[\s-]/g, '');
  return `https://www.track-trace.com/aircargo?search=${cleaned}`;
}

export { AIRLINE_PREFIXES };
export default AIRLINE_PREFIXES;
