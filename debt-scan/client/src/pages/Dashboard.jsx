import React, { useState, useRef } from 'react';
import {
  ArrowUpRight, AlertTriangle, ShieldCheck, FileText,
  Timer, Zap, Download, Filter, ChevronDown,
  FileJson, BarChart2, Cpu, Search
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FileHeatmap from '../components/FileHeatmap';
import CategoryChart from '../components/CategoryChart';
import { generatePDF, generateXLS, generateJSON } from '../utils/exportUtils';
import AestheticBackground from '../components/AestheticBackground';

const Dashboard = ({ results, onFileClick, onNavigateToIssues, onNewScan }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting]       = useState(false);
  const [search, setSearch]                 = useState('');
  const heatmapRef = useRef(null);
  const chartRef   = useRef(null);

  if (!results) return null;

  const { overallScore = 0, stats = {}, durationMs = 0, files = [], issues = [] } = results;

  const acceptedCount = (issues || []).filter(i => i.feedback === 'accepted').length;
  const rejectedCount = (issues || []).filter(i => i.feedback === 'rejected').length;
  const feedbackTotal = acceptedCount + rejectedCount;
  const acceptanceRate = feedbackTotal > 0 ? Math.round((acceptedCount / feedbackTotal) * 100) : null;
  const isFastScan = durationMs < 60000;

  // SONARQUBE ALIGNMENT: % of issues explicitly flagged by AI as industry-standard baseline matches
  const sonarIssues = (issues || []).filter(i => i.is_sonar_aligned === true).length;
  const sonarAlignment = issues?.length > 0 ? Math.round((sonarIssues / issues.length) * 100) : 0;

  const scoreColor =
    overallScore > 60 ? 'red' :
    overallScore > 30 ? 'amber' :
    'green';

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      if      (format === 'pdf') await generatePDF(results, heatmapRef, chartRef);
      else if (format === 'xls') generateXLS(results);
      else                       generateJSON(results);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  /* Active AI models used */
  const modelsUsed = issues
    ? [...new Set(issues.filter(i => i?.model_used).map(i => i.model_used))]
    : [];

  return (
    <AestheticBackground>
      <div className="px-6 lg:px-10 py-10 max-w-[1400px] mx-auto space-y-8">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            {onNewScan && (
              <button
                onClick={onNewScan}
                className="flex items-center gap-1.5 text-xs font-semibold mb-1 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <ArrowUpRight size={13} style={{ transform: 'rotate(225deg)' }} /> New Scan
              </button>
            )}
            {/* Breadcrumb badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="section-label">Audit Report</span>
              <span className="metric-pill-muted flex items-center gap-1.5">
                <Timer size={11} />
                {(durationMs / 1000).toFixed(1)}s
              </span>
              {modelsUsed.length > 0 && (
                <span className="metric-pill flex items-center gap-1.5">
                  <Cpu size={11} />
                  {modelsUsed.join(', ')}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
              System Analysis
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToIssues}
              className="btn-secondary text-xs gap-2"
            >
              <Filter size={14} />
              All Issues
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="btn-primary text-xs gap-2 py-2.5 px-5"
              >
                {isExporting ? <Zap size={14} className="animate-pulse" /> : <Download size={14} />}
                {isExporting ? 'Generating…' : 'Export'}
                <ChevronDown size={13} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
              </button>
              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50 animate-pop-in"
                  style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--accent-light)', border: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                >
                  {[
                    { fmt: 'pdf',  label: 'PDF Report',   icon: FileText,   color: '#ef4444' },
                    { fmt: 'xls',  label: 'Spreadsheet',  icon: BarChart2,  color: '#22c55e' },
                    { fmt: 'json', label: 'Raw JSON',      icon: FileJson,   color: '#f59e0b' },
                  ].map(({ fmt, label, icon: Icon, color }) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-xs font-semibold transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon size={14} style={{ color }} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── STAT CARDS ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 stagger">
          <StatCard
            label="Debt Score"
            value={overallScore}
            color={scoreColor}
            subtext={scoreColor === 'red' ? 'Critical refactoring' : 'Stable'}
            icon={<ShieldCheck size={14} />}
          />
          <StatCard
            label="Sonar Alignment"
            value={`${sonarAlignment}%`}
            color="lime"
            subtext="Accuracy vs Baseline"
            icon={<Zap size={14} />}
          />
          <StatCard
            label="Fix Acceptance"
            value={acceptanceRate !== null ? `${acceptanceRate}%` : '—'}
            color="lime"
            subtext={feedbackTotal > 0 ? `${feedbackTotal} reviews` : 'Awaiting feedback'}
            icon={<BarChart2 size={14} />}
          />
          <StatCard
            label="Critical Issues"
            value={stats?.severityCounts?.Critical ?? 0}
            color="red"
            subtext="Security & Stability"
            icon={<AlertTriangle size={14} />}
          />
          <StatCard
            label="Performance"
            value={(durationMs / 1000).toFixed(1)}
            unit="sec"
            color={isFastScan ? 'green' : 'amber'}
            subtext={isFastScan ? 'Target met: < 60s' : 'Above target'}
            icon={<Timer size={14} />}
          />
        </div>

        {/* ── BENTO GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* File Heatmap (2/3 width) */}
          <div className="lg:col-span-2 bento-card" ref={heatmapRef}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white mb-1">File Risk Heatmap</h2>
                <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  Click any file to view detailed issues
                </p>
              </div>
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Filter files…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 text-xs rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    outline: 'none',
                    width: '160px',
                  }}
                />
              </div>
            </div>
            <FileHeatmap
              files={
                Array.isArray(files)
                  ? files
                    .filter(f => !search || f.path?.toLowerCase().includes(search.toLowerCase()))
                    .sort((a, b) => b.score - a.score)
                  : []
              }
              onFileClick={file => onFileClick(file)}
            />
          </div>

          {/* Category chart (1/3 width) */}
          <div className="bento-card" ref={chartRef}>
            <h2 className="text-base font-bold text-white mb-6">Issue Categories</h2>
            <CategoryChart issues={issues || []} />

            {/* Quick severity breakdown */}
            <div
              className="mt-6 pt-6 space-y-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {[
                { label: 'Critical', count: stats?.severityCounts?.Critical ?? 0, cls: 'badge-critical' },
                { label: 'Major',    count: stats?.severityCounts?.Major    ?? 0, cls: 'badge-major' },
                { label: 'Minor',    count: stats?.severityCounts?.Minor    ?? 0, cls: 'badge-minor' },
              ].map(({ label, count, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={cls}>{label}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── VIEW ALL ISSUES CTA ─────────────────────────────── */}
        <button
          onClick={onNavigateToIssues}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-sm font-semibold transition-premium"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          View all {stats?.totalIssues ?? ''} issues
          <ArrowUpRight size={16} />
        </button>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer className="flex items-center justify-between pt-4 text-[11px] font-medium" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
          <span>8Vaults © 2026</span>
          <span>Secure static analysis · AI assisted · 100% automated</span>
        </footer>

      </div>
    </AestheticBackground>
  );
};

export default Dashboard;
