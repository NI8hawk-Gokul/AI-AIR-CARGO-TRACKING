export const SHIPMENT_DATA = {
  "157-89692853": {
    awb: "157-89692853",
    carrier: "Qatar Airways Cargo",
    status: "Delivered",
    origin: "AMD - Ahmedabad, India",
    destination: "FRA - Frankfurt, Germany",
    estimatedDelivery: "Jan 28, 2024 - 19:08",
    weight: "49.0 Kg",
    pieces: 1,
    flight: "QR8613",
    currentLocation: [50.0379, 8.5622],
    route: [[23.0772, 72.6347], [25.2731, 51.6081], [50.0379, 8.5622]],
    telemetry: { altitude: "0 ft", speed: "0 km/h", temp: "18°C", humidity: "45%" },
    eta: "Delivered",
    delayRisk: "None",
    date: "2024-01-28",
    flightSegments: [
      { origin: 'AMD', destination: 'DOH', flight: 'QR-8613 (FRT)', depTime: '24-Jan-24 09:45', arrTime: '24-Jan-24 10:59', pieces: 1 },
      { origin: 'DOH', destination: 'FRA', flight: 'QR-0071 (PAX)', depTime: '25-Jan-24 14:13', arrTime: '25-Jan-24 18:58', pieces: 1 }
    ],
    events: [
      { time: "Sun, 28 Jan 2024 19:08", location: "FRA", status: "Delivered in FRA", details: "1 Pcs | 49 Kg", completed: true },
      { time: "Fri, 26 Jan 2024 00:32", location: "FRA", status: "Notified consignee", details: "1 Pcs | 49 Kg", completed: true },
      { time: "Fri, 26 Jan 2024 00:17", location: "FRA", status: "Received in FRA", details: "1 Pcs | 49 Kg", completed: true },
      { time: "Thu, 25 Jan 2024 18:58", location: "FRA", status: "Arrived in FRA on QR 0071/25-Jan-2024", details: "1 Pcs | 49 Kg", completed: true },
      { time: "Thu, 25 Jan 2024 14:13", location: "DOH", status: "Departed from DOH on QR0071/25-Jan-2024", details: "1 Pcs | 49 Kg | 0.114 m³", completed: true },
      { time: "Wed, 24 Jan 2024 15:10", location: "DOH", status: "Received in DOH", details: "1 Pcs | 49 Kg | 0.114 m³", completed: true },
      { time: "Wed, 24 Jan 2024 10:59", location: "DOH", status: "Arrived in DOH on QR 8613/24-Jan-2024", details: "1 Pcs | 49 Kg | 0.114 m³", completed: true },
      { time: "Wed, 24 Jan 2024 09:45", location: "AMD", status: "Departed from AMD on QR8613/24-Jan-2024", details: "1 Pcs | 49 Kg | 0.114 m³", completed: true },
      { time: "Tue, 23 Jan 2024 20:41", location: "AMD", status: "Received from shipper in AMD", details: "1 Pcs | 49 Kg | 0.114 m³", completed: true }
    ]
  },
  "607-32728242": {
    awb: "607-32728242",
    carrier: "Etihad Cargo",
    status: "Delivered",
    origin: "AUH - Abu Dhabi, UAE",
    destination: "BOM - Mumbai, India",
    estimatedDelivery: "Dec 12, 2023 - 14:30",
    weight: "1,250 kg",
    pieces: 4,
    flight: "EY204",
    currentLocation: [19.0896, 72.8656],
    route: [[24.4330, 54.6511], [19.0896, 72.8656]],
    telemetry: { altitude: "0 ft", speed: "0 km/h", temp: "22°C", humidity: "60%" },
    eta: "Delivered",
    delayRisk: "None",
    date: "2023-12-12",
    events: [
      { time: "Dec 10, 08:00", location: "Abu Dhabi (AUH)", status: "Booked and Received", type: "package", completed: true },
      { time: "Dec 12, 14:30", location: "Mumbai Facility", status: "Shipment Delivered", type: "check-circle", completed: true }
    ]
  },
  "205-68108736": {
    awb: "205-68108736",
    carrier: "ANA Cargo",
    status: "Delivered",
    origin: "NRT - Tokyo, Japan",
    destination: "JFK - New York, USA",
    estimatedDelivery: "May 15, 2026 - 09:15",
    weight: "850 kg",
    pieces: 2,
    flight: "NH10",
    currentLocation: [40.6413, -73.7781],
    route: [
      [35.7720, 140.3929], // NRT
      [45.0000, 170.0000], // Pacific
      [50.0000, -150.0000], // Alaska
      [40.6413, -100.7781], // USA
      [40.6413, -73.7781]   // JFK
    ],
    telemetry: { altitude: "0 ft", speed: "0 km/h", temp: "15°C", humidity: "42%" },
    eta: "Delivered",
    delayRisk: "None",
    date: "2026-05-15",
    events: [
      { time: "May 13, 16:20", location: "Tokyo (NRT)", status: "Shipment Accepted", type: "package", completed: true },
      { time: "May 14, 11:00", location: "Tokyo (NRT)", status: "Departed on Flight NH10", type: "plane", completed: true },
      { time: "May 14, 22:45", location: "In Air", status: "Crossing Pacific Ocean", type: "clock", completed: true },
      { time: "May 15, 08:30", location: "New York (JFK)", status: "Arrived at Destination", type: "map-pin", completed: true },
      { time: "May 15, 09:15", location: "New York (JFK)", status: "Shipment Delivered", type: "check-circle", completed: true }
    ]
  },
  "297-72328572": {
    awb: "297-72328572",
    carrier: "China Airlines Cargo",
    status: "Delivered",
    origin: "ORD - Chicago, USA",
    destination: "KUL - Kuala Lumpur, Malaysia",
    estimatedDelivery: "Mar 16, 2026 - 18:08",
    weight: "801.3 Kg",
    pieces: 16,
    flight: "CI0721",
    currentLocation: [2.7456, 101.7072],
    route: [[41.9742, -87.9073], [25.0797, 121.2342], [2.7456, 101.7072]],
    telemetry: { altitude: "0 ft", speed: "0 km/h", temp: "28°C", humidity: "75%" },
    eta: "Delivered",
    delayRisk: "None",
    date: "2026-03-16",
    flightSegments: [
      { origin: 'ORD', destination: 'TPE', flight: 'CI-5239', depTime: '14-Mar-26 07:23', arrTime: '16-Mar-26 08:23', pieces: 16 },
      { origin: 'TPE', destination: 'KUL', flight: 'CI-0721', depTime: '16-Mar-26 08:23', arrTime: '16-Mar-26 13:22', pieces: 16 }
    ],
    events: [
      { time: "Mon, 16 Mar 2026 18:08:00", location: "KUL", status: "Delivered in KUL", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 14:16:00", location: "KUL", status: "Breakdown in KUL (Flight CI-0721)", details: "1 Pcs | 50.0 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 14:16:00", location: "KUL", status: "Breakdown in KUL (Flight CI-0721)", details: "5 Pcs | 250.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 13:22:00", location: "KUL", status: "Arrived in KUL on CI-0721", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 13:09:00", location: "KUL", status: "Arrived in KUL on CI-0721", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 08:39:21", location: "TPE", status: "Booked on CI-5239", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 08:39:21", location: "TPE", status: "Booked on CI-0721", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 08:23:01", location: "TPE", status: "Departed from TPE on CI-0721", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 06:58:35", location: "TPE", status: "Manifested on CI-0721", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 05:03:53", location: "TPE", status: "Built Up on CI-0721", details: "1 Pcs | 50.0 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 05:03:52", location: "TPE", status: "Offloaded on CI-0721", details: "1 Pcs | 50.0 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 04:58:03", location: "TPE", status: "Built Up on CI-0721", details: "5 Pcs | 250.3 Kg", completed: true },
      { time: "Mon, 16 Mar 2026 04:58:02", location: "TPE", status: "Offloaded on CI-0721", details: "5 Pcs | 250.3 Kg", completed: true },
      { time: "Thu, 12 Mar 2026 10:42:40", location: "ORD", status: "Booked on CI-0721", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Thu, 12 Mar 2026 10:42:40", location: "ORD", status: "Booked on CI-5225", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Thu, 12 Mar 2026 10:42:39", location: "ORD", status: "Accepted from shipper in ORD", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Thu, 12 Mar 2026 02:41:08", location: "TPE", status: "Booked on CI-5225", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Thu, 12 Mar 2026 02:41:08", location: "TPE", status: "Booked on CI-0721", details: "16 Pcs | 801.3 Kg", completed: true },
      { time: "Wed, 11 Mar 2026 13:01:38", location: "ORD", status: "Booked on CI-5225", details: "16 Pcs | 800.0 Kg", completed: true },
      { time: "Wed, 11 Mar 2026 13:01:38", location: "ORD", status: "Booked on CI-0721", details: "16 Pcs | 800.0 Kg", completed: true },
      { time: "Wed, 11 Mar 2026 12:29:58", location: "ORD", status: "Booked on CI-5239", details: "16 Pcs | 800.0 Kg", completed: true },
      { time: "Wed, 11 Mar 2026 12:29:58", location: "ORD", status: "Booked on CI-0721", details: "16 Pcs | 800.0 Kg", completed: true },
      { time: "Wed, 11 Mar 2026 10:36:15", location: "ORD", status: "Booked on CI-5239", details: "7 Pcs | 399.6 Kg", completed: true },
      { time: "Wed, 11 Mar 2026 10:36:15", location: "ORD", status: "Booked on CI-0721", details: "7 Pcs | 399.6 Kg", completed: true }
    ]
  }
};

export const ALL_SHIPMENTS = Object.values(SHIPMENT_DATA);
