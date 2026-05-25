import React, { useState, useEffect } from 'react';
import { Search, Package, Plane, CheckCircle, Clock, MapPin, FileText, AlertCircle, ExternalLink, Globe, Loader2, Download, Mail, Calendar, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { trackShipment, getCarrierTrackingUrl, getSearchHistory, runShipmentAIAnalysis } from '../services/dataService';
import { generateShipmentPDF } from '../utils/pdfGenerator';
import EmailModal from '../components/EmailModal';

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
  const [carrierUrl, setCarrierUrl] = useState(null);
  const [carrierName, setCarrierName] = useState(null);
  const [trackingSource, setTrackingSource] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const list = await getSearchHistory();
        setHistoryList(list);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };
    fetchHistory();
  }, [trackingData]);

  const trackAwbValue = async (awbValue) => {
    if (!awbValue.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setTrackingData(null);
    setCarrierUrl(null);
    setCarrierName(null);
    setTrackingSource(null);
    
    try {
      const result = await trackShipment(awbValue);
      
      setCarrierUrl(result.carrierUrl || null);
      setCarrierName(result.carrierName || null);
      setTrackingSource(result.source || null);

      if (result.success) {
        const mappedData = {
          ...result.data,
          events: (result.data.events || []).map(event => ({
            ...event,
            icon: ICON_MAP[event.type] || Package
          }))
        };
        setTrackingData(mappedData);
      } else {
        setError(result.message);
        if (result.data) {
          setTrackingData(result.data);
        }
      }
    } catch (err) {
      setError("An error occurred while connecting to the tracking system. Please try again.");
      const fallback = getCarrierTrackingUrl(awbValue);
      setCarrierUrl(fallback.url);
      setCarrierName(fallback.carrierName);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    trackAwbValue(awb);
  };

  const openCarrierWebsite = () => {
    if (carrierUrl) {
      window.open(carrierUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const openFallbackTracker = () => {
    const cleaned = awb.replace(/[\s-]/g, '');
    window.open(`https://www.track-trace.com/aircargo?search=${cleaned}`, '_blank', 'noopener,noreferrer');
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
        <a href="/dashboard" className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
          Dashboard
        </a>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
        
        {/* Search Section */}
        <div className="w-full text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Track Your Cargo</h1>
          <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enter your Air Waybill (AWB) number to get real-time status updates.</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <div className={`absolute inset-y-0 left-4 pl-0 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="e.g. 157-89692853"
              className={`block w-full pl-14 pr-32 py-5 rounded-2xl border transition-all focus:ring-4 outline-none text-lg uppercase tracking-wider ${
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
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : 'Track'}
            </button>
          </form>

          {/* AWB Format Hint */}
          <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
            Format: 3-digit airline prefix + hyphen + 8-digit number (e.g. 157-89692853)
          </p>
        </div>

        {/* Live Data Iframe Fallback */}
        {error && (
          <div className={`w-full rounded-3xl overflow-hidden border mb-8 animate-fade-in ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                <h3 className="font-semibold">Live Global Tracking</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-white border text-gray-600'}`}>
                Connected via Track-Trace
              </span>
            </div>
            <div className="w-full h-[600px] bg-white relative">
              <iframe 
                src={`https://www.track-trace.com/aircargo?search=${awb.replace(/[\s-]/g, '')}`}
                width="100%" 
                height="100%" 
                frameBorder="0"
                title="Live Carrier Tracking"
                className="w-full h-full absolute inset-0"
              />
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

            {/* Source Badge */}
            {trackingSource && (
              <div className={`flex items-center justify-center gap-2 mb-4`}>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  trackingSource === 'local' 
                    ? 'bg-emerald-500/20 text-emerald-500' 
                    : trackingSource === 'carrier_scrape' 
                    ? 'bg-blue-500/20 text-blue-500' 
                    : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {trackingSource === 'local' ? '📦 Local Record' 
                    : trackingSource === 'carrier_scrape' ? '🛫 Live from Carrier' 
                    : '🔗 Carrier Redirect'}
                </span>
              </div>
            )}

            {/* Summary Card */}
            <div className={`w-full rounded-3xl p-8 mb-8 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'} relative overflow-hidden`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4">{trackingData.awb}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-500 font-semibold rounded-full text-sm flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      {trackingData.status}
                    </span>
                    {trackingData.carrier && (
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {trackingData.carrier}
                      </span>
                    )}
                    {trackingData.estimatedDelivery && (
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Expected: {trackingData.estimatedDelivery}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => generateShipmentPDF(trackingData)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>

                  {carrierUrl && (
                    <button
                      onClick={openCarrierWebsite}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md border border-blue-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track on {carrierName}
                    </button>
                  )}
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

            {/* AI Prediction Section */}
            {trackingData.status !== 'Delivered' && trackingData.status !== 'Arrived' && (
              <div className={`w-full rounded-3xl p-6 mb-8 border flex flex-col md:flex-row items-center justify-between gap-4 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/50'
              }`}>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm">AI Delay Prediction</h3>
                    {trackingData.aiAnalysisRun ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                        Risk Level: <strong style={{ color: trackingData.delayRisk === 'None' ? '#10b981' : '#f59e0b' }}>{trackingData.delayRisk}</strong> • {trackingData.delayReason}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                        Predict potential transit delays using air traffic and meteorological models.
                      </p>
                    )}
                  </div>
                </div>
                {!trackingData.aiAnalysisRun ? (
                  <button
                    onClick={async () => {
                      const updated = await runShipmentAIAnalysis(trackingData.awb);
                      setTrackingData(prev => ({
                        ...prev,
                        ...updated
                      }));
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Run AI Analysis
                  </button>
                ) : (
                  <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                    Analysis Completed
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            {(trackingData.flightSegments || (trackingData.events && trackingData.events.length > 0)) && (
            <div className={`w-full rounded-3xl p-8 mb-8 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
              
              {/* Horizontal Flight Segments Visual */}
              {trackingData.flightSegments && trackingData.flightSegments.length > 0 && (
                <div className="mb-12 overflow-x-auto pb-4">
                  <div className="flex items-center min-w-[600px] justify-center px-8">
                    {/* First Node */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center mb-2 z-10 relative"></div>
                      <span className="text-gray-500 font-semibold">{trackingData.flightSegments[0].origin}</span>
                    </div>

                    {trackingData.flightSegments.map((segment, idx) => (
                      <React.Fragment key={idx}>
                        {/* Connecting Line & Flight Pill */}
                        <div className="flex-1 flex flex-col items-center justify-center relative -mx-2">
                          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-400 dark:bg-gray-600 -translate-y-1/2"></div>
                          
                          {/* Flight Pill */}
                          <div className={`relative z-10 flex flex-col items-center px-4 py-1.5 rounded-full border text-xs font-medium -mt-10 ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700 shadow-sm'
                          }`}>
                            <div className="font-bold mb-1 text-[10px]">{segment.flight}</div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center">
                                <span>{segment.pieces}</span>
                                <span>Pcs</span>
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-1">
                                  <Plane className="w-3 h-3 text-blue-500 transform rotate-45" />
                                  <span>{segment.depTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Plane className="w-3 h-3 text-emerald-500 transform rotate-135" />
                                  <span>{segment.arrTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Destination Node */}
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 relative"
                            style={{
                              backgroundColor: idx === trackingData.flightSegments.length - 1 ? 'var(--primary-color)' : 'var(--text-secondary)',
                              color: '#fff',
                              boxShadow: idx === trackingData.flightSegments.length - 1 ? '0 4px 14px rgba(255, 106, 0, 0.4)' : 'none'
                            }}
                          >
                            {idx === trackingData.flightSegments.length - 1 && <MapPin className="w-5 h-5" />}
                          </div>
                          <span className="text-gray-500 font-semibold text-center w-full">{segment.destination}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Vertical Event List */}
              <div className="relative ml-4 md:ml-12 pt-4">
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: '9px', top: '30px', bottom: '30px', width: '2px', borderLeft: '2px dashed var(--border-color)' }}></div>
                
                {trackingData.events && trackingData.events.map((event, idx) => {
                  const isDelivered = event.status && event.status.toLowerCase().includes('delivered');
                  const isFirst = idx === 0;
                  
                  return (
                    <div key={idx} className={`relative flex items-center justify-between py-6 ${idx !== trackingData.events.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
                      {/* Timeline Dot */}
                      <div 
                        className="absolute left-0 rounded-full flex items-center justify-center z-10"
                        style={{
                          width: '20px', height: '20px',
                          backgroundColor: isFirst ? 'var(--primary-color)' : 'var(--text-secondary)',
                          boxShadow: isFirst ? '0 0 0 4px var(--primary-light)' : `0 0 0 4px var(--bg-primary)`
                        }}
                      ></div>

                      {/* Left Side: Status & Details */}
                      <div className="ml-10 flex flex-col">
                        <span className={`text-base font-semibold ${isDelivered ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {event.status}
                        </span>
                        {event.details && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {event.details}
                          </span>
                        )}
                      </div>

                      {/* Right Side: Date & Time */}
                      <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mt-0.5 opacity-60" />
                        <div className="text-right whitespace-pre-line leading-tight">
                          {event.time.replace(' ', '\n')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* Bottom Action Bar */}
            <div className={`w-full rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-lg'
            }`}>
              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Need more details? Track directly on the carrier's official website.
                </p>
              </div>
              <div className="flex gap-2">
                {carrierUrl && (
                  <button
                    onClick={openCarrierWebsite}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {carrierName}
                  </button>
                )}
                <button
                  onClick={openFallbackTracker}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    theme === 'dark' ? 'bg-white/10 hover:bg-white/15 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Track-Trace.com
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search History */}
        {!trackingData && !isSearching && historyList.length > 0 && (
          <div className="w-full max-w-2xl mb-8 animate-fade-in">
            <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Recent Searches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {historyList.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setAwb(item.awb);
                    trackAwbValue(item.awb);
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                    theme === 'dark' 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                      : 'bg-white border-gray-100 hover:shadow-md'
                  }`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: item.status === 'Delivered' || item.status === 'Arrived' ? '#10b981' : '#f59e0b' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-blue-500">{item.awb}</strong>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'Delivered' || item.status === 'Arrived'
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">Carrier: {item.carrier}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results yet - show carrier buttons if AWB was entered */}
        {!trackingData && !error && !isSearching && awb.trim().length >= 3 && (
          <div className={`w-full max-w-2xl text-center p-8 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-lg'}`}>
            <Globe className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Press Track to search, or go directly to the carrier's website:
            </p>
            <div className="flex justify-center gap-3">
              {(() => {
                const info = getCarrierTrackingUrl(awb);
                return info ? (
                  <button
                    onClick={() => window.open(info.url, '_blank')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open {info.carrierName}
                  </button>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        trackingData={trackingData} 
      />
    </div>
  );
}
