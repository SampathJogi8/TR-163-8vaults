import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Connect your codebase',
    body: 'Paste a GitHub URL, upload a ZIP archive, or paste code directly into the editor.',
  },
  {
    num: '02',
    title: 'Configure the scan',
    body: 'Choose programming language, AI provider, and optional compliance standards.',
  },
  {
    num: '03',
    title: 'AI analysis runs automatically',
    body: 'The engine parses ASTs, calls the AI model, and aggregates issues with severity scores.',
  },
  {
    num: '04',
    title: 'Review and export results',
    body: 'Explore the file heatmap, drill into issues, and export a full PDF or JSON audit report.',
  },
];

const AuditSteps = () => (
  <section id="steps" className="relative w-full max-w-7xl mx-auto px-6 py-32 overflow-hidden">
    {/* Atmospheric Glows */}
    <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start relative z-10">
      
      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="space-y-8 lg:sticky lg:top-40">
        <div className="section-label flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">Process</span>
        </div>
        
        <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
          Simple steps to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">smarter code review</span>
        </h2>
        
        <p className="text-lg font-medium leading-relaxed max-w-lg" style={{ color: 'var(--text-muted)' }}>
          Get started in minutes and take full control of your codebase health.
          From submission to comprehensive report, everything is built for speed and clarity.
        </p>

        <div className="pt-4">
          <a 
            href="#scan-section"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden"
          >
            {/* Gloss Highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Start a free scan
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </span>
          </a>
        </div>
      </div>

      {/* ── RIGHT STEPS (Neural Journey) ────────────────────── */}
      <div className="relative space-y-0 pl-4 lg:pl-0">
        
        {/* Animated Signal Path */}
        <div className="absolute left-[23px] top-6 bottom-6 w-[2px] hidden lg:block bg-white/5 overflow-hidden rounded-full">
          <div className="w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 animate-shimmer origin-top" 
               style={{ backgroundSize: '100% 200%' }} />
        </div>

        {STEPS.map(({ num, title, body }, i) => (
          <div key={num} className="group relative flex gap-10 pb-16 last:pb-0">
            
            {/* Step Marker (Glass Chip) */}
            <div className="relative flex-shrink-0 z-10 pt-1">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-black transition-all duration-500 border ${
                  i === 0 
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                  : 'bg-white/5 text-white/50 border-white/10 backdrop-blur-md group-hover:border-white/40 group-hover:text-white'
                }`}
              >
                {num}
              </div>
              {/* Radial Bloom on Hover */}
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-full blur-xl transition-all duration-700 -z-10" />
            </div>

            {/* Step Card (Floating Glass) */}
            <div className="pt-0.5 space-y-3 transition-all duration-500 group-hover:translate-x-2">
              <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-all">
                {title}
              </h3>
              <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-sm group-hover:bg-white/[0.03] group-hover:border-white/[0.08] transition-all">
                <p className="text-base leading-relaxed text-slate-400 group-hover:text-slate-300">
                  {body}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  </section>
);

export default AuditSteps;
