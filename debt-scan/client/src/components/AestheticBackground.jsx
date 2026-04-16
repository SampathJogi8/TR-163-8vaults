import React from 'react';

const AestheticBackground = ({ children }) => {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg)' }}>
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 grid-bg opacity-100 pointer-events-none z-0" />
      {/* Noise overlay */}
      <div className="noise-overlay" />
      {/* Accent radial glow - top */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(191,255,0,0.06) 0%, transparent 70%)',
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AestheticBackground;
