import React from 'react';
import { Zap, Shield, BarChart2, Cpu, Lock, Bell } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant analysis',
    body: 'Submit any repository, ZIP archive, or code snippet and get a full audit in seconds — no setup required.',
    pills: ['< 60s Results', 'Any Codebase'],
  },
  {
    icon: Shield,
    title: 'Security-first scanning',
    body: 'Detect OWASP Top 10 vulnerabilities, injection flaws, authentication gaps, and exposed secrets automatically.',
    pills: ['OWASP Top 10', 'CVE-Aware'],
  },
  {
    icon: BarChart2,
    title: 'Technical debt metrics',
    body: 'Quantify code quality with per-file debt scores, complexity maps, and duplication heatmaps.',
    pills: ['Per-file Scores', 'Trend Tracking'],
  },
  {
    icon: Cpu,
    title: 'Multi-model AI engine',
    body: 'Rotate across Gemini, GPT-4o, Claude, DeepSeek, and Grok for maximum analysis depth and resilience.',
    pills: ['6 AI Providers', 'Auto-failover'],
  },
  {
    icon: Lock,
    title: 'Compliance ready',
    body: 'Validate against PCI-DSS, GDPR, HIPAA, and custom compliance standards in every scan.',
    pills: ['PCI-DSS', 'GDPR + HIPAA'],
  },
  {
    icon: Bell,
    title: 'Actionable fixes',
    body: 'Every issue comes with a concrete fix suggestion — not just a warning. Ship cleaner code faster.',
    pills: ['Inline Fixes', 'Priority Ranking'],
  },
];

const FeaturesGrid = () => (
  <section id="features" className="w-full max-w-6xl mx-auto px-6 py-24">
    {/* Section header */}
    <div className="text-center mb-16 space-y-4">
      <div className="section-label mx-auto">
        <span className="accent-dot" />
        Powerful features
      </div>
      <h2 className="section-heading max-w-2xl mx-auto">
        Everything you need for code intelligence
      </h2>
      <p className="text-base font-medium max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
        Streamline your review workflow with tools designed to keep you secure,
        informed, and in control — every step of the way.
      </p>
    </div>

    {/* 3-col bento grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
      {FEATURES.map(({ icon: Icon, title, body, pills }) => (
        <div key={title} className="bento-card group animate-fade-up space-y-4">
          {/* Icon chip */}
          <div
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(191,255,0,0.1)', border: '1px solid rgba(191,255,0,0.2)' }}
          >
            <Icon size={18} style={{ color: 'var(--accent)' }} />
          </div>
          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
          </div>
          {/* Metric pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {pills.map(p => (
              <span key={p} className="metric-pill">{p}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesGrid;
