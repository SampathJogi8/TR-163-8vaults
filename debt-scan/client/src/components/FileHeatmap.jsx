import React from 'react';

const FileHeatmap = ({ files, onFileClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
      {files.map((file, idx) => (
        <div
          key={idx}
          onClick={() => onFileClick(file)}
          className="group relative glass-card p-6 rounded-2xl cursor-pointer hover:neon-glow transition-premium"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-gray-500 truncate w-3/4 uppercase tracking-widest leading-none" title={file.path}>
              {file.path.split('/').pop()}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              file.color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
              file.color === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
            }`} />
          </div>
          
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className={`text-3xl font-black font-['Outfit'] tracking-tighter ${
                file.color === 'red' ? 'text-red-500' : 
                file.color === 'amber' ? 'text-amber-500' : 'text-gray-200'
              }`}>
                {file.score}
              </div>
              <div className="text-[8px] text-gray-700 font-black uppercase tracking-[0.2em] leading-none">Diagnostic Debt</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-gray-500 font-['Outfit'] leading-none mb-0.5">{file.issueCount}</div>
              <div className="text-[8px] text-gray-700 font-black uppercase tracking-[0.2em] leading-none">Issues</div>
            </div>
          </div>

          <div className="w-full bg-white/[0.03] h-1 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full opacity-60 ${
                file.color === 'red' ? 'bg-red-500' : 
                file.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'
              }`} 
              style={{ width: `${file.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileHeatmap;
