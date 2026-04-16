import React from 'react';
import { Check } from 'lucide-react';

const PlanCard = ({ title, price, description, features, popular = false }) => (
  <div className={`pricing-card reveal ${popular ? 'popular' : ''}`}>
    <div className="mb-10">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-4">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-black text-white tracking-tighter">${price}</span>
        <span className="text-gray-600 font-bold text-sm tracking-widest uppercase">/ Month</span>
      </div>
      <p className="mt-6 text-gray-500 font-medium text-sm leading-relaxed">{description}</p>
    </div>
    
    <div className="space-y-4 mb-12 flex-grow">
      {features.map((feature, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${popular ? 'bg-white text-black' : 'bg-white/5 text-gray-500'}`}>
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-sm text-gray-400 font-medium">{feature}</span>
        </div>
      ))}
    </div>

    <button className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-premium ${popular ? 'bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/10' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
      Select Protocol
    </button>
  </div>
);

const PricingTable = () => {
  const plans = [
    {
      title: "Hobbyist",
      price: "0",
      description: "Ideal for open-source exploration and single developers.",
      features: [
        "3 Repository Audits / mo",
        "Public GitHub Only",
        "Basic Debt Scoring",
        "Standard Reasoning Engine"
      ]
    },
    {
      title: "Professional",
      price: "49",
      popular: true,
      description: "Scale your software quality with deep architectural insights.",
      features: [
        "Unlimited Repositories",
        "ZIP & Private Repo support",
        "Advanced Gap Analysis",
        "Dual-Core LLM Engine",
        "Custom Compliance Standards"
      ]
    },
    {
      title: "Enterprise",
      price: "199",
      description: "Massive scale analysis for modern organizations.",
      features: [
        "Multi-Org Support",
        "API access for CI/CD",
        "Custom Neural Training",
        "Priority Reasoning Nodes",
        "Dedicated Success Arch"
      ]
    }
  ];

  return (
    <section className="w-full max-w-6xl py-32 px-6 text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px] -z-10" />
      
      <div className="mb-24">
        <div className="inline-flex items-center px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-white/40 text-[9px] font-black tracking-widest uppercase mb-8">
          Analysis Economics
        </div>
        <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6">
          Simple Plans, <br/>
          <span className="font-serif-italic">Powerful Audits.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-12">
        {plans.map((plan, i) => (
          <PlanCard key={i} {...plan} />
        ))}
      </div>
    </section>
  );
};

export default PricingTable;
