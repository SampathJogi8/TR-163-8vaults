import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Shield, Zap, Hash, Type, Code2, ArrowRight } from 'lucide-react';

const IssueCard = ({ issue, onFileClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const severityColors = {
    Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    Major: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Minor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  const categoryIcons = {
    Security: <Shield size={14} />,
    CodeSmell: <AlertCircle size={14} />,
    TechnicalDebt: <Hash size={14} />,
    Performance: <Zap size={14} />,
    Naming: <Type size={14} />
  };

  return (
    <div className="glass-card rounded-[1.5rem] overflow-hidden group/card relative">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border tracking-widest ${severityColors[issue.severity]}`}>
            {issue.severity}
          </div>
          <div className="flex items-center gap-2 text-[10px] bg-white/[0.03] text-gray-500 font-bold px-3 py-1 rounded-full uppercase border border-white/5 tracking-widest">
            {categoryIcons[issue.category]}
            {issue.category}
          </div>
          {issue.file && (
            <button 
              onClick={() => onFileClick && onFileClick(issue.file)}
              className="flex items-center gap-2 text-[10px] text-accent hover:text-white font-black tracking-widest uppercase transition-premium"
            >
              <Code2 size={14} />
              {issue.file.split('/').pop()}{issue.line ? `:${issue.line}` : ''}
              <ArrowRight size={12} className="opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-premium" />
            </button>
          )}
        </div>

        <h4 className="text-2xl font-black text-white mb-3 tracking-tight font-['Outfit']">{issue.title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-3xl font-medium">{issue.description}</p>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 text-[10px] font-black tracking-[0.2em] transition-premium uppercase ${isOpen ? 'text-white' : 'text-accent hover:text-white'}`}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {isOpen ? 'Conceal Remediating Steps' : 'Reveal Neural Fix'}
        </button>

        {isOpen && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="p-8 bg-[#000] rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-white/[0.02] font-black text-4xl select-none pointer-events-none uppercase">Correction</div>
                <div className="text-accent mb-6 font-black uppercase tracking-[0.25em] text-[10px] flex items-center gap-3">
                  <Zap size={14} fill="currentColor" />
                  Remediation Protocol
                </div>
                <pre className="font-mono text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {issue.fix}
                </pre>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
