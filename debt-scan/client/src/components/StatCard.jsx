import React from 'react';

const StatCard = ({ label, value, unit, subtext, color = 'accent', icon }) => {
  const colorMap = {
    accent: 'text-accent neon-text',
    red: 'text-red-500 neon-text',
    amber: 'text-amber-500 neon-text',
    green: 'text-green-500 neon-text',
    white: 'text-white'
  };

  return (
    <div className="glass-panel p-8 rounded-[1.75rem] relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-white/[0.03] group-hover:text-white/[0.06] transition-premium">
        {icon || null}
      </div>
      <h3 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.25em] mb-4">{label}</h3>
      <div className="flex items-baseline gap-2">
        <div className={`text-5xl font-black font-['Outfit'] tracking-tighter ${colorMap[color] || colorMap.white}`}>{value}</div>
        {unit && <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{unit}</span>}
      </div>
      {subtext && <p className="text-gray-700 text-[10px] font-black mt-3 uppercase tracking-widest leading-relaxed leading-none">{subtext}</p>}
    </div>
  );
};

export default StatCard;
