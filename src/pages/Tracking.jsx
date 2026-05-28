import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plane, AlertTriangle, CheckCircle, Zap, ExternalLink, Globe } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import Card from '../components/Card';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { trackShipment, getSearchHistory, runShipmentAIAnalysis } from '../services/dataService';

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
  const [carrierUrl, setCarrierUrl] = useState(null);
  const [carrierName, setCarrierName] = useState(null);
  const [animatedPos, setAnimatedPos] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [aiRunning, setAiRunning] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const list = await getSearchHistory();
        setHistoryList(list);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistory();
  }, [trackingData]);

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

  const trackAwbValue = async (awbValue) => {
    if (!awbValue.trim()) return;
    setLoading(true);
    setError(null);
    setCarrierUrl(null);
    setCarrierName(null);
    try {
      const result = await trackShipment(awbValue);
      setCarrierUrl(result.carrierUrl || null);
      setCarrierName(result.carrierName || null);
      if (result.success) {
        setTrackingData(result.data);
        setError(null);
      } else {
        setError(result.message);
        if (result.data) {
          setTrackingData(result.data);
        } else {
          setTrackingData(null);
        }
      }
    } catch (err) {
      setError("Unable to connect to tracking servers.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    trackAwbValue(awb);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlAwb = params.get('awb');
    if (urlAwb) {
      setAwb(urlAwb);
      trackAwbValue(urlAwb);
    }
  }, []);

  const handleRunAI = () => {
    if (!trackingData) return;
    setAiRunning(true);
    setTimeout(async () => {
      try {
        const updated = await runShipmentAIAnalysis(trackingData.awb);
        setTrackingData(updated);
      } catch (err) {
        console.error("Failed to run AI analysis:", err);
      } finally {
        setAiRunning(false);
      }
    }, 1500);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ borderLeft: '4px solid var(--status-delayed)', backgroundColor: 'var(--status-delayed)10' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', color: 'var(--status-delayed)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertTriangle size={24} />
                <p style={{ margin: 0, fontWeight: '600' }}>{error}</p>
              </div>
              {carrierUrl && (
                <a 
                  href={carrierUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    textDecoration: 'none', 
                    padding: '0.5rem 1.25rem', 
                    fontSize: '0.875rem',
                    height: 'auto',
                    backgroundColor: 'var(--primary-color)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  <ExternalLink size={16} />
                  Track on {carrierName}
                </a>
              )}
            </div>
          </Card>

          {/* Live Data Iframe Fallback */}
          <Card style={{ padding: 0, overflow: 'hidden', height: '600px', position: 'relative' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={18} color="var(--primary-color)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Live Global Tracking</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Connected via Track-Trace
              </span>
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 53px)', backgroundColor: '#fff' }}>
              <iframe 
                src={`https://www.track-trace.com/aircargo?search=${awb.replace(/[\s-]/g, '')}`}
                width="100%" 
                height="100%" 
                frameBorder="0"
                title="Live Carrier Tracking"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </Card>
        </div>
      )}

      {trackingData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {trackingData.currentLocation && trackingData.route && trackingData.route.length > 0 ? (
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
            ) : (
              <Card style={{ height: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                <MapPin size={48} color="var(--primary-color)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '1rem' }}>No Map Data Available</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Route and live coordinates are not provided by carrier.</p>
              </Card>
            )}

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: (trackingData.status === 'Delivered' || trackingData.status === 'Arrived') ? '1fr' : '1fr 1fr', 
              gap: '1.5rem' 
            }}>
              {trackingData.status !== 'Delivered' && trackingData.status !== 'Arrived' && (
                <Card title="AI Prediction">
                  {trackingData.aiAnalysisRun ? (
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
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
                        AI Delay Predictions are ready for this active flight.
                      </p>
                      <button 
                        type="button"
                        onClick={handleRunAI} 
                        disabled={aiRunning}
                        className="btn-primary" 
                        style={{ 
                          width: '100%', 
                          height: '40px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem',
                          fontSize: '0.875rem' 
                        }}
                      >
                        {aiRunning ? (
                          <>
                            <span className="animate-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                            Analyzing weather & air traffic...
                          </>
                        ) : (
                          <>
                            <Zap size={16} />
                            Run AI Delay Analysis
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </Card>
              )}

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
                {trackingData.events && trackingData.events.length > 0 ? (
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Latest Update</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.9rem' }}>
                      {trackingData.events[trackingData.events.length - 1]?.status || 'N/A'}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {trackingData.events[trackingData.events.length - 1]?.location || ''}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Latest Update</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.9rem' }}>No updates available</p>
                  </div>
                )}
              </div>
            </Card>

            {trackingData.events && trackingData.events.length > 0 && (
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
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {historyList.length > 0 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Search History</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {historyList.map((item, idx) => (
                  <Card 
                    key={idx} 
                    style={{ 
                      cursor: 'pointer', 
                      borderLeft: `4px solid ${item.status === 'Delivered' || item.status === 'Arrived' ? 'var(--status-arrived)' : 'var(--status-transit)'}`,
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onClick={() => {
                      setAwb(item.awb);
                      trackAwbValue(item.awb);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>{item.awb}</strong>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: '600',
                        backgroundColor: `${item.status === 'Delivered' || item.status === 'Arrived' ? 'var(--status-arrived)' : 'var(--status-transit)'}15`,
                        color: item.status === 'Delivered' || item.status === 'Arrived' ? 'var(--status-arrived)' : 'var(--status-transit)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div><span style={{ fontWeight: '500' }}>Carrier:</span> {item.carrier}</div>
                      <div><span style={{ fontWeight: '500' }}>Route:</span> {item.origin.split(' - ')[0]} → {item.destination.split(' - ')[0]}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <MapPin size={80} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem' }}>Awaiting Cargo ID</h2>
            <p>Global logistics grid online. Enter AWB to begin.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
