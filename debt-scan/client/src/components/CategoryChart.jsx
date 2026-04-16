import React from 'react';

const CategoryChart = ({ data }) => {
  const max = Math.max(...Object.values(data), 1);
  const categories = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full space-y-6">
      {categories.map(([category, count]) => (
        <div key={category} className="group relative">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-[10px] font-black text-gray-700 tracking-[0.3em] uppercase group-hover:text-accent transition-premium">
              {category}
            </span>
            <span className="text-xl font-black text-white font-['Outfit'] leading-none">
              {count}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/10 group-hover:border-accent/40 transition-premium">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-1000 ease-out neon-glow opacity-80"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryChart;
