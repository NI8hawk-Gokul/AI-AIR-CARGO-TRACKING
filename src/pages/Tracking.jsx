import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Search, MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const planeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61212.png',
  iconSize: [24, 24],
  className: 'leaflet-plane-icon'
});

const Tracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    
    // Simulate API call for live tracking
    setTimeout(() => {
      setTrackingData({
        awb: searchQuery,
        status: 'In Transit',
        origin: 'Dubai (DXB)',
        destination: 'London (LHR)',
        flight: 'EK502',
        eta: 'In 3h 45m',
        delayRisk: 'Low',
        currentLocation: [48.8566, 2.3522], // Paris (mid-flight)
        route: [
          [25.2532, 55.3657], // DXB
          [48.8566, 2.3522],  // Current
          [51.4700, -0.4543]  // LHR
        ]
      });
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Live Shipment Tracking</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter AWB or Tracking URL to find real-time cargo location.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter AWB Number or URL..." 
              style={{ paddingLeft: '3rem', fontSize: '1.125rem', padding: '1rem 1rem 1rem 3rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0 2rem' }}>
            {isSearching ? 'Locating...' : 'Track Live'}
          </button>
        </form>
      </Card>

      {trackingData && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Shipment Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>AWB:</span>
                  <strong style={{ fontSize: '1.125rem' }}>{trackingData.awb}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span style={{ 
                    backgroundColor: 'var(--status-transit)15', color: 'var(--status-transit)', 
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: '600' 
                  }}>
                    {trackingData.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Flight:</span>
                  <strong>{trackingData.flight}</strong>
                </div>
              </div>
            </Card>

            <Card title="AI Prediction">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Clock size={24} color="var(--status-arrived)" />
                <div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Estimated Time of Arrival</p>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>{trackingData.eta}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertTriangle size={24} color="var(--status-arrived)" />
                <div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Delay Risk</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--status-arrived)' }}>{trackingData.delayRisk} - On Schedule</p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Live Exact Location" style={{ padding: 0, overflow: 'hidden', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ padding: '1.5rem 1.5rem 0 1.5rem', margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Live Exact Location</h3>
            <div style={{ flex: 1, marginTop: '1rem' }}>
              <MapContainer center={trackingData.currentLocation} zoom={4} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={trackingData.route} color="var(--primary-color)" weight={3} dashArray="10, 10" />
                <Marker position={trackingData.route[0]}>
                  <Popup>{trackingData.origin}</Popup>
                </Marker>
                <Marker position={trackingData.currentLocation} icon={planeIcon}>
                  <Popup>Current Location: Flight {trackingData.flight}</Popup>
                </Marker>
                <Marker position={trackingData.route[2]}>
                  <Popup>{trackingData.destination}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tracking;
