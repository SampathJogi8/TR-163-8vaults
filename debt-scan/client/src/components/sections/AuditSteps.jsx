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
  <section id="steps" className="w-full max-w-6xl mx-auto px-6 py-24">
    <hr className="crypton-divider mb-24" />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      {/* Left copy */}
      <div className="space-y-6 lg:sticky lg:top-32">
        <div className="section-label">
          <span className="accent-dot" />
          How it works
        </div>
        <h2 className="section-heading">
          Simple steps to smarter code review
        </h2>
        <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Get started in minutes and take full control of your codebase health.
          From submission to comprehensive report, everything is built for speed and clarity.
        </p>
        <button className="btn-primary">Start a free scan</button>
      </div>

      {/* Right steps */}
      <div className="relative space-y-0">
        {/* Vertical line - desktop only */}
        <div
          className="absolute left-[22px] top-0 bottom-0 w-px hidden lg:block"
          style={{ background: 'var(--border)' }}
        />
        {STEPS.map(({ num, title, body }, i) => (
          <div key={num} className="relative flex gap-6 pb-10 last:pb-0">
            {/* Number chip */}
            <div
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xs font-black z-10 relative"
              style={{
                background: i === 0 ? 'var(--accent)' : 'var(--surface)',
                color: i === 0 ? '#000' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              {num}
            </div>
            {/* Content */}
            <div className="pt-2.5 space-y-1.5">
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AuditSteps;
