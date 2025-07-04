import React from 'react';

const footerStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'center',
  padding: '1rem 0',
  fontSize: '0.85rem',
  color: '#9CA3AF',
  backgroundColor: 'transparent',
  marginTop: 'auto'
};

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={footerStyle}>
      © {year} CS Marítimo Fans. All rights reserved.
    </footer>
  );
};

export default Footer; 