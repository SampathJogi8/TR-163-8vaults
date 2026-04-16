import React from 'react';
import { ArrowLeft, FileCode, CheckCircle2, ChevronRight, Hash, Code2, ShieldAlert } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import AestheticBackground from '../components/AestheticBackground';

const FileDetail = ({ file, issues, onBack }) => {
  if (!file) return null;

  return (
    <AestheticBackground>
      <div className="p-6 lg:p-12 relative animate-in fade-in ease-out duration-700">
        {/* Visual Asset: Neural Nebula (File Detail Variant) */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] pointer-events-none opacity-20 blur-[120px] translate-x-1/4 translate-y-1/4">
          <img 
            src="/assets/hero-nebula.png" 
            alt="Neural Nebula" 
            className="w-full h-full object-contain animate-float"
          />
        </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-16">
          <button 
            onClick={onBack}
            className="group flex items-center gap-3 text-gray-600 hover:text-white transition-premium text-[10px] font-black tracking-[0.3em] uppercase mb-12"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-premium" />
            Navigate to Dashboard
          </button>
          
          <div className="flex flex-wrap items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-[2rem] flex items-center justify-center text-accent shadow-2xl shadow-accent/10">
                <FileCode size={40} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h1 className="text-5xl font-black text-white tracking-tighter font-['Outfit']">{file.path.split('/').pop()}</h1>
                <p className="text-gray-600 font-bold text-[10px] tracking-widest uppercase flex items-center gap-3">
                   <Hash size={12} className="text-accent" /> {file.path}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 pr-10">
              <div className="space-y-1">
                <div className={`text-5xl font-black font-['Outfit'] tracking-tighter ${
                  file.color === 'red' ? 'text-red-500 neon-text' : 
                  file.color === 'amber' ? 'text-amber-500 neon-text' : 'text-green-500 neon-text'
                }`}>
                  {file.score}
                </div>
                <div className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em] leading-none">Vulnerability Score</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 px-2">
          <div className="glass-card rounded-3xl p-8 border border-white/5">
            <div className="text-gray-700 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Total Findings</div>
            <div className="text-4xl font-black text-white font-['Outfit'] tracking-tight">{file.issueCount}</div>
          </div>
          <div className="glass-card rounded-3xl p-8 border border-white/5">
            <div className="text-gray-700 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Source Volume</div>
            <div className="text-4xl font-black text-white font-['Outfit'] tracking-tight">{file.lineCount} <span className="text-xs text-gray-800 font-bold tracking-widest uppercase ml-1">Lines</span></div>
          </div>
          <div className="glass-card rounded-3xl p-8 border border-white/5">
            <div className="text-gray-700 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Module Health</div>
            <div className={`text-2xl font-black flex items-center gap-3 mt-1 uppercase tracking-tight font-['Outfit'] ${
              file.color === 'red' ? 'text-red-500' : 
              file.color === 'amber' ? 'text-amber-500' : 'text-green-500'
            }`}>
              {file.color === 'red' ? 'Critical Entropy' : file.color === 'amber' ? 'Attention Needed' : 'Optimized'}
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                file.color === 'red' ? 'bg-red-500' : 
                file.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'
              }`} />
            </div>
          </div>
        </div>

        <div className="mb-12 flex items-center justify-between px-2">
           <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-4 font-['Outfit']">
            <Code2 className="text-accent" size={24} />
            Diagnostic Report
          </h3>
          <div className="flex items-center gap-2 text-gray-700 text-[10px] font-black uppercase tracking-[0.3em]">
             Hierarchy <ChevronRight size={14} /> Severity Sort
          </div>
        </div>

        <div className="space-y-6">
          {issues.length > 0 ? (
            issues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))
          ) : (
            <div className="text-center py-32 glass-panel rounded-[3rem] border border-white/5 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2x shadow-green-500/5">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <p className="text-white text-xl font-black tracking-tight font-['Outfit'] mb-2 uppercase">Zero Entropy Detected</p>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">This module meets all high-fidelity reasoning standards.</p>
            </div>
          )}
        </div>
        
        <footer className="mt-24 border-t border-white/5 pt-12 text-center text-[10px] font-black text-gray-800 uppercase tracking-[0.4em] flex items-center justify-center gap-12 opacity-50">
           <div className="flex items-center gap-2">DIAGNOSTIC HASH: {Math.random().toString(36).substring(7).toUpperCase()}</div>
           <div className="flex items-center gap-2"><ShieldAlert size={14} /> CLASSIFIED AUDIT</div>
        </footer>
      </div>
    </AestheticBackground>
  );
};

export default FileDetail;
