import React from 'react';

const CATEGORY_COLORS = {
  Security:      '#ef4444',
  TechnicalDebt: '#8b5cf6',
  CodeSmell:     '#BFFF00',
  Performance:   '#f59e0b',
  Naming:        '#6366f1',
};

const CategoryChart = ({ issues = [] }) => {
  const counts = {};
  issues.forEach(i => {
    const cat = i.category || 'Other';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (!entries.length) return (
    <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-muted)' }}>
      No category data
    </div>
  );

  return (
    <div className="space-y-3">
      {entries.map(([cat, count]) => {
        const color = CATEGORY_COLORS[cat] || '#BFFF00';
        const pct   = Math.max(4, (count / max) * 100);
        return (
          <div key={cat} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {cat}
              </span>
              <span
                className="text-xs font-bold tabular-nums"
                style={{ color }}
              >
                {count}
              </span>
            </div>
            <div className="h-1 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color, opacity: 0.8 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryChart;
