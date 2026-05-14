import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plane, Clock, AlertTriangle, CheckCircle, Zap, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import Card from '../components/Card';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { trackShipment } from '../services/dataService';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const Tracking = () => {
  const [awb, setAwb] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animatedPos, setAnimatedPos] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    let interval;
    if (trackingData && trackingData.status === 'In Transit' && trackingData.currentLocation) {
      setAnimatedPos(trackingData.currentLocation);
      interval = setInterval(() => {
        setAnimatedPos(prev => {
          if (!prev) return prev;
          return [prev[0] + (Math.random() - 0.5) * 0.005, prev[1] + (Math.random() - 0.5) * 0.005];
        });
      }, 3000);
    } else {
      setAnimatedPos(null);
    }
    return () => clearInterval(interval);
  }, [trackingData]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!awb.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await trackShipment(awb);
      if (result.success) setTrackingData(result.data);
      else {
        setError(result.message);
        setTrackingData(null);
      }
    } catch (err) {
      setError("Unable to connect to tracking servers.");
    } finally {
      setLoading(false);
    }
  };

  const planeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/723/723955.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'plane-glow'
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Live Shipment Tracking</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Futuristic real-time monitoring and AI logistics intelligence.</p>
        </div>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Enter AWB Number (e.g. 205-68108736)" 
            className="input-field"
            value={awb}
            onChange={(e) => setAwb(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 2rem', height: '45px' }}>
            {loading ? 'Analyzing...' : 'Track Live'}
          </button>
        </form>
      </div>

      {error && (
        <Card style={{ borderLeft: '4px solid var(--status-delayed)', backgroundColor: 'var(--status-delayed)10' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--status-delayed)' }}>
            <AlertTriangle size={24} />
            <p style={{ margin: 0, fontWeight: '600' }}>{error}</p>
          </div>
        </Card>
      )}

      {trackingData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card style={{ padding: 0, overflow: 'hidden', height: '550px', position: 'relative' }}>
              <MapContainer center={trackingData.currentLocation} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                <MapController center={animatedPos || trackingData.currentLocation} />
                <Polyline positions={trackingData.route} color="var(--primary-color)" weight={3} dashArray="10, 10" opacity={0.6} />
                
                {animatedPos && (
                  <Marker position={animatedPos} icon={planeIcon}>
                    <Popup>
                      <div style={{ padding: '0.25rem' }}>
                        <strong style={{ color: 'var(--primary-color)' }}>{trackingData.flight}</strong><br/>
                        <span style={{ fontSize: '0.75rem' }}>In Air - Live Tracking</span>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Hub Pulsing Geofences */}
                {[trackingData.route[0], trackingData.route[trackingData.route.length-1]].map((pos, i) => (
                  <React.Fragment key={i}>
                    <Circle center={pos} radius={50000} pathOptions={{ color: i===0 ? 'var(--status-transit)' : 'var(--status-arrived)', fillColor: i===0 ? 'var(--status-transit)' : 'var(--status-arrived)', fillOpacity: 0.1 }} />
                    <Circle center={pos} radius={100000} pathOptions={{ color: i===0 ? 'var(--status-transit)' : 'var(--status-arrived)', fillOpacity: 0, weight: 1, className: 'pulse-geofence' }} />
                  </React.Fragment>
                ))}
              </MapContainer>

              {/* Telemetry HUD */}
              {trackingData.telemetry && (
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', pointerEvents: 'none' }}>
                  {Object.entries(trackingData.telemetry).map(([key, val]) => (
                    <div key={key} style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', padding: '0.5rem 0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                      <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>{key}</span>
                      <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{val}</strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <Card title="AI Prediction">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', 
                    backgroundColor: 'var(--primary-light)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    <Zap size={28} color="var(--primary-color)" />
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Estimated Arrival</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{trackingData.eta}</h3>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Risk Level: <span style={{ fontWeight: 'bold', color: trackingData.delayRisk === 'None' ? 'var(--status-arrived)' : 'var(--status-pending)' }}>{trackingData.delayRisk}</span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Operational Status">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Flight Connection</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Active</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sensor Grid</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--status-arrived)' }}>100% Online</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Shipment Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>AWB:</span>
                  <strong style={{ fontSize: '1.125rem' }}>{trackingData.awb}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Carrier:</span>
                  <strong>{trackingData.carrier}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span style={{ 
                    backgroundColor: trackingData.status === 'Delivered' ? 'var(--status-arrived)15' : 'var(--status-transit)15', 
                    color: trackingData.status === 'Delivered' ? 'var(--status-arrived)' : 'var(--status-transit)', 
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: '600' 
                  }}>
                    {trackingData.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Flight:</span>
                  <strong>{trackingData.flight}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Weight:</span>
                  <strong>{trackingData.weight}</strong>
                </div>
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Latest Update</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.9rem' }}>{trackingData.events[trackingData.events.length - 1].status}</p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{trackingData.events[trackingData.events.length - 1].location}</p>
                </div>
              </div>
            </Card>

            <Card title="Journey History">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {trackingData.events.map((event, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    {i !== trackingData.events.length - 1 && (
                      <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-12px', width: '2px', backgroundColor: event.completed ? 'var(--primary-color)' : 'var(--border-color)' }}></div>
                    )}
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: event.completed ? 'var(--primary-color)' : 'var(--bg-primary)', border: `2px solid ${event.completed ? 'var(--primary-color)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      {event.completed && <CheckCircle size={14} color="#fff" />}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600' }}>{event.status}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{event.location} • {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <MapPin size={80} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem' }}>Awaiting Cargo ID</h2>
          <p>Global logistics grid online. Enter AWB to begin.</p>
        </div>
      )}
    </div>
  );
};

export default Tracking;
