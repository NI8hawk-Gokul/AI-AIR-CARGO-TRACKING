import React from 'react';

const Card = ({ children, title, style, className = '' }) => {
  return (
    <div className={`glass-panel ${className}`} style={{ padding: '1.5rem', ...style }}>
      {title && (
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: 'var(--text-primary)'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
