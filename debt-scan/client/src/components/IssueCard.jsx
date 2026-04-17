import React, { useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';

const categoryColors = {
  Security:      { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#ef4444', icon: '🔒' },
  Performance:   { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  text: '#f59e0b', icon: '⚡' },
  TechnicalDebt: { bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)', text: '#A78BFA', icon: '🔧' },
  CodeSmell:     { bg: 'rgba(109,40,217,0.1)',   border: 'rgba(109,40,217,0.25)', text: '#8B5CF6', icon: '🧹' },
  Naming:        { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', text: '#C4B5FD', icon: '🏷️' },
};

const IssueCard = ({ issue, onFeedback }) => {
  const [open, setOpen] = useState(false);
  const cat = categoryColors[issue.category] || categoryColors.TechnicalDebt;
  const sev = issue.severity || 'Minor';

  const severityBadgeClass =
    sev === 'Critical' ? 'badge-critical' :
    sev === 'Major'    ? 'badge-major'    :
                         'badge-minor';

  return (
    <div className="crypton-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left transition-premium"
        style={{ background: 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm"
          style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
        >
          {cat.icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white truncate">{issue.title}</span>
            <span className={severityBadgeClass}>{sev}</span>
            {issue.is_sonar_aligned && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-500/40 text-blue-300">
                Sonar Baseline
              </span>
            )}
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
                style={{ color: 'var(--accent-light)', background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}
              >
                {issue.model_used}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          size={16}
          className="flex-shrink-0 mt-0.5 transition-transform duration-200"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t animate-fade-up" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Description
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {issue.description}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-light)' }}>
              Suggested Fix
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {issue.fix}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] px-3 py-1 rounded-full border font-semibold"
                  style={{ background: cat.bg, borderColor: cat.border, color: cat.text }}>
              {issue.category}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest mr-2" style={{ color: 'var(--text-muted)' }}>
                Was this fix helpful?
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onFeedback('accepted'); }}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border flex items-center gap-1.5 ${
                  issue.feedback === 'accepted' 
                    ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-white'
                }`}
              >
                {issue.feedback === 'accepted' && <ShieldCheck size={12} />}
                Accept
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onFeedback('rejected'); }}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                  issue.feedback === 'rejected' 
                    ? 'bg-red-500/20 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-white'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
