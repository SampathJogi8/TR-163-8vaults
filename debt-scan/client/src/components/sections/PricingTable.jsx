import React from 'react';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'Forever, no credit card',
    description: 'Start scanning instantly. Access essential analysis tools at no cost.',
    features: ['5 scans per month', 'GitHub & ZIP input', 'Basic issue report', 'PDF export'],
    cta: 'Get started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'Per user / month',
    description: 'Unlock advanced analysis, unlimited scans, and priority AI access.',
    features: ['Unlimited scans', 'All AI providers', 'Compliance standards', 'JSON + XLS export', 'Priority support'],
    cta: 'Start with Pro',
    popular: true,
  },
  {
    name: 'Lifetime',
    price: '$249',
    period: 'One-time payment',
    description: 'Pay once, analyze forever. All Pro features with lifetime updates included.',
    features: ['Everything in Pro', 'Lifetime updates', 'Self-host option', 'No recurring fees'],
    cta: 'Get lifetime access',
    popular: false,
  },
];

const PricingTable = () => (
  <section id="pricing" className="w-full max-w-6xl mx-auto px-6 py-24">
    <hr className="crypton-divider mb-24" />

    <div className="text-center mb-16 space-y-4">
      <div className="section-label mx-auto">
        <span className="accent-dot" />
        Pricing
      </div>
      <h2 className="section-heading">Choose the plan that fits.</h2>
      <p className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>
        Simple, transparent pricing. No hidden fees.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map(({ name, price, period, description, features, cta, popular }) => (
        <div
          key={name}
          className="relative flex flex-col p-8 rounded-2xl transition-premium"
          style={{
            background: popular ? 'rgba(191,255,0,0.04)' : 'var(--card)',
            border: `1px solid ${popular ? 'rgba(191,255,0,0.3)' : 'var(--border)'}`,
          }}
        >
          {/* Popular badge */}
          {popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{ background: 'var(--accent)', color: '#000' }}>
                Popular
              </span>
            </div>
          )}

          <div className="space-y-1 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{name}</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-white" style={{ letterSpacing: '-0.04em' }}>{price}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{period}</p>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>{description}</p>

          <ul className="space-y-3 mb-8 flex-1">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Check
                  size={14}
                  style={{ color: popular ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}
                />
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200"
            style={popular
              ? { background: 'var(--accent)', color: '#000' }
              : { background: 'transparent', border: '1px solid var(--border-hover)', color: '#fff' }
            }
          >
            {cta}
          </button>
        </div>
      ))}
    </div>
  </section>
);

export default PricingTable;
