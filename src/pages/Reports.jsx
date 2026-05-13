import React from 'react';
import Card from '../components/Card';
import { Download, Filter } from 'lucide-react';

const Reports = () => {
  const reportData = [
    { id: 1, awb: '176-12345678', origin: 'DXB', dest: 'LHR', date: '2023-10-25', status: 'Arrived' },
    { id: 2, awb: '176-87654321', origin: 'JFK', dest: 'CDG', date: '2023-10-26', status: 'Pending' },
    { id: 3, awb: '176-11223344', origin: 'SIN', dest: 'SYD', date: '2023-10-26', status: 'Delayed' },
    { id: 4, awb: '176-99887766', origin: 'FRA', dest: 'DXB', date: '2023-10-27', status: 'Arrived' },
    { id: 5, awb: '176-55443322', origin: 'HKG', dest: 'LAX', date: '2023-10-27', status: 'In Transit' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Arrived': return { bg: 'var(--status-arrived)15', color: 'var(--status-arrived)' };
      case 'Delayed': return { bg: 'var(--status-delayed)15', color: 'var(--status-delayed)' };
      case 'Pending': return { bg: 'var(--status-pending)15', color: 'var(--status-pending)' };
      default: return { bg: 'var(--status-transit)15', color: 'var(--status-transit)' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Shipment Reports</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View daily and weekly summaries of cargo movements.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} /> Filter
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>AWB Number</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Route</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => {
                const styles = getStatusStyle(row.status);
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1rem' }}>{row.date}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{row.awb}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{row.origin} → {row.dest}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        backgroundColor: styles.bg, color: styles.color, 
                        padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold',
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                      }}>
                        {row.status === 'Arrived' && '✅ '}
                        {row.status === 'Pending' && '⏳ '}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
