import React from 'react';

const ProgressBar = ({ progress = 0, message = '' }) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        <span className="truncate max-w-[70%]">{message || 'Initializing…'}</span>
        <span style={{ color: 'var(--accent-light)' }}>{Math.round(progress)}%</span>
      </div>
      {/* Track */}
      <div
        className="relative h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: 'rgba(139,92,246,0.12)' }}
      >
        {/* Fill — purple gradient */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6D28D9, #8B5CF6, #A78BFA)',
            boxShadow: '0 0 14px rgba(139,92,246,0.5)',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
