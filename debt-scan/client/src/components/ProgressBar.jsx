import React from 'react';

const ProgressBar = ({ progress = 0, message = '' }) => {
  return (
    <div className="w-full space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        <span className="truncate max-w-[70%]">{message || 'Initializing…'}</span>
        <span style={{ color: 'var(--accent)' }}>{Math.round(progress)}%</span>
      </div>
      {/* Track */}
      <div
        className="relative h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent-dark), var(--accent))',
            boxShadow: '0 0 12px var(--accent-glow)',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
