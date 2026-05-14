import React, { useState } from 'react';
import { Search, Package, Plane, CheckCircle, Clock, MapPin, FileText, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { trackShipment } from '../services/dataService';

const ICON_MAP = {
  'package': Package,
  'plane': Plane,
  'check-circle': CheckCircle,
  'clock': Clock,
  'map-pin': MapPin,
  'file-text': FileText
};

export default function PublicTracking() {
  const { theme } = useTheme();
  const [awb, setAwb] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!awb.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setTrackingData(null);
    
    try {
      const result = await trackShipment(awb);
      if (result.success) {
        // Map icon strings to components
        const mappedData = {
          ...result.data,
          events: result.data.events.map(event => ({
            ...event,
            icon: ICON_MAP[event.type] || Package
          }))
        };
        setTrackingData(mappedData);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred while connecting to the tracking system. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`w-full py-6 px-8 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/10 bg-white/5 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-md'} sticky top-0 z-50`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Plane className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">AeroTrack <span className="text-blue-500">Logistics</span></span>
        </div>
        <a href="/login" className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
          Staff Login
        </a>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
        
        {/* Search Section */}
        <div className="w-full text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Track Your Cargo</h1>
          <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enter your Air Waybill (AWB) number to get real-time status updates.</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="e.g. AWB-12345678"
              className={`block w-full pl-12 pr-32 py-5 rounded-2xl border transition-all focus:ring-4 outline-none text-lg uppercase tracking-wider ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 shadow-sm'
              }`}
            />
            <button
              type="submit"
              disabled={isSearching || !awb.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {isSearching ? <span className="animate-pulse">Locating...</span> : 'Track'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`w-full max-w-2xl mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Summary Card */}
            <div className={`w-full rounded-3xl p-8 mb-8 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'} relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-110 duration-700`}></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">{trackingData.awb}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-500 font-semibold rounded-full text-sm flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      {trackingData.status}
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Expected: {trackingData.estimatedDelivery}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Origin</p>
                  <p className="font-semibold">{trackingData.origin}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Destination</p>
                  <p className="font-semibold">{trackingData.destination}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Weight</p>
                  <p className="font-semibold">{trackingData.weight}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pieces</p>
                  <p className="font-semibold">{trackingData.pieces}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className={`w-full rounded-3xl p-8 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
              <h3 className="text-xl font-bold mb-8">Shipment Journey</h3>
              <div className="relative border-l-2 border-dashed border-gray-300 dark:border-gray-700 ml-6 pb-4">
                {trackingData.events.map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <div key={idx} className="mb-10 ml-10 relative group">
                      <div className={`absolute -left-[53px] w-12 h-12 rounded-full flex items-center justify-center border-4 ${theme === 'dark' ? 'border-[#0f0f13]' : 'border-white'} ${event.completed ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : (theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400')} transition-transform group-hover:scale-110`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-semibold ${event.completed ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}`}>{event.status}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm font-medium ${event.completed ? 'text-blue-500' : (theme === 'dark' ? 'text-gray-600' : 'text-gray-400')}`}>{event.time}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
