import React, { useState } from 'react';
import { Github, FileArchive, Clipboard, ChevronDown, Settings2, Zap, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
  const inputRef = React.useRef(null);

  const handleGetStarted = (e) => {
    e.preventDefault();
    const section = document.getElementById('scan-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      // Pulse the card for feedback
      section.classList.add('animate-pulse-glow');
      setTimeout(() => section.classList.remove('animate-pulse-glow'), 2000);
      // Focus the input
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  };
  return (
    <section className="w-full min-h-screen flex flex-col justify-start pt-28 pb-20 px-6 relative">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="nav-pill">
        <span className="text-sm font-bold text-white tracking-tight flex-shrink-0">8Vaults</span>
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#steps"    className="hover:text-white transition-colors">How it works</a>
          <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
        </div>
        <button 
          onClick={handleGetStarted}
          className="btn-primary text-xs py-2 px-5 flex-shrink-0"
        >
          Get started
        </button>
      </nav>

      {/* ── TWO-COLUMN HERO ────────────────────────────────────── */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mt-16 animate-fade-up">

        {/* LEFT — Copy */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <div 
            className="flex items-center gap-2 lg:self-start mx-auto lg:mx-0 w-fit px-3 py-1.5 rounded-full border mb-2"
            style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}
          >
            <span className="accent-dot animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-light)' }}>
              AI-Powered Code Analysis
            </span>
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
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 w-full">
            {[
              { stat: '250+',  label: 'Issues\nDetected' },
              { stat: '< 60s', label: 'Analysis\nTime'   },
              { stat: '3',     label: 'Export\nFormats'  },
            ].map(({ stat, label }, i) => (
              <div key={stat} className="flex items-center gap-4">
                <div className="flex flex-col items-center lg:items-start space-y-1">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat}
                  </span>
                  <span className="text-[11px] font-semibold tracking-wide uppercase leading-tight text-center lg:text-left" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="w-px h-8 mx-2 lg:mx-6 flex-shrink-0" style={{ background: 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>


        </div>

        {/* RIGHT — Form card */}
        <div id="scan-section" className="flex-1 w-full max-w-[540px] mx-auto lg:mr-0 scroll-mt-32">
          <div className="bento-card p-8 lg:p-10 space-y-6" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

            {/* Tab switcher */}
            <div className="flex gap-1.5 p-1.5 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
              {INPUT_TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setInputType(key)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[13px] font-bold transition-all duration-300"
                  style={{
                    background: inputType === key ? 'rgba(139,92,246,0.1)' : 'transparent',
                    color: inputType === key ? '#fff' : 'var(--text-muted)',
                    border: inputType === key ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                    boxShadow: inputType === key ? '0 4px 12px rgba(139,92,246,0.08)' : 'none'
                  }}
                >
                  <Icon size={14} className={inputType === key ? "text-[var(--accent-light)]" : ""} />
                  {label}
                </button>
              ))}
            </div>

            {/* Input area (height constrained to stop layout jumping) */}
            <div className="pt-2 h-[160px] relative">
              {inputType === 'github' && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="https://github.com/owner/repository"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    className="crypton-input relative w-full py-4 px-5 text-sm rounded-xl focus:ring-2 focus:ring-[var(--accent)] transition-all"
                    style={{ background: 'rgba(10,10,15,0.8)', borderColor: 'var(--border)' }}
                  />
                </div>
              )}
              {inputType === 'zip' && (
                <div
                  className="flex flex-col items-center justify-center gap-4 h-full rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 relative group"
                  style={{
                    borderColor: zipFile ? 'var(--accent)' : 'var(--border)',
                    background: zipFile ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                  onClick={() => document.getElementById('zip-upload').click()}
                >
                  <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                  <FileArchive size={28} className="transition-transform group-hover:scale-110" style={{ color: zipFile ? 'var(--accent-light)' : 'var(--text-muted)' }} />
                  <span className="text-[13px] font-semibold" style={{ color: zipFile ? '#fff' : 'var(--text-secondary)' }}>
                    {zipFile ? '✓ Archive ready for analysis' : 'Click to select .zip archive'}
                  </span>
                  <input id="zip-upload" type="file" accept=".zip" className="hidden" onChange={handleFileChange} />
                </div>
              )}

              {inputType === 'paste' && (
                <textarea
                  placeholder={'// Paste your code here\nfunction analyze() {\n  return "Ready";\n}'}
                  value={pastedCode}
                  onChange={e => setPastedCode(e.target.value)}
                  className="crypton-input w-full h-full resize-none font-mono text-[13px] p-4 rounded-xl focus:ring-2 focus:ring-[var(--accent)] transition-all"
                  style={{ background: 'rgba(10,10,15,0.8)', borderColor: 'var(--border)' }}
                />
              )}
            </div>

            {/* Advanced toggle */}
            <div className="space-y-4 pt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider transition-colors hover:text-white"
                style={{ color: showAdvanced ? 'var(--accent-light)' : 'var(--text-muted)' }}
              >
                <Settings2 size={14} className={showAdvanced ? "animate-spin-slow" : ""} />
                Advanced configuration
                <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-5 pb-2 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Language</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="crypton-input w-full py-3 px-3 text-[13px] font-medium rounded-lg">
                          {['auto','javascript','typescript','python','java'].map(l => (
                            <option key={l} value={l} style={{ background: 'var(--surface)' }}>
                              {l === 'auto' ? 'Auto-detect' : l.charAt(0).toUpperCase() + l.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI Engine</label>
                        <select value={provider} onChange={e => setProvider(e.target.value)} className="crypton-input w-full py-3 px-3 text-[13px] font-medium rounded-lg">
                          {['auto','gemini','openai','anthropic','deepseek','grok','openrouter','local'].map(p => (
                            <option key={p} value={p} style={{ background: 'var(--surface)' }}>
                              {p === 'auto'    ? 'Auto-route (Fastest)'
                             : p === 'local'   ? '💻 Local Scan'
                             : p.charAt(0).toUpperCase() + p.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2 pt-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
                          Custom Audit Rules
                        </label>
                        <textarea
                          placeholder="e.g. Ensure OWASP Top 10 compliance, verify DRY principles, strictly forbid console logs..."
                          value={standards}
                          onChange={e => setStandards(e.target.value)}
                          className="crypton-input w-full text-[13px] resize-none p-3 rounded-lg"
                          rows={2}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={handleAnalyze}
                className="btn-primary relative overflow-hidden group w-full py-4 text-[15px] font-bold gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                <Zap size={18} className="group-hover:scale-110 transition-transform" />
                <span>Begin Analysis</span>
                <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

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
              <span key={i} className="ticker-strip flex-shrink-0 flex items-center justify-center gap-2.5 mx-2">
                <span className="text-white font-bold tracking-tight text-[15px]">{item.label}</span>
                <span
                  className="text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest leading-none flex items-center"
                  style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-light)', border: '1px solid rgba(139,92,246,0.25)' }}
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
