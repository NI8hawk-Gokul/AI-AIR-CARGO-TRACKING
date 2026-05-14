import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Download, Filter, Search, X } from 'lucide-react';
import { getReportData, exportToCSV } from '../services/dataService';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({ status: 'All', search: '' });
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    setReportData(getReportData(filters));
  }, [filters]);

  const handleExport = () => {
    exportToCSV(reportData);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Arrived': 
      case 'Delivered': return { bg: 'var(--status-arrived)15', color: 'var(--status-arrived)' };
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
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Filter size={18} /> {filters.status === 'All' ? 'Filter' : `Filter: ${filters.status}`}
            </button>
            
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl border z-50 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                {['All', 'In Transit', 'Delayed', 'Arrived', 'Delivered', 'Pending'].map(s => (
                  <button 
                    key={s}
                    onClick={() => { setFilters({ ...filters, status: s }); setShowFilterMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={handleExport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <Card style={{ padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by AWB Number..." 
            className="input-field" 
            style={{ paddingLeft: '3rem' }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button 
              onClick={() => setFilters({ ...filters, search: '' })}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </Card>

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
              {reportData.length > 0 ? reportData.map((row) => {
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
                        {(row.status === 'Arrived' || row.status === 'Delivered') && '✅ '}
                        {row.status === 'Pending' && '⏳ '}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No shipments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
