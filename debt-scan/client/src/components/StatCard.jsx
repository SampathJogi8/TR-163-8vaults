import React from 'react';

const StatCard = ({ label, value, subtext, icon, unit, color }) => {
  const colorMap = {
    green: { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#22c55e' },
    red:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#ef4444' },
    amber: { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  text: '#f59e0b' },
    lime:  { bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)', text: '#A78BFA' },
  };
  const c = colorMap[color] || colorMap.lime;

  return (
    <div className="crypton-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {icon && (
          <span
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
          >
            {React.cloneElement(icon, { size: 14 })}
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="stat-value" style={{ color: c.text }}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold pb-1" style={{ color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>
      {subtext && (
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {subtext}
        </span>
      )}
    </div>
  );
};

export default StatCard;
