import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, Zap, Info, ExternalLink } from 'lucide-react';

const categoryColors = {
  Security:     { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#ef4444', icon: '🔒' },
  Performance:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  text: '#f59e0b', icon: '⚡' },
  TechnicalDebt:{ bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  text: '#8b5cf6', icon: '🔧' },
  CodeSmell:    { bg: 'rgba(191,255,0,0.08)',   border: 'rgba(191,255,0,0.2)',   text: '#BFFF00', icon: '🧹' },
  Naming:       { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  text: '#6366f1', icon: '🏷️' },
};

const IssueCard = ({ issue }) => {
  const [open, setOpen] = useState(false);
  const cat  = categoryColors[issue.category] || categoryColors.TechnicalDebt;
  const sev  = issue.severity || 'Minor';

  const severityBadgeClass =
    sev === 'Critical' ? 'badge-critical' :
    sev === 'Major'    ? 'badge-major'    :
                         'badge-minor';

  return (
    <div className="crypton-card overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left transition-premium hover:bg-white/[0.02]"
      >
        {/* Category icon chip */}
        <span
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm"
          style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
        >
          {cat.icon}
        </span>

        {/* Title + file */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white truncate">
              {issue.title}
            </span>
            <span className={severityBadgeClass}>{sev}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {issue.file}
            </span>
            {issue.line && (
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                :L{issue.line}
              </span>
            )}
            {issue.model_used && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{ color: 'var(--accent)', background: 'rgba(191,255,0,0.06)', borderColor: 'rgba(191,255,0,0.15)' }}
              >
                {issue.model_used}
              </span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <ChevronDown
          size={16}
          className="flex-shrink-0 mt-0.5 transition-transform duration-200"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          className="px-5 pb-5 space-y-4 border-t animate-fade-up"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="pt-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Description
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {issue.description}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Suggested Fix
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {issue.fix}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span
              className="text-[11px] px-3 py-1 rounded-full border font-semibold"
              style={{ background: cat.bg, borderColor: cat.border, color: cat.text }}
            >
              {issue.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
