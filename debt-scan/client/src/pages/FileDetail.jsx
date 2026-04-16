import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import AestheticBackground from '../components/AestheticBackground';

const FileDetail = ({ file, issues = [], onBack }) => {
  if (!file) return null;

  const fileName = file.path?.split('/').pop() || file.path;
  const critCount = issues.filter(i => i?.severity === 'Critical').length;
  const majorCount = issues.filter(i => i?.severity === 'Major').length;
  const minorCount = issues.filter(i => i?.severity === 'Minor').length;

  const scoreColor =
    file.score > 66 ? '#ef4444' :
    file.score > 33 ? '#f59e0b' :
    '#BFFF00';

  return (
    <AestheticBackground>
      <div className="min-h-screen px-6 lg:px-10 py-10 max-w-[1100px] mx-auto space-y-8">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="space-y-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={15} /> Go Back
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {file.path}
                </span>
              </div>
              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                {fileName}
              </h1>
            </div>
            {/* Score badge */}
            <div
              className="flex flex-col items-end gap-1 px-5 py-4 rounded-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Debt Score
              </span>
              <span className="text-3xl font-black" style={{ color: scoreColor, letterSpacing: '-0.04em' }}>
                {Math.round(file.score ?? 0)}
              </span>
            </div>
          </div>
        </header>

        {/* ── FILE METRICS ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Issues', value: issues.length, icon: <Zap size={14} />, color: 'lime' },
            { label: 'Critical',     value: critCount,     icon: <AlertTriangle size={14} />, color: 'red' },
            { label: 'Major',        value: majorCount,    icon: <AlertTriangle size={14} />, color: 'amber' },
            { label: 'Lines',        value: file.lineCount ?? '—', icon: <FileText size={14} />, color: 'lime' },
          ].map(({ label, value, icon, color }) => {
            const colorMap = {
              lime:  { bg: 'rgba(191,255,0,0.08)', border: 'rgba(191,255,0,0.2)',  text: '#BFFF00' },
              red:   { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',  text: '#ef4444' },
              amber: { bg: 'rgba(245,158,11,0.08)',border: 'rgba(245,158,11,0.2)',  text: '#f59e0b' },
            };
            const c = colorMap[color];
            return (
              <div
                key={label}
                className="flex flex-col gap-3 p-5 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                  >
                    {icon}
                  </span>
                </div>
                <span className="text-4xl font-black" style={{ color: c.text, letterSpacing: '-0.04em' }}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── ISSUES LIST ─────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">
            Issues in this file
          </h2>
          {issues.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <ShieldCheck size={32} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
              <p className="text-base font-bold text-white">No issues detected</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>This file passed all checks.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <IssueCard key={issue?.id || i} issue={issue} />
              ))}
            </div>
          )}
        </div>

      </div>
    </AestheticBackground>
  );
};

export default FileDetail;
