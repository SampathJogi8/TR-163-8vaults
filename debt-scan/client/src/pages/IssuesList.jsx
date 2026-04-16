import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowLeft, ArrowUpDown, ChevronRight, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import AestheticBackground from '../components/AestheticBackground';

const IssuesList = ({ issues, onBack, onFileClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('severity'); // severity | file | category

  const categories = ['Security', 'CodeSmell', 'TechnicalDebt', 'Performance', 'Naming'];
  const severities = ['Critical', 'Major', 'Minor'];

  const filteredIssues = useMemo(() => {
    let result = [...issues];

    if (searchTerm) {
      result = result.filter(i => 
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.file.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'All') {
      result = result.filter(i => i.severity === severityFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter(i => i.category === categoryFilter);
    }

    const severityWeight = { Critical: 3, Major: 2, Minor: 1 };

    result.sort((a, b) => {
      if (sortBy === 'severity') {
        return severityWeight[b.severity] - severityWeight[a.severity];
      }
      if (sortBy === 'file') {
        return a.file.localeCompare(b.file);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    return result;
  }, [issues, searchTerm, severityFilter, categoryFilter, sortBy]);
  return (
    <AestheticBackground>
      <div className="p-6 lg:p-12 relative">
        {/* Visual Asset: Neural Nebula (Audit Variant) */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] pointer-events-none opacity-20 blur-[120px] -translate-x-1/2 -translate-y-1/2">
          <img 
            src="/assets/hero-nebula.png" 
            alt="Neural Nebula" 
            className="w-full h-full object-contain animate-float"
          />
        </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-16">
          <button 
            onClick={onBack}
            className="group flex items-center gap-3 text-gray-600 hover:text-white transition-premium text-[10px] font-black tracking-[0.3em] uppercase mb-10"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-premium" />
            Back to Overview
          </button>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="space-y-2">
               <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] font-black uppercase tracking-widest">Master Audit Log</div>
                  <div className="text-gray-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} className="text-accent/40" /> {issues.length} Issues Identified
                  </div>
               </div>
               <h1 className="text-6xl font-black text-white tracking-tighter font-['Outfit']">Engineering <span className="text-accent underline decoration-accent/10 decoration-8 underline-offset-12">Audit</span></h1>
            </div>
            
            <div className="flex gap-4 p-2 bg-white/[0.03] rounded-2xl border border-white/5">
               <div className="text-center px-6 border-r border-white/5">
                  <div className="text-xl font-black text-red-500 font-['Outfit']">{issues.filter(i => i.severity === 'Critical').length}</div>
                  <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Critical</div>
               </div>
               <div className="text-center px-6 border-r border-white/5">
                  <div className="text-xl font-black text-amber-500 font-['Outfit']">{issues.filter(i => i.severity === 'Major').length}</div>
                  <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Major</div>
               </div>
               <div className="text-center px-6">
                  <div className="text-xl font-black text-emerald-500 font-['Outfit']">{issues.filter(i => i.severity === 'Minor').length}</div>
                  <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Minor</div>
               </div>
            </div>
          </div>
        </header>

        <div className="glass-panel rounded-[2rem] p-8 mb-12 border border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-premium" size={18} />
              <input 
                type="text"
                placeholder="Search by title, file or intelligence type..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:border-accent/40 outline-none transition-premium font-medium placeholder:text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-premium"><Filter size={16} /></div>
              <select 
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs text-white outline-none focus:border-accent/40 appearance-none transition-premium cursor-pointer font-bold tracking-widest uppercase"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="All">All Severities</option>
                {severities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-premium"><ArrowUpDown size={16} /></div>
              <select 
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs text-white outline-none focus:border-accent/40 appearance-none transition-premium cursor-pointer font-bold tracking-widest uppercase"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="severity">Sort by Severity</option>
                <option value="file">Sort by Filename</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 border-t border-white/[0.03] pt-8">
            <button 
              onClick={() => setCategoryFilter('All')}
              className={`px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] border transition-premium ${categoryFilter === 'All' ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-transparent border-white/5 text-gray-600 hover:border-white/20'}`}
            >
              GLOBAL
            </button>
            {categories.map(c => (
              <button 
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] border transition-premium ${categoryFilter === c ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-transparent border-white/5 text-gray-600 hover:border-white/20'}`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 px-2">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} onFileClick={onFileClick} />
            ))
          ) : (
            <div className="text-center py-32 glass-panel rounded-[3rem] border border-white/5">
              <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck size={32} className="text-gray-800" />
              </div>
              <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No entries match your diagnostic filters.</p>
            </div>
          )}
        </div>
        
        <footer className="mt-24 border-t border-white/5 pt-12 flex items-center justify-between text-[10px] font-black text-gray-800 uppercase tracking-[0.4em] opacity-40 px-2">
           <div className="flex items-center gap-4">
              <AlertTriangle size={14} /> SECURITY CLEARANCE: LEVEL 4
           </div>
           <div className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-accent" /> SYSTEM SECURE
           </div>
        </footer>
      </div>
    </div>
  );
};

export default IssuesList;
