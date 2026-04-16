import React, { useState } from 'react';
import { Github, FileArchive, ChevronDown, ChevronUp, Play, Info, Sparkles, Cpu, Shield, Zap } from 'lucide-react';
import api from '../api';
import ProgressBar from '../components/ProgressBar';

const LandingPage = ({ onStartScan, progress, statusMessage }) => {
  const [inputType, setInputType] = useState('github'); // github | zip
  const [url, setUrl] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [standards, setStandards] = useState('');
  const [expandStandards, setExpandStandards] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [provider, setProvider] = useState('auto'); // auto | anthropic | openai | gemini | openrouter

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setZipFile(event.target.result.split(',')[1]); // Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (inputType === 'github' && !url) return alert('Please enter a GitHub URL');
    if (inputType === 'zip' && !zipFile) return alert('Please upload a ZIP file');

    setIsScanning(true);
    try {
      const res = await api.post('/api/analyze', {
        type: inputType,
        url: inputType === 'github' ? url : undefined,
        zipBase64: inputType === 'zip' ? zipFile : undefined,
        language: language === 'auto' ? undefined : language,
        standards,
        provider
      });
      onStartScan(res.data.scanId);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert('Analysis failed: ' + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" />
        
        <div className="relative z-10 text-center mb-16">
          <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-8 neon-glow border border-accent/30">
            <Cpu className="text-accent animate-spin-slow" size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight font-['Outfit']">
            Neural <span className="text-accent">Audit</span> In Progress
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">Deconstructing codebase architecture and identifying entropy...</p>
        </div>
        
        <div className="w-full max-w-xl">
          <ProgressBar progress={progress} message={statusMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] selection:bg-accent/30 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <div className="max-w-5xl w-full relative z-10">
        <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-8 backdrop-blur-md">
            <Sparkles size={12} className="text-accent" />
            Next-Gen Technical Debt Analysis
          </div>
          <h1 className="text-8xl font-black text-white mb-8 tracking-tighter font-['Outfit'] leading-[0.9]">
            Debt<span className="text-accent neon-text">Scan</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            The elite reasoning engine for modern codebases. Identify logic gaps, 
            security leaks, and structural debt with <span className="text-white">enterprise-grade precision</span>.
          </p>
        </header>

        <div className="glass-panel rounded-[2.5rem] p-4 sm:p-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50 pointer-events-none" />
          
          <div className="bg-[#0a0a0a] rounded-[2rem] p-8 sm:p-12 relative z-10">
            <div className="flex bg-white/5 p-1.5 rounded-2xl mb-10 border border-white/5">
              <button 
                onClick={() => setInputType('github')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-premium ${inputType === 'github' ? 'bg-accent text-white shadow-xl neon-glow' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <Github size={20} />
                <span className="font-bold text-sm tracking-tight uppercase">Source Repository</span>
              </button>
              <button 
                onClick={() => setInputType('zip')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-premium ${inputType === 'zip' ? 'bg-accent text-white shadow-xl neon-glow' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <FileArchive size={20} />
                <span className="font-bold text-sm tracking-tight uppercase">Local Archive</span>
              </button>
            </div>

            <div className="space-y-8">
              {inputType === 'github' ? (
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="https://github.com/organization/infrastructure"
                    className="w-full bg-white/[0.03] border-2 border-white/5 focus:border-accent/50 rounded-2xl px-8 py-5 text-white outline-none transition-premium placeholder:text-gray-700 font-medium text-lg"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2">
                    <Shield size={14} className="text-accent" /> Public access required for analysis
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 hover:border-accent/40 bg-white/[0.02] rounded-2xl cursor-pointer transition-premium group/upload">
                  <div className="flex flex-col items-center justify-center">
                    <FileArchive className="mb-4 text-gray-600 group-hover/upload:text-accent transition-premium" size={40} />
                    <p className="text-sm font-bold text-gray-500 group-hover/upload:text-gray-300 transition-premium uppercase tracking-widest">
                      {zipFile ? 'Ready to analyze' : 'Drag & Drop Codebase Archive'}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept=".zip" onChange={handleFileChange} />
                </label>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-1">Language Protocol</label>
                  <select 
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-5 text-white outline-none appearance-none focus:border-accent/50 transition-premium cursor-pointer font-bold text-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="auto">AUTODETECT ARCHITECTURE</option>
                    <option value="javascript">JAVASCRIPT / TYPESCRIPT</option>
                    <option value="python">PYTHON (AI/ML)</option>
                    <option value="java">JAVA (REST/ENTERPRISE)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-1">Reasoning Core</label>
                  <div className="grid grid-cols-3 gap-2 bg-white/[0.03] p-1.5 rounded-2xl border-2 border-white/5">
                    <button onClick={() => setProvider('auto')} className={`py-3 rounded-xl text-[9px] font-black tracking-widest transition-premium ${provider === 'auto' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>AUTO</button>
                    <button onClick={() => setProvider('anthropic')} className={`py-3 rounded-xl text-[9px] font-black tracking-widest transition-premium ${provider === 'anthropic' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>CLAUDE</button>
                    <button onClick={() => setProvider('openrouter')} className={`py-3 rounded-xl text-[9px] font-black tracking-widest transition-premium ${provider === 'openrouter' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>SONNET.R</button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleAnalyze}
                  className="btn-primary w-full py-6 text-base tracking-[0.2em] flex items-center justify-center gap-4 group/btn"
                >
                  <Play size={20} fill="currentColor" className="group-hover:translate-x-1 transition-premium" />
                  EXECUTE FULL SCAN
                  <Zap size={18} className="text-white/50" />
                </button>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setExpandStandards(!expandStandards)}
                  className="flex items-center gap-3 text-[10px] font-black text-white/20 hover:text-accent transition-premium py-2 tracking-[0.25em]"
                >
                  {expandStandards ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  CUSTOM COMPLIANCE STANDARDS (OPTIONAL)
                </button>
                {expandStandards && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <textarea 
                      className="w-full mt-4 bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-accent/40 transition-premium h-32 font-mono text-xs placeholder:text-gray-800 leading-relaxed"
                      placeholder="Specify your team's unique coding patterns, restricted libraries, or architectural constraints..."
                      value={standards}
                      onChange={(e) => setStandards(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-[10px] font-bold text-gray-700 uppercase tracking-[0.4em] flex items-center justify-center gap-12">
          <div className="flex items-center gap-3"><Shield size={14} className="text-accent/40" /> SECURE AUDIT</div>
          <div className="flex items-center gap-3"><Zap size={14} className="text-accent/40" /> NEURAL ENGINE</div>
          <div className="flex items-center gap-3"><Cpu size={14} className="text-accent/40" /> 100% AUTOMATED</div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
