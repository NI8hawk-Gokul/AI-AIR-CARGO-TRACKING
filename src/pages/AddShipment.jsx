import React, { useState } from 'react';
import Card from '../components/Card';
import { Send } from 'lucide-react';

const AddShipment = () => {
  const [formData, setFormData] = useState({
    awb: '',
    origin: '',
    destination: '',
    weight: '',
    flight: '',
    date: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Shipment added successfully!');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Add New Shipment</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter the Air Waybill and cargo details below to start tracking.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>AWB Number</label>
              <input type="text" name="awb" required className="input-field" placeholder="e.g. 176-12345678" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Flight Number</label>
              <input type="text" name="flight" className="input-field" placeholder="e.g. EK502" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Origin Airport</label>
              <input type="text" name="origin" required className="input-field" placeholder="e.g. DXB" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Destination Airport</label>
              <input type="text" name="destination" required className="input-field" placeholder="e.g. LHR" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight (kg)</label>
              <input type="number" name="weight" className="input-field" placeholder="0.00" onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Departure Date</label>
              <input type="date" name="date" className="input-field" onChange={handleChange} />
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
