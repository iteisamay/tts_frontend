import React from 'react'

function Loader({ size = 'medium', color = '#3498db', className = '' }) {
      const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const spinnerSize = sizeMap['small'];
      const containerStyle= {
    display: 'inline-block',
    position: 'relative',
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
  };

  const spinnerStyle= {
    boxSizing: 'border-box',
    display: 'block',
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: `${Math.max(2, spinnerSize / 10)}px solid ${color}`,
    borderRadius: '50%',
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  };
      const styleElement = (
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  );

  return (
    <>
      {styleElement}
      <div style={containerStyle} className={className}>
        <div style={spinnerStyle} />
      </div>
    </>
  );
}

export default Loader