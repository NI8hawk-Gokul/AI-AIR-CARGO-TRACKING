import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Search, MapPin, Navigation, Clock, AlertTriangle, Bell, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { trackShipment } from '../services/dataService';

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
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showGeofenceAlert, setShowGeofenceAlert] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowGeofenceAlert(false);
    setError(null);
    setTrackingData(null);
    
    try {
      const result = await trackShipment(searchQuery);
      if (result.success) {
        setTrackingData(result.data);
        
        // Simulate Geofence Entry Alert after a short delay for live shipments
        if (result.data.status === 'In Transit') {
          setTimeout(() => {
            setShowGeofenceAlert(true);
            setTimeout(() => setShowGeofenceAlert(false), 6000);
          }, 1500);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Unable to connect to live tracking servers. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const geofenceOptions = { color: 'var(--primary-color)', fillColor: 'var(--primary-color)', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' };

  return (
    <div className="animate-fade-in relative" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Geofence Alert Toast */}
      {showGeofenceAlert && (
        <div className="fixed top-24 right-8 z-50 animate-fade-in-up">
          <div className={`flex items-center gap-4 p-4 rounded-xl shadow-2xl border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm">Geofence Event Triggered</p>
              <p className="text-sm opacity-80">Flight {trackingData?.flight} has entered the <span className="font-semibold text-blue-500">Local Airspace</span> zone.</p>
            </div>
            <button onClick={() => setShowGeofenceAlert(false)} className="ml-4 opacity-50 hover:opacity-100">&times;</button>
          </div>
        </div>
      )}

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

      {error && (
        <div className={`flex items-center gap-4 p-4 rounded-xl border animate-fade-in ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

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
                  <span style={{ color: 'var(--text-secondary)' }}>Route:</span>
                  <strong style={{ fontSize: '0.9rem' }}>{trackingData.origin.split(' - ')[0]} ➔ {trackingData.destination.split(' - ')[0]}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Flight:</span>
                  <strong>{trackingData.flight}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Weight / Pieces:</span>
                  <strong>{trackingData.weight} / {trackingData.pieces}</strong>
                </div>
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Update</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.9rem' }}>
                    {trackingData.events[trackingData.events.length - 1].status} at {trackingData.events[trackingData.events.length - 1].location}
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {trackingData.events[trackingData.events.length - 1].time}
                  </p>
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
                <AlertTriangle size={24} color={trackingData.delayRisk === 'None' ? 'var(--status-arrived)' : 'var(--status-transit)'} />
                <div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Delay Risk</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: trackingData.delayRisk === 'None' ? 'var(--status-arrived)' : 'var(--status-transit)' }}>
                    {trackingData.delayRisk} {trackingData.delayRisk === 'None' ? '- Completed' : '- On Schedule'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Live Exact Location" style={{ padding: 0, overflow: 'hidden', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center" style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Live Exact Location & Geofences</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                Geofencing Active
              </div>
            </div>
            <div style={{ flex: 1, marginTop: '1rem' }}>
              <MapContainer center={trackingData.currentLocation} zoom={3} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Geofences */}
                <Circle center={trackingData.route[0]} radius={400000} pathOptions={geofenceOptions}>
                  <Popup>Origin Hub Geofence ({trackingData.origin.split(' - ')[0]})</Popup>
                </Circle>
                
                {trackingData.route.length > 2 && (
                  <Circle center={trackingData.route[1]} radius={300000} pathOptions={geofenceOptions}>
                    <Popup>Transit/Checkpoint Geofence</Popup>
                  </Circle>
                )}

                <Circle center={trackingData.route[trackingData.route.length - 1]} radius={400000} pathOptions={geofenceOptions}>
                  <Popup>Destination Hub Geofence ({trackingData.destination.split(' - ')[0]})</Popup>
                </Circle>

                <Polyline positions={trackingData.route} color="var(--primary-color)" weight={3} dashArray="10, 10" />
                
                <Marker position={trackingData.route[0]}>
                  <Popup>Origin: {trackingData.origin}</Popup>
                </Marker>

                {trackingData.status === 'In Transit' && (
                  <Marker position={trackingData.currentLocation} icon={planeIcon}>
                    <Popup>Current Location: Flight {trackingData.flight}</Popup>
                  </Marker>
                )}

                <Marker position={trackingData.route[trackingData.route.length - 1]}>
                  <Popup>Destination: {trackingData.destination}</Popup>
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
