import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Bell, User } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ flex: 1 }}>
        {/* Search could go here */}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={toggleTheme} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
        </button>

        <button style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative'
        }}>
          <Bell size={22} />
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px', backgroundColor: 'var(--status-delayed)',
            width: '8px', height: '8px', borderRadius: '50%'
          }}></span>
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
          }}>
            <User size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>Admin User</p>
            <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-secondary)' }}>admin@airtrack.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
