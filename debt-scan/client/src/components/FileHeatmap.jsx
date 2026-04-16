import React from 'react';

const FileHeatmap = ({ files = [], onFileClick }) => {
  if (!files.length) return null;

  const max = Math.max(...files.map(f => f.score || 0), 1);

  const getBarColor = (score) => {
    if (score > 66) return '#ef4444';
    if (score > 33) return '#f59e0b';
    return '#BFFF00';
  };

  const getBadgeClass = (score) => {
    if (score > 66) return 'badge-critical';
    if (score > 33) return 'badge-major';
    return 'badge-minor';
  };

  return (
    <div className="space-y-2">
      {files.slice(0, 18).map((file, i) => {
        const pct   = Math.max(2, (file.score / max) * 100);
        const color = getBarColor(file.score);
        return (
          <button
            key={i}
            onClick={() => onFileClick && onFileClick(file)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-premium group"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            {/* File name */}
            <span
              className="text-xs font-mono flex-shrink-0 truncate"
              style={{ color: 'var(--text-secondary)', width: '180px', minWidth: '120px' }}
              title={file.path}
            >
              {file.path?.split('/').pop() || file.path}
            </span>

            {/* Bar */}
            <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color, opacity: 0.85 }}
              />
            </div>

            {/* Score badge */}
            <span className={`${getBadgeClass(file.score)} flex-shrink-0`}>
              {Math.round(file.score)}
            </span>

            {/* Issue count */}
            {file.issueCount > 0 && (
              <span
                className="flex-shrink-0 text-[10px] font-semibold"
                style={{ color: 'var(--text-muted)' }}
              >
                {file.issueCount} {file.issueCount === 1 ? 'issue' : 'issues'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FileHeatmap;
