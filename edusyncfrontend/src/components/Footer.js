import React from 'react';

const Footer = () => {
  return (
    <footer
      className="text-center py-3 shadow-sm"
      style={{
        backgroundColor: '#1a237e',  // deep navy
        color: '#fbc02d',            // golden yellow text
        fontWeight: '500',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)',
        userSelect: 'none',
        fontSize: '0.9rem',
      }}
    >
      <div>
        Built and cared for by <strong style={{color: '#ffe761'}}>Kanishk Sharma</strong> {' '}
        <span role="img" aria-label="love" style={{ fontSize: '1.2rem' }}>❤️</span> with support.
      </div>
    </footer>
  );
};

export default Footer;
