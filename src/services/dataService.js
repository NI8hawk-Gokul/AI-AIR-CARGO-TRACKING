import { SHIPMENT_DATA, ALL_SHIPMENTS } from '../data/shipmentData';

/**
 * Data Service for Dashboard, Tracking, and Reports
 */
export const trackShipment = async (awb) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const normalizedAwb = awb.trim().toUpperCase();
  if (SHIPMENT_DATA[normalizedAwb]) {
    return { success: true, data: SHIPMENT_DATA[normalizedAwb] };
  }
  return {
    success: false,
    message: "No active record found in the carrier system for this AWB."
  };
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
