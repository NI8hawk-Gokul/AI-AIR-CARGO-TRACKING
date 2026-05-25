import React, { useState, useEffect } from 'react';
import { Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { getDashboardStats, getRecentShipments, getAIDelayPredictions } from '../services/dataService';

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
  const [stats, setStats] = useState({ totalCargo: 0, pending: 0, delayed: 0, deliveredToday: 0 });
  const [recentShipments, setRecentShipments] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, shipmentsData, predictionsData] = await Promise.all([
          getDashboardStats(),
          getRecentShipments(5),
          getAIDelayPredictions()
        ]);
        setStats(statsData);
        setRecentShipments(shipmentsData);
        setPredictions(predictionsData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, here is what's happening with your shipments today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Total Cargo" value={stats.totalCargo.toLocaleString()} icon={<Package size={26} />} color="var(--primary-color)" />
        <StatCard title="Pending" value={stats.pending.toLocaleString()} icon={<Clock size={26} />} color="var(--status-pending)" />
        <StatCard title="Delayed (AI Prediction)" value={stats.delayed.toLocaleString()} icon={<AlertTriangle size={26} />} color="var(--status-delayed)" />
        <StatCard title="Delivered Today" value={stats.deliveredToday.toLocaleString()} icon={<CheckCircle size={26} />} color="var(--status-arrived)" />
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
                {recentShipments.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>
                      <Link to={`/tracking?awb=${row.awb}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>
                        {row.awb}
                      </Link>
                    </td>
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
            {predictions.length > 0 ? (
              predictions.map((alert, i) => (
                <div key={i} style={{ 
                  padding: '1rem', backgroundColor: `${alert.prob.replace('%', '') > 50 ? 'var(--status-delayed)' : 'var(--status-arrived)'}10`, 
                  borderLeft: `4px solid ${alert.prob.replace('%', '') > 50 ? 'var(--status-delayed)' : 'var(--status-arrived)'}`, borderRadius: '0 8px 8px 0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>Flight {alert.flight} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({alert.awb})</span></strong>
                    <span style={{ color: alert.prob.replace('%', '') > 50 ? 'var(--status-delayed)' : 'var(--status-arrived)', fontWeight: 'bold' }}>{alert.prob} Risk</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Reason: {alert.reason}</p>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <CheckCircle size={36} color="var(--status-arrived)" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                <p style={{ margin: 0, fontWeight: '500' }}>No active transit risks detected</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>All shipments have been delivered successfully.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
