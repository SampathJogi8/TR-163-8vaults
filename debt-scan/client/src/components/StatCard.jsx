import React from 'react';

const StatCard = ({ label, value, unit, subtext, color = 'accent', icon }) => {
  const colorMap = {
    accent: 'text-accent neon-text',
    red: 'text-red-500 neon-text',
    amber: 'text-amber-500 neon-text',
    green: 'text-green-500 neon-text',
    white: 'text-white'
  };

  const glowMap = {
    accent: 'bg-accent/10',
    red: 'bg-red-500/10',
    amber: 'bg-amber-500/10',
    green: 'bg-green-500/10',
    white: 'bg-white/5'
  };

  return (
    <div className="glass-panel p-8 rounded-[2rem] relative group overflow-hidden transition-premium hover:border-white/20">
      {/* Background Glow Bleed */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-premium pointer-events-none ${glowMap[color] || glowMap.accent}`} />
      
      <div className="absolute top-0 right-0 p-8 text-white/[0.03] group-hover:text-white/[0.08] transition-premium group-hover:scale-110">
        {React.cloneElement(icon, { size: 24, strokeWidth: 1.5 }) || null}
      </div>

      <div className="relative z-10">
        <h3 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-5">{label}</h3>
        <div className="flex items-baseline gap-2">
          <div className={`text-5xl font-black font-['Outfit'] tracking-tighter ${colorMap[color] || colorMap.white}`}>
            {value}
          </div>
          {unit && <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">{unit}</span>}
        </div>
        {subtext && (
          <p className="text-gray-700 text-[10px] font-black mt-4 uppercase tracking-[0.1em] border-t border-white/5 pt-4">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
