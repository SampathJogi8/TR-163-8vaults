import React from 'react';

const AestheticBackground = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-[#010101] selection:bg-white/10 relative overflow-x-hidden ${className}`}>
      {/* Universal Aesthetic Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="star-field" />
        <div className="mesh-gradient" />
        <div className="noise-overlay" />
        <div className="horizon-arc" />
      </div>


      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AestheticBackground;
