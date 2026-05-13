import React from 'react';
import { Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../components/Card';

const StatCard = ({ title, value, icon, color }) => (
  <Card style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ 
      width: '54px', height: '54px', borderRadius: '12px', 
      backgroundColor: `${color}20`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{title}</p>
      <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{value}</h3>
    </div>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, here is what's happening with your shipments today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Total Cargo" value="1,248" icon={<Package size={26} />} color="var(--primary-color)" />
        <StatCard title="Pending" value="342" icon={<Clock size={26} />} color="var(--status-pending)" />
        <StatCard title="Delayed (AI Prediction)" value="18" icon={<AlertTriangle size={26} />} color="var(--status-delayed)" />
        <StatCard title="Delivered Today" value="156" icon={<CheckCircle size={26} />} color="var(--status-arrived)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card title="Recent Shipments">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>AWB Number</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Origin - Dest</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { awb: '176-12345678', route: 'JFK → LHR', status: 'In Transit', color: 'var(--status-transit)' },
                  { awb: '176-87654321', route: 'DXB → DEL', status: 'Delayed', color: 'var(--status-delayed)' },
                  { awb: '176-11223344', route: 'SIN → SYD', status: 'Arrived', color: 'var(--status-arrived)' }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{row.awb}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{row.route}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        backgroundColor: `${row.color}15`, color: row.color, 
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600'
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="AI Delay Predictions (Live)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { flight: 'EK502', prob: '85%', reason: 'Heavy rain at DEL' },
              { flight: 'BA119', prob: '60%', reason: 'Air traffic congestion' },
            ].map((alert, i) => (
              <div key={i} style={{ 
                padding: '1rem', backgroundColor: 'var(--status-delayed)10', 
                borderLeft: '4px solid var(--status-delayed)', borderRadius: '0 8px 8px 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>Flight {alert.flight}</strong>
                  <span style={{ color: 'var(--status-delayed)', fontWeight: 'bold' }}>{alert.prob} Risk</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Reason: {alert.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
