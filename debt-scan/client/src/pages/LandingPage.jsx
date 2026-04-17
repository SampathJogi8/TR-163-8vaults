import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import ProgressBar from '../components/ProgressBar';
import HeroSection from '../components/sections/HeroSection';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import AuditSteps from '../components/sections/AuditSteps';
import AuditFAQ from '../components/sections/AuditFAQ';
import AestheticBackground from '../components/AestheticBackground';

const sectionAnimation = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
};

const LandingPage = ({ onStartScan, progress, statusMessage }) => {
  const [inputType, setInputType]     = useState('github');
  const [url, setUrl]                 = useState('');
  const [zipFile, setZipFile]         = useState(null);
  const [language, setLanguage]       = useState('auto');
  const [standards, setStandards]     = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isScanning, setIsScanning]   = useState(false);
  const [provider, setProvider]       = useState('auto');
  const [pastedCode, setPastedCode]   = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setZipFile(event.target.result.split(',')[1]);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (inputType === 'github' && !url)       return alert('Please enter a GitHub URL');
    if (inputType === 'zip' && !zipFile)      return alert('Please upload a ZIP file');
    if (inputType === 'paste' && !pastedCode) return alert('Please paste your code');

    setIsScanning(true);
    try {
      const res = await api.post('/api/analyze', {
        type: inputType,
        url: inputType === 'github' ? url : undefined,
        zipBase64: inputType === 'zip' ? zipFile : undefined,
        pastedCode: inputType === 'paste' ? pastedCode : undefined,
        language: language === 'auto' ? undefined : language,
        standards,
        provider,
      });
      onStartScan(res.data.scanId);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert('Analysis failed: ' + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
      setIsScanning(false);
    }
  };

  /* ── SCANNING SCREEN ──────────────────────────────────────────────── */
  const ALL_PROVIDERS = ['gemini', 'deepseek', 'grok', 'openrouter', 'anthropic', 'openai'];

  // Parse provider info from statusMessage: "provider:NAME:label"
  const parseProviderMsg = (msg = '') => {
    if (!msg.startsWith('provider:')) return { active: null, label: msg };
    const parts = msg.split(':');
    return { active: parts[1], label: parts.slice(2).join(':') };
  };

  const { active: activeProvider, label: providerLabel } = parseProviderMsg(statusMessage);

  const PROVIDER_META = {
    local:       { name: '💻 Local Scan', color: '#64748b', emoji: '⚙️' },
    gemini:      { name: 'Gemini',     color: '#4285F4', emoji: '✦' },
    deepseek:    { name: 'DeepSeek',   color: '#8B5CF6', emoji: '◈' },
    grok:        { name: 'Grok',       color: '#A78BFA', emoji: '◎' },
    openrouter:  { name: 'OpenRouter', color: '#7C3AED', emoji: '⬡' },
    'openrouter-free': { name: 'OpenRouter Free', color: '#6D28D9', emoji: '⬡' },
    anthropic:   { name: 'Anthropic',  color: '#C084FC', emoji: '◇' },
    openai:      { name: 'OpenAI',     color: '#34D399', emoji: '◻' },
  };

  if (isScanning) {
    const displayProviders = provider === 'auto' ? ALL_PROVIDERS : [provider];
    const activeIdx = displayProviders.findIndex(
      p => p === activeProvider || (activeProvider === 'openrouter-free' && p === 'openrouter')
    );

    return (
      <AestheticBackground>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg space-y-8 animate-fade-up">

            {/* Pulsing icon */}
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                <Cpu size={28} style={{ color: 'var(--accent)' }} />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                Analyzing codebase
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {activeProvider
                  ? providerLabel || `Running on ${PROVIDER_META[activeProvider]?.name ?? activeProvider}`
                  : 'Parsing syntax trees and preparing chunks…'
                }
              </p>
            </div>

            {/* Progress bar */}
            <ProgressBar progress={progress} message={''} />

            {/* Provider chain — only shown in 'auto' mode */}
            {provider === 'auto' && (
              <div className="bento-card p-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  AI Engine Chain
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayProviders.map((p, i) => {
                    const meta   = PROVIDER_META[p] ?? { name: p, color: '#8B5CF6', emoji: '●' };
                    const isActive  = p === activeProvider || (activeProvider === 'openrouter-free' && p === 'openrouter');
                    const isFailed  = activeIdx > -1 && i < activeIdx;
                    const isPending = !isActive && !isFailed;

                    return (
                      <div
                        key={p}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-500"
                        style={{
                          background: isActive  ? `${meta.color}18`
                                    : isFailed  ? 'rgba(239,68,68,0.06)'
                                    : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? meta.color + '55' : isFailed ? 'rgba(239,68,68,0.15)' : 'var(--border)'}`,
                          color: isActive  ? meta.color
                               : isFailed  ? '#ef4444'
                               : 'var(--text-muted)',
                          opacity: isPending ? 0.5 : 1,
                          transform: isActive ? 'scale(1.04)' : 'scale(1)',
                        }}
                      >
                        {/* Status dot */}
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: isActive  ? meta.color
                                      : isFailed  ? '#ef4444'
                                      : 'var(--border)',
                            boxShadow: isActive ? `0 0 6px ${meta.color}` : 'none',
                            animation: isActive ? 'pulse 1.2s ease-in-out infinite' : 'none',
                          }}
                        />
                        {meta.name}
                        {isFailed  && <span className="ml-1 opacity-60">✕</span>}
                        {isActive  && <span className="ml-1 opacity-80 text-[10px]">active</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Live status line */}
                {activeProvider && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono animate-fade-up"
                    style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >
                    <span style={{ color: PROVIDER_META[activeProvider]?.color ?? 'var(--accent)' }}>›</span>
                    {providerLabel || `Using ${activeProvider}`}
                  </div>
                )}
              </div>
            )}

            {/* Single-provider mode note */}
            {provider !== 'auto' && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium animate-fade-up"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border-hover)', color: 'var(--accent-light)' }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: PROVIDER_META[provider]?.color ?? 'var(--accent)', boxShadow: `0 0 8px ${PROVIDER_META[provider]?.color ?? 'var(--accent)'}` }}
                />
                Running on {PROVIDER_META[provider]?.name ?? provider}
                {activeProvider && activeProvider !== provider && (
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                    → shifted to {PROVIDER_META[activeProvider]?.name ?? activeProvider}
                  </span>
                )}
              </div>
            )}

          </div>
        </div>
      </AestheticBackground>
    );
  }

  /* ── LANDING PAGE ─────────────────────────────────────────────────── */
  return (
    <AestheticBackground>
      <div className="flex flex-col items-center w-full">
        {/* Hero - Subtle Fade In */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
          className="w-full"
        >
          <HeroSection
            inputType={inputType} setInputType={setInputType}
            url={url} setUrl={setUrl}
            handleAnalyze={handleAnalyze}
            showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
            zipFile={zipFile}
            provider={provider} setProvider={setProvider}
            language={language} setLanguage={setLanguage}
            standards={standards} setStandards={setStandards}
            handleFileChange={handleFileChange}
            pastedCode={pastedCode} setPastedCode={setPastedCode}
          />
        </motion.div>

        {/* Features - Scroll Reveal */}
        <motion.div {...sectionAnimation} className="w-full">
          <FeaturesGrid />
        </motion.div>

        {/* Steps - Scroll Reveal */}
        <motion.div {...sectionAnimation} className="w-full">
          <AuditSteps />
        </motion.div>

        {/* FAQ - Scroll Reveal */}
        <motion.div {...sectionAnimation} className="w-full">
          <AuditFAQ />
        </motion.div>

        {/* ── CTA Banner ──────────────────────────────────────────── */}
        <motion.section {...sectionAnimation} className="w-full max-w-6xl mx-auto px-6 py-24">
          <div
            className="rounded-3xl p-12 md:p-16 text-center space-y-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <h2 className="section-heading mx-auto max-w-xl">
              Take control of your code quality
            </h2>
            <p className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>
              Thousands of developers are already scanning smarter. Don't ship issues you could have caught.
            </p>
            <a 
              href="#scan-section"
              className="btn-primary mx-auto" 
            >
              Run your first scan — free
            </a>
          </div>
        </motion.section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer
          className="w-full px-6 py-12"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-white">8Vaults</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest"
                style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-light)', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                Beta
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
              <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
            </div>

            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              © 2026 8Vaults. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AestheticBackground>
  );
};

export default LandingPage;
