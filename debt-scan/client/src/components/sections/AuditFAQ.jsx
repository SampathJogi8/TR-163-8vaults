import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'Which programming languages does the analyzer support?',
    a: 'JavaScript, TypeScript, Python, Java, Go, Rust, C#, PHP, Ruby, Swift, Kotlin, and more. The engine auto-detects language from file extensions.',
  },
  {
    q: 'How secure is my code when I submit it?',
    a: 'Code is processed in an ephemeral serverless environment and discarded immediately after analysis. Nothing is stored beyond your scan session.',
  },
  {
    q: 'Which AI providers are used for analysis?',
    a: 'The engine rotates across Gemini, GPT-4o, Claude 3.5, DeepSeek, Grok-3, and OpenRouter with automatic failover. You can pin a specific provider in Advanced options.',
  },
  {
    q: 'Can I analyze private GitHub repositories?',
    a: 'Currently only public repositories are supported via GitHub URL. For private code, use the ZIP upload or Code Paste mode.',
  },
  {
    q: 'What export formats are available?',
    a: 'You can export your full audit as a PDF report, XLS spreadsheet, or raw JSON for integration with your own tooling.',
  },
];

const AuditFAQ = () => {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="w-full max-w-6xl mx-auto px-6 py-24">
      <hr className="crypton-divider mb-24" />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4 mb-12">
          <div className="section-label mx-auto">
            <span className="accent-dot" />
            FAQ
          </div>
          <h2 className="section-heading">Your questions, answered</h2>
        </div>

        {FAQS.map(({ q, a }, i) => (
          <div
            key={i}
            className="crypton-card overflow-hidden transition-premium"
            style={{ borderColor: open === i ? 'var(--border-hover)' : 'var(--border)' }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-6 text-left transition-premium"
            >
              <span className="text-sm font-semibold text-white leading-tight">{q}</span>
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: open === i ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${open === i ? 'rgba(139,92,246,0.28)' : 'var(--border)'}`,
                  color: open === i ? 'var(--accent)' : 'var(--text-muted)',
                  transition: '0.2s',
                }}
              >
                {open === i ? <Minus size={13} /> : <Plus size={13} />}
              </span>
            </button>
            {open === i && (
              <div className="px-6 pb-6 animate-fade-up">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AuditFAQ;
