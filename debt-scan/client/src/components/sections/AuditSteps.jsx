import React from 'react';
import { ChevronRight } from 'lucide-react';

const AuditSteps = () => {
  const steps = [
    {
      id: "01",
      title: "Connect Source",
      description: "Provide a public GitHub URL or upload a local repository ZIP. Our system begins structural mapping immediately."
    },
    {
      id: "02",
      title: "Execute Intelligence",
      description: "Our dual-core reasoning engine scans for security leaks, logic gaps, and architectural fragility."
    },
    {
      id: "03",
      title: "Deconstruct Debt",
      description: "Access an interactive health dashboard with prioritized fixes and structural gap analysis."
    }
  ];

  return (
    <section className="w-full max-w-5xl py-32 px-6">
      <div className="text-center mb-24">
        <div className="inline-flex items-center px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-white/40 text-[9px] font-black tracking-widest uppercase mb-8">
          The Deployment Path
        </div>
        <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
          Three steps to <br/>
          <span className="font-serif-italic">Codebase Clarity.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        {/* Connection Line */}
        <div className="hidden lg:block absolute top-[2.25rem] left-0 w-full h-[1px] bg-white/5 -z-10" />
        
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center reveal">
            <div className="w-18 h-18 bg-black border border-white/10 rounded-3xl flex items-center justify-center mb-10 text-xl font-black text-white shadow-2xl relative">
              <div className="absolute inset-0 bg-accent/5 blur-xl rounded-full" />
              <span className="relative">{step.id}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">{step.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed max-w-[280px]">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AuditSteps;
