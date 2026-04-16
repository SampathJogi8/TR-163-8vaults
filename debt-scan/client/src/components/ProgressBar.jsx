import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const ProgressBar = ({ progress, message }) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 glass-panel rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-end mb-6 px-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Operational Status</span>
          <span className="text-sm font-bold text-accent capitalize tracking-wide flex items-center gap-2">
            <Zap size={14} className="animate-pulse" />
            {message}
          </span>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-white font-['Outfit'] tracking-tighter">{progress}%</span>
          <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">Completion</div>
        </div>
      </div>
      
      <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 p-1">
        <motion.div
          className="h-full bg-accent rounded-full neon-glow"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-4 py-4 px-6 bg-white/[0.02] rounded-2xl border border-white/5">
        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">
          Synthesizing architectural data...
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
