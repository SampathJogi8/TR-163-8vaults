import React, { useState } from 'react';
import { Github, FileArchive, Clipboard, ChevronDown, ChevronRight, Settings2, Zap } from 'lucide-react';

const INPUT_TABS = [
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'zip',    label: 'Upload ZIP', icon: FileArchive },
  { key: 'paste',  label: 'Paste Code', icon: Clipboard },
];

const TICKER_ITEMS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C#',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'React', 'Vue', 'Node.js',
];

const HeroSection = ({
  inputType, setInputType,
  url, setUrl,
  handleAnalyze, showAdvanced, setShowAdvanced,
  zipFile, provider, setProvider,
  language, setLanguage,
  standards, setStandards,
  handleFileChange,
  pastedCode, setPastedCode,
}) => {
  const [analysisType, setAnalysisType] = useState('standard');

  return (
    <section className="w-full min-h-screen flex flex-col items-center pt-32 pb-24 px-6 relative">
      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <nav className="nav-pill w-auto min-w-0 max-w-2xl">
        <span className="text-sm font-bold text-white tracking-tight flex-shrink-0">CodeAnalyzer</span>
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#steps" className="hover:text-white transition-colors">How it works</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <button className="btn-primary text-xs py-2 px-5 flex-shrink-0">Get started</button>
      </nav>

      {/* ── HERO COPY ─────────────────────────────────────────── */}
      <div className="text-center mt-20 mb-14 max-w-3xl animate-fade-up">
        <div className="section-label mb-8">
          <span className="accent-dot" />
          AI-Powered Code Analysis
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6"
            style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}>
          Find every flaw.{' '}
          <span style={{ color: 'var(--accent)' }}>Fix it fast.</span>
        </h1>
        <p className="text-lg font-medium max-w-xl mx-auto leading-relaxed"
           style={{ color: 'var(--text-muted)' }}>
          Automated static analysis and AI-driven code review. Identify security vulnerabilities,
          technical debt, and logic errors across any codebase — in seconds.
        </p>
      </div>

      {/* ── INPUT CONSOLE ─────────────────────────────────────── */}
      <div className="w-full max-w-2xl animate-fade-up" style={{ animationDelay: '80ms' }}>
        <div className="bento-card p-8 space-y-6">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {INPUT_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setInputType(key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  background: inputType === key ? 'var(--surface-hover)' : 'transparent',
                  color: inputType === key ? '#fff' : 'var(--text-muted)',
                  border: inputType === key ? '1px solid var(--border-hover)' : '1px solid transparent',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Input area */}
          {inputType === 'github' && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="https://github.com/owner/repository"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                className="crypton-input flex-1"
              />
            </div>
          )}
          {inputType === 'zip' && (
            <div
              className="flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors"
              style={{ borderColor: zipFile ? 'var(--accent)' : 'var(--border)', background: zipFile ? 'rgba(191,255,0,0.04)' : 'transparent' }}
              onClick={() => document.getElementById('zip-upload').click()}
            >
              <FileArchive size={24} style={{ color: zipFile ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: zipFile ? 'var(--accent)' : 'var(--text-muted)' }}>
                {zipFile ? '✓ File loaded — ready to analyze' : 'Click to upload .zip archive'}
              </span>
              <input id="zip-upload" type="file" accept=".zip" className="hidden" onChange={handleFileChange} />
            </div>
          )}
          {inputType === 'paste' && (
            <textarea
              placeholder={'// Paste your code here\nfunction example() {\n  return true;\n}'}
              value={pastedCode}
              onChange={e => setPastedCode(e.target.value)}
              rows={8}
              className="crypton-input w-full resize-none font-mono text-sm"
            />
          )}

          {/* Advanced options toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold transition-colors"
            style={{ color: showAdvanced ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <Settings2 size={13} />
            Advanced options
            <ChevronDown size={13} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-fade-up">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="crypton-input py-2.5 text-sm"
                >
                  {['auto', 'javascript', 'python', 'java', 'typescript', 'go', 'rust'].map(l => (
                    <option key={l} value={l} style={{ background: 'var(--surface)' }}>{l === 'auto' ? 'Auto-detect' : l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI Provider</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="crypton-input py-2.5 text-sm"
                >
                  {['auto', 'gemini', 'openai', 'anthropic', 'deepseek', 'grok', 'openrouter'].map(p => (
                    <option key={p} value={p} style={{ background: 'var(--surface)' }}>{p === 'auto' ? 'Auto (best available)' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Compliance Standards (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. OWASP Top 10, PCI-DSS, GDPR"
                  value={standards}
                  onChange={e => setStandards(e.target.value)}
                  className="crypton-input text-sm"
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAnalyze}
            className="btn-primary w-full py-4 text-sm font-bold gap-3"
          >
            <Zap size={16} />
            Run Analysis
          </button>
        </div>
      </div>

      {/* ── LANGUAGE TICKER ───────────────────────────────────── */}
      <div className="w-full max-w-3xl mt-16 overflow-hidden" style={{ animationDelay: '160ms' }}>
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Supports all major languages
        </p>
        <div className="relative overflow-hidden">
          <div className="flex gap-3 animate-ticker whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((lang, i) => (
              <span key={i} className="ticker-strip flex-shrink-0">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
