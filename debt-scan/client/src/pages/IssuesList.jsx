import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, ChevronDown } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import AestheticBackground from '../components/AestheticBackground';

const SEVERITIES = ['All', 'Critical', 'Major', 'Minor'];
const CATEGORIES = ['All', 'Security', 'TechnicalDebt', 'Performance', 'CodeSmell', 'Naming'];

const IssuesList = ({ issues = [], onBack, onFileClick }) => {
  const [search, setSearch]   = useState('');
  const [severity, setSeverity] = useState('All');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy]   = useState('severity');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const severityOrder = { Critical: 0, Major: 1, Minor: 2 };
    return [...issues]
      .filter(i => {
        if (!i) return false;
        const matchSeverity = severity === 'All' || i.severity === severity;
        const matchCategory = category === 'All' || i.category === category;
        const matchSearch   = !search ||
          i.title?.toLowerCase().includes(search.toLowerCase()) ||
          i.file?.toLowerCase().includes(search.toLowerCase()) ||
          i.description?.toLowerCase().includes(search.toLowerCase());
        return matchSeverity && matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') return (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
        if (sortBy === 'file')     return (a.file || '').localeCompare(b.file || '');
        return 0;
      });
  }, [issues, search, severity, category, sortBy]);

  const counts = {
    Critical: issues.filter(i => i?.severity === 'Critical').length,
    Major:    issues.filter(i => i?.severity === 'Major').length,
    Minor:    issues.filter(i => i?.severity === 'Minor').length,
  };

  return (
    <AestheticBackground>
      <div className="min-h-screen px-6 lg:px-10 py-10 max-w-[1200px] mx-auto space-y-8">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ArrowLeft size={15} /> Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
              All Issues
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="badge-critical">{counts.Critical} Critical</span>
              <span className="badge-major">{counts.Major} Major</span>
              <span className="badge-minor">{counts.Minor} Minor</span>
            </div>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary text-xs gap-2"
          >
            <Filter size={13} />
            Filters
            <ChevronDown size={12} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
          </button>
        </header>

        {/* ── FILTER BAR ─────────────────────────────────────── */}
        {showFilters && (
          <div
            className="bento-card animate-fade-up"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-2">
                <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by title, file, or description…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="crypton-input pl-10 py-3 text-sm w-full"
                />
              </div>
              {/* Severity */}
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="crypton-input py-3 text-sm"
              >
                {SEVERITIES.map(s => <option key={s} value={s} style={{ background: 'var(--surface)' }}>{s === 'All' ? 'All Severities' : s}</option>)}
              </select>
              {/* Category */}
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="crypton-input py-3 text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'var(--surface)' }}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── RESULTS COUNT ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Showing <span className="text-white font-bold">{filtered.length}</span> of {issues.length} issues
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Sort:</span>
            <button
              onClick={() => setSortBy(sortBy === 'severity' ? 'file' : 'severity')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {sortBy === 'severity' ? 'Severity' : 'File'}
            </button>
          </div>
        </div>

        {/* ── ISSUE CARDS ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bento-card text-center py-16 space-y-3">
            <p className="text-2xl font-bold text-white">No issues found</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((issue, i) => (
              <div key={issue.id || i}>
                <IssueCard issue={issue} />
              </div>
            ))}
          </div>
        )}

      </div>
    </AestheticBackground>
  );
};

export default IssuesList;
