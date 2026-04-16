import React, { useState } from 'react';
import { Github, FileArchive, Play, Info, Sparkles, Cpu, Shield, Zap, Settings2 } from 'lucide-react';
import api from '../api';
import ProgressBar from '../components/ProgressBar';

const LandingPage = ({ onStartScan, progress, statusMessage }) => {
  const [inputType, setInputType] = useState('github'); // github | zip
  const [url, setUrl] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [standards, setStandards] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [provider, setProvider] = useState('auto');

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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#010101] relative overflow-hidden">
        <div className="star-field" />
        <div className="horizon-arc scale-150 blur-[150px] opacity-100 transition-all duration-1000" />
        
        <div className="relative z-10 text-center mb-16 animate-float">
          <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-10 border border-white/10 shadow-2xl">
            <Cpu className="text-white animate-pulse" size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight font-['Outfit']">
             Audit <span className="font-serif-italic">Emergence</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-widest uppercase text-[10px]">Deconstructing neural pathways and architecture...</p>
        </div>
        
        <div className="w-full max-w-xl relative z-10">
          <ProgressBar progress={progress} message={statusMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#010101] selection:bg-white/10 relative overflow-hidden">
      {/* Celestial Background */}
      <div className="star-field" />
      <div className="horizon-arc" />
      
      {/* Top Navigation Watermark */}
      <div className="absolute top-10 left-10 z-20 flex items-center gap-4 opacity-40 hover:opacity-100 transition-premium cursor-crosshair">
        <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded-lg font-black text-[10px]">DS</div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Intelligence</span>
      </div>

      <div className="max-w-4xl w-full relative z-10 flex flex-col items-center">
        
        <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-white/40 text-[9px] font-black tracking-[0.3em] uppercase mb-12 backdrop-blur-md">
            <Sparkles size={12} className="text-white/60" />
            Neural Audit Framework v1.0
          </div>
          <h1 className="text-7xl lg:text-[100px] font-black text-white mb-10 tracking-tighter font-['Outfit'] leading-[0.85]">
            Neural audits come to those <span className="font-serif-italic text-white underline decoration-white/10 underline-offset-8 decoration-1">who scan.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            The future of codebase intelligence. Identify structural entropy 
            and logic gaps with <span className="text-white">autonomous precision</span>.
          </p>
        </header>

        {/* Celestial Command Console */}
        <div className="w-full max-w-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-black/60 backdrop-blur-3xl rounded-[2rem] p-4 border border-white/10 shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder={inputType === 'github' ? "Enter GitHub Repository URL" : "ZIP archive detected..."}
                  readOnly={inputType === 'zip'}
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-white/20 rounded-2xl px-10 py-6 text-white outline-none transition-premium placeholder:text-gray-700 font-medium text-lg pr-40"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                
                <div className="absolute right-3 flex items-center gap-2">
                  <button 
                    onClick={handleAnalyze}
                    className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-200 active:scale-95 transition-all shadow-xl"
                  >
                    Execute Scan
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex gap-6">
                  <button 
                    onClick={() => setInputType(inputType === 'github' ? 'zip' : 'github')}
                    className="flex items-center gap-2 text-[9px] font-black text-white/40 hover:text-white transition-premium uppercase tracking-widest"
                  >
                    {inputType === 'github' ? <FileArchive size={14} /> : <Github size={14} />}
                    Switch to {inputType === 'github' ? 'Local Archive' : 'Source Repo'}
                  </button>
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-2 text-[9px] font-black transition-premium uppercase tracking-widest ${showAdvanced ? 'text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    <Settings2 size={14} />
                    Configuration
                  </button>
                </div>
                
                {inputType === 'zip' && zipFile && (
                  <div className="flex items-center gap-2 text-[9px] font-black text-green-500 uppercase tracking-widest">
                    <Shield size={12} /> Archive Ready
                  </div>
                )}
              </div>

              {/* Advanced Panel */}
              {showAdvanced && (
                <div className="p-4 bg-white/[0.02] border-t border-white/5 rounded-b-2xl animate-in fade-in slide-in-from-top-4 duration-500 mt-2">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Analysis Core</label>
                      <select 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-[10px] outline-none font-bold tracking-widest uppercase cursor-pointer"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                      >
                        <option value="auto">AUTODETECT (OPTIMIZED)</option>
                        <option value="anthropic">CLAUDE-3 SONNET</option>
                        <option value="gemini">GOOGLE GEMINI 2.0</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Language Mapping</label>
                      <select 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-[10px] outline-none font-bold tracking-widest uppercase cursor-pointer"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="auto">AUTO-PROTOCOL</option>
                        <option value="javascript">JS / TS MODULES</option>
                        <option value="python">PY (NEURAL ARCH)</option>
                      </select>
                    </div>
                  </div>
                  
                  {inputType === 'zip' && (
                    <div className="mb-6">
                       <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 hover:border-white/30 bg-white/[0.01] rounded-2xl cursor-pointer transition-premium group/upload">
                        <div className="flex items-center gap-3">
                          <FileArchive className="text-white/20 group-hover/upload:text-white transition-premium" size={20} />
                          <p className="text-[9px] font-black text-white/20 group-hover/upload:text-white transition-premium uppercase tracking-widest">
                            {zipFile ? 'File Anchored' : 'Select Local Repository ZIP'}
                          </p>
                        </div>
                        <input type="file" className="hidden" accept=".zip" onChange={handleFileChange} />
                      </label>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Compliance Standards</label>
                    <textarea 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-xs outline-none focus:border-white/20 transition-premium h-24 font-mono placeholder:text-gray-800"
                      placeholder="Specify custom architectural constraints or patterns..."
                      value={standards}
                      onChange={(e) => setStandards(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-24 text-center text-[9px] font-black text-white/10 hover:text-white/20 transition-premium uppercase tracking-[0.5em] flex items-center justify-center gap-16 cursor-default">
          <div className="flex items-center gap-3"><Shield size={14}/> Immutable Audit</div>
          <div className="flex items-center gap-3"><Zap size={14}/> Neural Compute</div>
          <div className="flex items-center gap-3"><Cpu size={14}/> 100% Automated</div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
