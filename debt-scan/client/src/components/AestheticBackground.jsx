import React from 'react';

const AestheticBackground = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative" style={{ background: 'var(--bg)' }}>
      {/* Subtle purple grid */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      {/* Noise */}
      <div className="noise-overlay" />

      {/* Big purple radial glow — top left (like Crypton screenshot) */}
      <div
        className="fixed top-0 left-0 w-[700px] h-[700px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 0% 0%, rgba(109,40,217,0.22) 0%, transparent 70%)',
        }}
      />
      {/* Smaller glow — top right */}
      <div
        className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 100% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Bottom center glow */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(109,40,217,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AestheticBackground;
