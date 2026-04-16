import React from 'react';
import { Sparkles, Github, FileArchive, Settings2, Shield, Cpu } from 'lucide-react';

const HeroSection = ({ 
  inputType, setInputType, 
  url, setUrl, 
  handleAnalyze, 
  showAdvanced, setShowAdvanced,
  zipFile,
  provider, setProvider,
  language, setLanguage,
  standards, setStandards,
  handleFileChange,
  pastedCode, setPastedCode
}) => {
  const getNextInputType = () => {
    const modes = ['github', 'zip', 'paste'];
    const currentIndex = modes.indexOf(inputType);
    return modes[(currentIndex + 1) % modes.length];
  };

  const modeIcons = {
    github: <Github size={14} />,
    zip: <FileArchive size={14} />,
    paste: <Cpu size={14} />
  };

  const modeLabels = {
    github: 'Source Repo',
    zip: 'Local Archive',
    paste: 'Code Buffer'
  };
  return (
    <div className="max-w-6xl w-full relative z-10 flex flex-col items-center pt-20 pb-32 min-h-screen justify-center">
      {/* Visual Asset: Neural Nebula */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none opacity-60">
        <img 
          src="/assets/hero-nebula.png" 
          alt="Neural Nebula" 
          className="w-full h-full object-contain animate-float"
          style={{ filter: 'blur(20px) contrast(1.2)' }}
        />
      </div>

      <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-white/40 text-[9px] font-black tracking-[0.3em] uppercase mb-12 backdrop-blur-md">
          <Sparkles size={12} className="text-white/60" />
          Code Analysis Engine v1.0
        </div>
        <h1 className="text-7xl lg:text-[100px] font-black text-white mb-10 tracking-tighter font-['Outfit'] leading-[0.85]">
          Intelligent defaults for <span className="font-serif-italic text-white underline decoration-white/10 underline-offset-8 decoration-1">code review.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
          Automated codebase inspection. Identify vulnerabilities, technical debt, 
          and logical errors with <span className="text-white">high precision</span>.
        </p>
      </header>

      {/* Celestial Command Console */}
      <div className="w-full max-w-2xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-black/60 backdrop-blur-3xl rounded-[2rem] p-4 border border-white/10 shadow-2xl">
          <div className="flex flex-col gap-4">
                <div 
                  className={`w-full bg-white/[0.03] border border-white/5 focus:border-white/20 rounded-2xl px-10 py-6 text-white outline-none transition-premium placeholder:text-gray-700 font-medium text-lg pr-40 relative flex items-center ${inputType === 'zip' ? 'cursor-pointer group/zip' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file && file.name.endsWith('.zip')) {
                      setInputType('zip');
                      handleFileChange({ target: { files: [file] } });
                    }
                  }}
                >
                  {inputType === 'paste' ? (
                    <textarea 
                      placeholder="Paste your code snippet here..."
                      className="w-full bg-transparent border-none outline-none min-h-[120px] pt-4 font-mono text-sm resize-none scrollbar-hide"
                      value={pastedCode}
                      onChange={(e) => setPastedCode(e.target.value)}
                    />
                  ) : (
                    <input 
                      type="text" 
                      placeholder={inputType === 'github' ? "Enter GitHub Repository URL" : zipFile ? "Archive Anchored (Drag new to replace)" : "Drop ZIP archive here..."}
                      readOnly={inputType === 'zip'}
                      className="w-full bg-transparent border-none outline-none"
                      value={inputType === 'github' ? url : ''}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  )}
                  
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
                  onClick={() => setInputType(getNextInputType())}
                  className="flex items-center gap-2 text-[9px] font-black text-white/40 hover:text-white transition-premium uppercase tracking-widest"
                >
                  {modeIcons[getNextInputType()]}
                  Switch to {modeLabels[getNextInputType()]}
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
                      <option value="gemini">GOOGLE GEMINI 2.0</option>
                      <option value="deepseek">DEEPSEEK V3</option>
                      <option value="grok">xAI GROK-2</option>
                      <option value="anthropic">CLAUDE-3.5 SONNET</option>
                      <option value="openrouter">OPENROUTER ARCH</option>
                      <option value="openai">GPT-4O OMNI</option>
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
    </div>
  );
};

export default HeroSection;
