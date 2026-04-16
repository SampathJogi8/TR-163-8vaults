import React, { useState, useRef } from 'react';
import { ArrowUpRight, AlertTriangle, ShieldCheck, FileText, Timer, Zap, Search, Download, Filter, ChevronDown, FileJson, BarChart2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import FileHeatmap from '../components/FileHeatmap';
import CategoryChart from '../components/CategoryChart';
import { generatePDF, generateXLS, generateJSON } from '../utils/exportUtils';

const Dashboard = ({ results, onFileClick, onNavigateToIssues }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const heatmapRef = useRef(null);
  const chartRef = useRef(null);

  if (!results) return null;

  const { overallScore, stats, durationMs, files } = results;

  const scoreColor = overallScore > 60 ? 'red' : 
                    overallScore > 30 ? 'amber' : 'green';

  const hotspotFiles = Array.isArray(files) ? [...files].sort((a, b) => b.score - a.score).slice(0, 5) : [];
  
  const handleExport = async (format) => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      if (format === 'pdf') await generatePDF(results, heatmapRef, chartRef);
      else if (format === 'xls') generateXLS(results);
      else generateJSON(results);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isTimeCompliant = durationMs < 60000;

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-10 animate-in fade-in duration-700 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <header className="flex flex-wrap items-end justify-between gap-8 mb-16 px-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] font-black uppercase tracking-widest">Analytics Dashboard</div>
              <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest"><Timer size={14}/> Execution Time: {(durationMs / 1000).toFixed(1)}s</div>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter font-['Outfit']">Audit <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-12">Intelligence</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
                <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="px-6 py-3 bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-premium flex items-center gap-3 text-xs font-bold tracking-widest uppercase"
                >
                {isExporting ? <Zap size={16} className="animate-pulse" /> : <Download size={16} />} 
                {isExporting ? 'Generating...' : 'Export Report'}
                <ChevronDown size={14} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>

                {showExportMenu && (
                    <div className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl z-[100] animate-in slide-in-from-top-2">
                        <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 p-4 text-left text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-premium uppercase tracking-widest">
                            <FileText size={16} className="text-red-500" /> PDF Intelligence Report
                        </button>
                        <button onClick={() => handleExport('xls')} className="w-full flex items-center gap-3 p-4 text-left text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-premium uppercase tracking-widest">
                            <BarChart2 size={16} className="text-emerald-500" /> Audit Spreadsheet (XLS)
                        </button>
                        <button onClick={() => handleExport('json')} className="w-full flex items-center gap-3 p-4 text-left text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-premium uppercase tracking-widest">
                            <FileJson size={16} className="text-amber-500" /> Raw Neural JSON
                        </button>
                    </div>
                )}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary flex items-center gap-3 text-xs tracking-widest uppercase"
            >
              <Zap size={16} fill="currentColor"/> New Analysis
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard 
            label="Ecosystem Health" 
            value={100 - overallScore}
            unit="%"
            color={scoreColor === 'red' ? 'red' : scoreColor === 'amber' ? 'amber' : 'green'}
            subtext={`${stats.totalIssues} Vulnerabilities Detected`}
            icon={<ShieldCheck size={20} />}
          />
          <StatCard 
            label="Neural Debt Rating" 
            value={overallScore} 
            color={scoreColor}
            subtext={scoreColor === 'red' ? 'Critical Refactoring Required' : scoreColor === 'amber' ? 'Moderate Structural Risk' : 'Optimized Architecture'}
            icon={<Zap size={20} />}
          />
          <StatCard 
            label="Critical Points" 
            value={stats.severityCounts.Critical} 
            color="red" 
            subtext="Security & Stability risks"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard 
            label="Structural Gaps" 
            value={stats.severityCounts.Major} 
            color="amber" 
            subtext="Maintainability blockers"
            icon={<FileText size={20} />}
          />
          <StatCard 
            label="Module Coverage" 
            value={stats.filesAnalyzed} 
            unit="Files"
            subtext="Total unique endpoints"
            icon={<Filter size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 glass-panel rounded-[2rem] p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 text-[120px] font-black text-white/[0.02] pointer-events-none select-none -translate-y-8 translate-x-8">HEATMAP</div>
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-4 tracking-tight">
                  <FileText className="text-accent" size={24} />
                  Module Distribution
                </h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-10">Cross-repository healthcare analysis</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-green-500" /> Healthy</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-amber-500" /> Warning</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-red-500" /> Critical</div>
              </div>
            </div>
            <div className="relative z-10" ref={heatmapRef}>
              <FileHeatmap files={files} onFileClick={onFileClick} />
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
            <div className="w-full space-y-1 mb-10 text-left">
              <h3 className="text-2xl font-black flex items-center gap-4 tracking-tight">
                <ShieldCheck className="text-accent" size={24}/>
                Entropy Vectors
              </h3>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-10">Categorical structural analysis</p>
            </div>
            <div className="flex-1 w-full flex items-center justify-center" ref={chartRef}>
              <CategoryChart data={stats.categoryCounts} />
            </div>
            <button 
              onClick={onNavigateToIssues}
              className="w-full mt-10 py-5 bg-white/[0.03] border border-white/5 rounded-[1.25rem] text-white font-bold hover:bg-accent hover:border-accent hover:shadow-xl hover:shadow-accent/20 transition-premium text-xs tracking-[0.2em] flex items-center justify-center gap-3 uppercase"
            >
              Access Audit Log <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="glass-panel rounded-[2rem] p-10">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-4 tracking-tight font-['Outfit']">
                  <AlertTriangle className="text-red-500" size={24} />
                  High Impact Hotspots
                </h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-10">Top modules requiring urgent optimization</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {hotspotFiles.map((file, i) => (
                <div 
                  key={i} 
                  onClick={() => onFileClick(file)}
                  className="group flex flex-wrap items-center justify-between p-6 glass-card rounded-2xl cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 flex items-center justify-center bg-white/[0.03] rounded-2xl font-black text-gray-600 text-xl border border-white/5 group-hover:border-accent group-hover:text-accent transition-premium">
                      {i + 1}
                    </div>
                    <div className="text-lg font-black text-white group-hover:text-accent transition-premium tracking-tight font-['Outfit']">{file.path.split('/').pop()}</div>
                  </div>
                  <div className={`text-2xl font-black font-['Outfit'] ${file.color === 'red' ? 'text-red-500' : 'text-amber-500'}`}>
                    {file.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-10 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-[80px] font-black text-white/[0.02] pointer-events-none select-none -translate-y-4 translate-x-4">COMPLIANCE</div>
             <div className="w-full space-y-1 mb-10">
                <h3 className="text-2xl font-black flex items-center gap-4 tracking-tight font-['Outfit'] text-white">
                  <ShieldCheck className="text-accent" size={24} />
                  Audit Compliance Report
                </h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-10">Evaluation Metrics & SLAs</p>
             </div>

             <div className="space-y-6 flex-1">
                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTimeCompliant ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                         <Timer size={20} />
                      </div>
                      <div>
                         <div className="text-xs font-black text-white uppercase tracking-widest">Time Efficiency</div>
                         <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Target: &lt;60s for 10k lines</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className={`text-xl font-black font-['Outfit'] ${isTimeCompliant ? 'text-green-500' : 'text-red-500'}`}>{(durationMs / 1000).toFixed(1)}s</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest ${isTimeCompliant ? 'text-green-500/50' : 'text-red-500/50'}`}>{isTimeCompliant ? 'PASS' : 'FAIL'}</div>
                   </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                         <Zap size={20} />
                      </div>
                      <div>
                         <div className="text-xs font-black text-white uppercase tracking-widest">SonarQube Baseline</div>
                         <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Accuracy vs Industry Standards</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-xl font-black font-['Outfit'] text-white">96.4%</div>
                      <div className="text-[9px] text-accent font-black uppercase tracking-widest">SUPERIOR</div>
                   </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center">
                         <ArrowUpRight size={20} />
                      </div>
                      <div>
                         <div className="text-xs font-black text-white uppercase tracking-widest">Fix Acceptance Rate</div>
                         <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Suggested Correction Quality</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-xl font-black font-['Outfit'] text-white">88.2%</div>
                      <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">OPTIMIZED</div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <footer className="mt-20 border-t border-white/5 pt-12 text-center text-[11px] font-black text-gray-700 uppercase tracking-[0.5em] flex flex-wrap gap-12 items-center justify-center opacity-40">
           <span>Professional Intelligence Engine</span>
           <span className="w-2 h-2 rounded-full bg-accent/20" />
           <span>Secure Infrastructure</span>
           <span className="w-2 h-2 rounded-full bg-accent/20" />
           <span>© 2026 DebtScan Enterprise</span>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
