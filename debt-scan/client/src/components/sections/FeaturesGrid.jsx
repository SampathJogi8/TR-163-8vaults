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
  <section id="features" className="relative w-full max-w-7xl mx-auto px-6 py-32 overflow-hidden">
    {/* Atmospheric Background Glows */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
    <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

    {/* Section header */}
    <div className="text-center mb-24 space-y-6 relative z-10">
      <div className="section-label mx-auto flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">Capabilities</span>
      </div>
      <h2 className="text-5xl font-black text-white leading-tight tracking-tight max-w-3xl mx-auto">
        Everything you need for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">code intelligence</span>
      </h2>
      <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Streamline your review workflow with tools designed to keep you secure,
        informed, and in control — every step of the way.
      </p>
    </div>

    {/* 3-col premium grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger relative z-10">
      {FEATURES.map(({ icon: Icon, title, body, pills }) => (
        <div 
          key={title} 
          className="group relative p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
          style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
        >
          {/* Internal Glow Effect */}
          <div className="absolute -inset-px bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Card subtle rim highlight */}
          <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none group-hover:border-white/20 transition-colors" />

          {/* Icon chip */}
          <div
            className="relative w-14 h-14 flex items-center justify-center rounded-2xl mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))', 
              border: '1px solid rgba(139,92,246,0.25)',
              boxShadow: 'inset 0 0 20px rgba(139,92,246,0.1)'
            }}>
            <Icon size={24} className="text-purple-400 transition-all group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          </div>

          {/* Content */}
          <div className="relative space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-base leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{body}</p>
          </div>

          {/* Metric pills */}
          <div className="relative flex flex-wrap gap-2 pt-8">
            {pills.map(p => (
              <span 
                key={p} 
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Bottom highlight streak */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesGrid;
