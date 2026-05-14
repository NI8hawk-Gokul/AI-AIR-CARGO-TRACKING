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
    eta: "Delivered",
    delayRisk: "None",
    date: "2024-01-28",
    events: [
      { time: "Jan 23, 20:41", location: "Ahmedabad (AMD)", status: "Received from shipper", type: "package", completed: true },
      { time: "Jan 28, 19:08", location: "Frankfurt (FRA)", status: "Delivered to Consignee", type: "check-circle", completed: true }
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
    status: "In Transit",
    origin: "NRT - Tokyo, Japan",
    destination: "JFK - New York, USA",
    estimatedDelivery: "May 15, 2026 - 09:15",
    weight: "850 kg",
    pieces: 2,
    flight: "NH10",
    currentLocation: [40.6413, -100.7781],
    route: [[35.7720, 140.3929], [40.6413, -100.7781], [40.6413, -73.7781]],
    eta: "In 4h 20m",
    delayRisk: "Low",
    date: "2026-05-14",
    events: [
      { time: "May 13, 16:20", location: "Tokyo (NRT)", status: "Shipment Accepted", type: "package", completed: true },
      { time: "Pending", location: "New York (JFK)", status: "Estimated Arrival", type: "map-pin", completed: false }
    ]
  },
  "176-12345678": {
    awb: "176-12345678",
    carrier: "Emirates SkyCargo",
    status: "In Transit",
    origin: "DXB - Dubai, UAE",
    destination: "LHR - London, UK",
    estimatedDelivery: "May 14, 2026 - 18:30",
    weight: "2,100 kg",
    pieces: 8,
    flight: "EK001",
    date: "2026-05-14",
    events: []
  },
  "176-87654321": {
    awb: "176-87654321",
    carrier: "Emirates SkyCargo",
    status: "Delayed",
    origin: "DXB - Dubai, UAE",
    destination: "DEL - Delhi, India",
    estimatedDelivery: "May 15, 2026 - 12:00",
    weight: "1,500 kg",
    pieces: 5,
    flight: "EK502",
    date: "2026-05-14",
    events: []
  },
  "176-11223344": {
    awb: "176-11223344",
    carrier: "Singapore Airlines Cargo",
    status: "Arrived",
    origin: "SIN - Singapore",
    destination: "SYD - Sydney, Australia",
    estimatedDelivery: "May 13, 2026 - 10:00",
    weight: "950 kg",
    pieces: 3,
    flight: "SQ7291",
    date: "2026-05-13",
    events: []
  }
};

export const ALL_SHIPMENTS = Object.values(SHIPMENT_DATA);
