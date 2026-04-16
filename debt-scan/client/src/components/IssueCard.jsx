import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Shield, Zap, Hash, Type, Code2, ArrowRight } from 'lucide-react';

const IssueCard = ({ issue, onFileClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const severityColors = {
    Critical: 'text-red-500 border-red-500/30 bg-red-500/5',
    Major: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
    Minor: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
  };

  const glowColors = {
    Critical: 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    Major: 'bg-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    Minor: 'bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
  };

  const categoryIcons = {
    Security: <Shield size={14} />,
    CodeSmell: <AlertCircle size={14} />,
    TechnicalDebt: <Hash size={14} />,
    Performance: <Zap size={14} />,
    Naming: <Type size={14} />
  };

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden group/card relative transition-premium hover:border-white/20">
      {/* Localized Severity Glow */}
      <div className={`absolute -left-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none ${glowColors[issue.severity]}`} />
      
      <div className="p-8 sm:p-10 relative z-10">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase border tracking-[0.2em] animate-pulse ${severityColors[issue.severity]}`}>
            {issue.severity}
          </div>
          <div className="flex items-center gap-2 text-[9px] bg-white/[0.03] text-gray-500 font-black px-4 py-1.5 rounded-full uppercase border border-white/5 tracking-[0.2em]">
            {categoryIcons[issue.category]}
            {issue.category}
          </div>
          {issue.file && (
            <button 
              onClick={() => onFileClick && onFileClick(issue.file)}
              className="flex items-center gap-3 text-[9px] text-accent hover:text-white font-black tracking-[0.2em] uppercase transition-premium ml-auto"
            >
              <Code2 size={16} strokeWidth={1.5} />
              <span className="font-mono">{issue.file.split('/').pop()}{issue.line ? `:${issue.line}` : ''}</span>
              <ArrowRight size={14} className="opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-premium" />
            </button>
          )}
        </div>

        <h4 className="text-3xl font-black text-white mb-4 tracking-tighter font-['Outfit'] group-hover/card:text-accent transition-premium">{issue.title}</h4>
        <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-4xl font-medium">{issue.description}</p>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-4 text-[10px] font-black tracking-[0.3em] transition-premium uppercase ${isOpen ? 'text-white' : 'text-accent/60 hover:text-accent'}`}
        >
          <div className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center transition-premium ${isOpen ? 'bg-accent border-accent text-white' : 'group-hover/card:border-accent/40'}`}>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {isOpen ? 'Conceal Remediating Protocol' : 'Reveal Neural Fix'}
        </button>

        {isOpen && (
          <div className="mt-10 animate-in fade-in slide-in-from-top-6 duration-500">
             <div className="p-10 bg-black/60 backdrop-blur-3xl rounded-[2rem] border border-white/5 relative overflow-hidden group/fix">
                <div className="absolute top-0 right-0 p-8 text-[80px] font-black text-white/[0.01] pointer-events-none select-none -translate-y-4 translate-x-4 uppercase font-['Outfit']">Repair</div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="text-accent font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-4">
                    <Zap size={16} fill="currentColor" className="animate-pulse" />
                    Neural Suggestion Engine
                  </div>
                  <div className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-[9px] font-black text-gray-700 uppercase tracking-widest">v2.0 Logic</div>
                </div>

                <div className="font-mono text-[13px] text-gray-400 whitespace-pre-wrap leading-loose pl-4 border-l-2 border-accent/20">
                  {issue.fix}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
