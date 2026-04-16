import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import api from '../api';
import ProgressBar from '../components/ProgressBar';
import HeroSection from '../components/sections/HeroSection';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import AuditSteps from '../components/sections/AuditSteps';
import AuditFAQ from '../components/sections/AuditFAQ';
import AestheticBackground from '../components/AestheticBackground';

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
  if (isScanning) {
    return (
      <AestheticBackground>
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-md text-center space-y-8">
            {/* Animated icon */}
            <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            <Cpu size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
                Analyzing codebase
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Parsing syntax trees and detecting issues…
              </p>
            </div>
            <ProgressBar progress={progress} message={statusMessage} />
          </div>
        </div>
      </AestheticBackground>
    );
  }

  /* ── LANDING PAGE ─────────────────────────────────────────────────── */
  return (
    <AestheticBackground>
      <div className="flex flex-col items-center w-full">
        {/* Hero with nav + form */}
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

        <FeaturesGrid />
        <AuditSteps />
        <AuditFAQ />

        {/* ── CTA Banner ──────────────────────────────────────────── */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24">
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
            <button className="btn-primary mx-auto" onClick={handleAnalyze}>
              Run your first scan — free
            </button>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer
          className="w-full px-6 py-12"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-white">CodeAnalyzer</span>
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
              © 2026 CodeAnalyzer. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AestheticBackground>
  );
};

export default LandingPage;
