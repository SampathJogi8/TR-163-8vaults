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

      {/* Top Navigation Watermark (Common for all sub-pages) */}
      <div className="fixed top-10 left-10 z-20 flex items-center gap-4 opacity-40 hover:opacity-100 transition-premium cursor-crosshair">
        <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded-lg font-black text-[10px]">DS</div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Intelligence</span>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AestheticBackground;
