import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Lock, Mail } from 'lucide-react';
import Card from '../components/Card';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Admin');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--primary-light) 100%)'
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            marginBottom: '1rem',
            boxShadow: '0 8px 16px rgba(255, 106, 0, 0.3)'
          }}>
            <Plane size={32} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>AirTrack AI</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Centralized Cargo Management System</p>
        </div>

        <Card style={{ padding: '2.5rem' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Role</label>
              <select 
                className="input-field" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option>Admin</option>
                <option>Cargo Staff</option>
                <option>Operations Team</option>
                <option>Manager</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="email" required className="input-field" placeholder="Enter your email" style={{ paddingLeft: '2.75rem' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="password" required className="input-field" placeholder="Enter password" style={{ paddingLeft: '2.75rem' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
              Sign In to {role}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
