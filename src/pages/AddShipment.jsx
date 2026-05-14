import React, { useState, useRef } from 'react';
import Card from '../components/Card';
import { Send, UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AddShipment = () => {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    awb: '',
    origin: '',
    destination: '',
    weight: '',
    flight: '',
    date: ''
  });

  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Shipment added successfully!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setParseSuccess(false);

    // Simulate AI OCR Parsing
    setTimeout(() => {
      setFormData({
        awb: '123-12323244223',
        origin: 'JFK',
        destination: 'LHR',
        weight: '1500',
        flight: 'BA112',
        date: new Date().toISOString().split('T')[0]
      });
      setIsParsing(false);
      setParseSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setParseSuccess(false), 3000);
    }, 2500);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Add New Shipment</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter the Air Waybill details or upload a document to auto-fill using AI.</p>
      </div>

      <Card>
        {/* AI OCR Upload Section */}
        <div className={`mb-8 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isParsing ? 'border-blue-500 bg-blue-500/5' : 
          parseSuccess ? 'border-green-500 bg-green-500/5' : 
          theme === 'dark' ? 'border-gray-700 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'
        }`}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,image/*" 
          />
          
          {isParsing ? (
            <div className="flex flex-col items-center gap-3 text-blue-500">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-medium text-lg">AI is extracting document details...</p>
            </div>
          ) : parseSuccess ? (
            <div className="flex flex-col items-center gap-3 text-green-500">
              <CheckCircle className="w-10 h-10" />
              <p className="font-medium text-lg">Data extracted successfully!</p>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center gap-4 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <UploadCloud className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">Upload AWB or Invoice</p>
                <p className="text-sm text-gray-500">AI will automatically read the PDF or Image and fill the form below.</p>
              </div>
              <button type="button" className={`px-4 py-2 mt-2 rounded-lg text-sm font-medium border ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}>
                Select File
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>AWB Number</label>
              <input type="text" name="awb" value={formData.awb} required className="input-field" placeholder="e.g. 176-12345678" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Flight Number</label>
              <input type="text" name="flight" value={formData.flight} className="input-field" placeholder="e.g. EK502" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Origin Airport</label>
              <input type="text" name="origin" value={formData.origin} required className="input-field" placeholder="e.g. DXB" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Destination Airport</label>
              <input type="text" name="destination" value={formData.destination} required className="input-field" placeholder="e.g. LHR" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} className="input-field" placeholder="0.00" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Departure Date</label>
              <input type="date" name="date" value={formData.date} className="input-field" onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary">
              <Send size={18} />
              Save Shipment
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddShipment;
