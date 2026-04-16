import React, { useState } from 'react';
import { Github, FileArchive, Clipboard, ChevronDown, Settings2, Zap, ArrowRight } from 'lucide-react';

const INPUT_TABS = [
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'zip',    label: 'Upload ZIP', icon: FileArchive },
  { key: 'paste',  label: 'Paste Code', icon: Clipboard },
];

const TICKER_ITEMS = [
  { label: 'JavaScript', tag: 'Supported' },
  { label: 'TypeScript', tag: 'Supported' },
  { label: 'Python',     tag: 'Supported' },
  { label: 'Java',       tag: 'Supported' },
  { label: 'AI-powered', tag: '6 Providers' },
  { label: 'GitHub URLs', tag: 'Public repos' },
  { label: 'ZIP upload', tag: 'Any archive' },
  { label: 'Code paste', tag: 'Snippets' },
  { label: 'PDF export', tag: 'Full report' },
  { label: 'JSON export', tag: 'Raw data' },
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
  return (
    <section className="w-full min-h-screen flex flex-col justify-start pt-28 pb-20 px-6 relative">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="nav-pill">
        <span className="text-sm font-bold text-white tracking-tight flex-shrink-0">CodeAnalyzer</span>
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#steps"    className="hover:text-white transition-colors">How it works</a>
          <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
        </div>
        <a 
          href="#scan-section"
          className="btn-primary text-xs py-2 px-5 flex-shrink-0"
        >
          Get started
        </a>
      </nav>

      {/* ── TWO-COLUMN HERO ────────────────────────────────────── */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mt-16 animate-fade-up">

        {/* LEFT — Copy */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="section-label lg:self-start mx-auto lg:mx-0 w-fit">
            <span className="accent-dot" />
            AI-Powered Code Analysis
          </div>
          <h1
            className="text-5xl sm:text-6xl font-black text-white"
            style={{ letterSpacing: '-0.04em', lineHeight: 1.05 }}
          >
            Find every flaw.{' '}
            <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Fix it fast.
            </span>
          </h1>
          <p className="text-base font-medium leading-relaxed max-w-md mx-auto lg:mx-0" style={{ color: 'var(--text-muted)' }}>
            Automated static analysis and AI-driven code review. Identify security vulnerabilities,
            technical debt, and logic errors across any codebase — in seconds.
          </p>

          {/* Typographic stat row */}
          <div className="flex items-center gap-0 pt-8 w-fit mx-auto lg:mx-0">
            {[
              { stat: '250+',  label: 'issues\ndetected' },
              { stat: '< 60s', label: 'analysis\ntime'   },
              { stat: '3',     label: 'export\nformats'  },
            ].map(({ stat, label }, i) => (
              <div key={stat} className="flex items-center gap-6">
                <div className="px-5 first:pl-0 flex flex-col items-start gap-0.5">
                  <span
                    className="text-3xl font-black leading-none"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #C4B5FD)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {stat}
                  </span>
                  <span className="text-[11px] font-medium leading-tight" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="w-px h-7 mx-3 self-center flex-shrink-0" style={{ background: 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>


        </div>

        {/* RIGHT — Form card */}
        <div id="scan-section" className="flex-1 w-full max-w-lg mx-auto lg:mx-0 scroll-mt-32">
          <div className="bento-card p-6 space-y-5">

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {INPUT_TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setInputType(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: inputType === key ? 'var(--surface-hover)' : 'transparent',
                    color: inputType === key ? '#fff' : 'var(--text-muted)',
                    border: inputType === key ? '1px solid var(--border-hover)' : '1px solid transparent',
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {/* Input area */}
            {inputType === 'github' && (
              <input
                type="text"
                placeholder="https://github.com/owner/repository"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                className="crypton-input"
              />
            )}
            {inputType === 'zip' && (
              <div
                className="flex flex-col items-center justify-center gap-3 py-7 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors"
                style={{
                  borderColor: zipFile ? 'var(--accent)' : 'var(--border)',
                  background: zipFile ? 'rgba(139,92,246,0.06)' : 'transparent',
                }}
                onClick={() => document.getElementById('zip-upload').click()}
              >
                <FileArchive size={22} style={{ color: zipFile ? 'var(--accent)' : 'var(--text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: zipFile ? 'var(--accent-light)' : 'var(--text-muted)' }}>
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
                rows={6}
                className="crypton-input resize-none font-mono text-sm"
              />
            )}

            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-semibold transition-colors"
              style={{ color: showAdvanced ? 'var(--accent-light)' : 'var(--text-muted)' }}
            >
              <Settings2 size={12} />
              Advanced options
              <ChevronDown size={12} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 animate-fade-up">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="crypton-input py-2.5 text-sm">
                    {['auto','javascript','typescript','python','java'].map(l => (
                      <option key={l} value={l} style={{ background: 'var(--surface)' }}>
                        {l === 'auto' ? 'Auto-detect' : l.charAt(0).toUpperCase() + l.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI Provider</label>
                  <select value={provider} onChange={e => setProvider(e.target.value)} className="crypton-input py-2.5 text-sm">
                    {['auto','gemini','openai','anthropic','deepseek','grok','openrouter','dummy'].map(p => (
                      <option key={p} value={p} style={{ background: 'var(--surface)' }}>
                        {p === 'auto'    ? 'Auto'
                       : p === 'dummy'  ? '🧪 Dummy (test rotation)'
                       : p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Compliance Standards</label>
                  <input
                    type="text"
                    placeholder="e.g. OWASP Top 10, PCI-DSS"
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
              className="btn-primary w-full py-3.5 text-sm font-bold gap-2"
            >
              <Zap size={15} />
              Run Analysis
              <ArrowRight size={14} className="ml-auto" />
            </button>

            {/* Footer note */}
            <p className="text-center text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Free to use · No account required · Results in seconds
            </p>
          </div>
        </div>
      </div>

      {/* ── TICKER STRIP ───────────────────────────────────────── */}
      <div className="w-full max-w-5xl mx-auto mt-24 overflow-hidden">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          What's supported
        </p>
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
               style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
               style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />
          <div className="flex gap-3 animate-ticker whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-strip flex-shrink-0 flex items-center gap-2">
                <span className="text-white font-semibold">{item.label}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-light)', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  {item.tag}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
