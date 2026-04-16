import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import api from '../api';
import ProgressBar from '../components/ProgressBar';

// Section Components
import HeroSection from '../components/sections/HeroSection';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import AuditSteps from '../components/sections/AuditSteps';
import PricingTable from '../components/sections/PricingTable';
import AuditFAQ from '../components/sections/AuditFAQ';
import AestheticBackground from '../components/AestheticBackground';

const LandingPage = ({ onStartScan, progress, statusMessage }) => {
  const [inputType, setInputType] = useState('github');
  const [url, setUrl] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [standards, setStandards] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [provider, setProvider] = useState('auto');

  // Animation Trigger for Scroll Reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isScanning]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setZipFile(event.target.result.split(',')[1]);
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
      <AestheticBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
      </AestheticBackground>
    );
  }

  return (
    <AestheticBackground>
      <div className="flex flex-col items-center">
        <HeroSection 
          inputType={inputType} setInputType={setInputType}
          url={url} setUrl={setUrl}
          handleAnalyze={handleAnalyze}
          showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
          zipFile={zipFile}
          provider={provider} setProvider={setProvider}
          language={language} setLanguage={setLanguage}
          standards={standards} setStandards={setStandards}
          handleFileChange={handleFileChange}
        />

        <FeaturesGrid />
        
        <AuditSteps />

        {/* Dynamic CTA / Transition Section */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

        <PricingTable />
        
        <AuditFAQ />

        {/* Global Footer */}
        <footer className="w-full py-20 px-6 border-t border-white/5 bg-black/40">
           <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-12">
             <div className="text-center lg:text-left">
               <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase font-['Outfit']">DebtScan Intelligence</h3>
               <p className="text-gray-600 font-medium text-sm max-w-xs">Autonomous logic auditing for modern software ecosystems.</p>
             </div>
             
             <div className="flex flex-wrap justify-center gap-16 text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
               <div className="flex items-center gap-3 hover:text-white transition-premium cursor-default">IMMUTABLE AUDIT</div>
               <div className="flex items-center gap-3 hover:text-white transition-premium cursor-default">NEURAL COMPUTE</div>
               <div className="flex items-center gap-3 hover:text-white transition-premium cursor-default">100% AUTOMATED</div>
             </div>
             
             <div className="text-[9px] font-bold text-gray-700 tracking-widest uppercase">
               © 2026 DEBTSCAN PROTOCOL
             </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
