import React from 'react';
import { Shield, Zap, Cpu, BarChart3, Search, Code2 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, size = "small" }) => (
  <div className={`bento-card group reveal ${size === "large" ? 'col-span-12 lg:col-span-8' : 'col-span-12 lg:col-span-4'}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-premium" />
    <div className="relative z-10 h-full flex flex-col">
      <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-accent/40 transition-premium">
        <Icon className="text-white/60 group-hover:text-white transition-premium" size={24} />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
  </div>
);

const FeaturesGrid = () => {
  return (
    <section className="w-full max-w-6xl py-32 px-6 relative">
      <div className="section-glow" />
      
      <header className="mb-20">
        <div className="inline-flex items-center px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-white/40 text-[9px] font-black tracking-widest uppercase mb-6">
          Architectural Intelligence
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6">
          Built for Complexity, <br/>
          <span className="font-serif-italic">Designed for Security.</span>
        </h2>
        <p className="text-gray-500 max-w-xl font-medium">Our reasoning core deconstructs legacy logic and modern frameworks with equal precision.</p>
      </header>

      <div className="bento-grid">
        <FeatureCard 
          size="large"
          icon={Search}
          title="Deep Logic Inspection"
          description="Advanced cross-file analysis that detects subtle logic gaps often missed by standard static analysis. Our LLM core understands the intent behind your code, not just the syntax."
        />
        <FeatureCard 
          icon={Shield}
          title="Zero-Trust Audits"
          description="Every scan is sandboxed and secure. We identify security leaks and fragile patterns without ever storing your source code permanently."
        />
        <FeatureCard 
          icon={Zap}
          title="Neural Deduplication"
          description="Smart merging of findings across large codebases. We group similar architectural issues into high-impact reported items."
        />
        <FeatureCard 
          size="large"
          icon={BarChart3}
          title="Debt Health Scoring"
          description="Quantify your technical debt with enterprise-grade metrics. Our scoring engine breaks down issues by severity, category, and structural impact."
        />
        <FeatureCard 
          icon={Code2}
          title="Multi-Lang Core"
          description="Seamless support for Python, JavaScript, TypeScript, and Java. One engine for your entire ecosystem."
        />
      </div>
    </section>
  );
};

export default FeaturesGrid;
