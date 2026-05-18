import React from 'react';

// Simplified Odontogram as a scalable SVG Grid
export default function Odontogram() {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  return (
    <div className="flex flex-col items-center gap-12 py-8 overflow-x-auto">
      <div className="flex gap-2">
        {upperTeeth.map(num => (
          <Tooth key={num} number={num} pos="upper" />
        ))}
      </div>
      <div className="w-full h-[1px] bg-slate-100 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Linha Média
        </div>
      </div>
      <div className="flex gap-2">
        {lowerTeeth.map(num => (
          <Tooth key={num} number={num} pos="lower" />
        ))}
      </div>
    </div>
  );
}

interface ToothProps {
  number: number;
  pos: 'upper' | 'lower';
  key?: number;
}

function Tooth({ number, pos }: ToothProps) {
  // Mock states for visual variety
  const isCaries = [3, 14, 20].includes(number);
  const isTreated = [8, 9, 28].includes(number);
  const isMissing = [1, 32].includes(number);

  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="text-[10px] font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
        {number}
      </div>
      <div className={`
        relative w-10 h-10 border-2 rounded-lg transition-all duration-200
        ${isMissing ? 'bg-slate-50 border-slate-100 opacity-40' : 'bg-white border-slate-200 group-hover:border-sky-300 group-hover:shadow-lg group-hover:shadow-sky-50'}
        ${isCaries && 'border-red-200 bg-red-50/30'}
        ${isTreated && 'border-emerald-200 bg-emerald-50/30'}
      `}>
        {/* Simple 5-surface tooth representation */}
        <div className="absolute inset-2 border border-slate-100 rounded-sm"></div>
        {/* Surface indicators */}
        <div className={`absolute top-0 left-0 right-0 h-2 border-b border-slate-100 ${isCaries && 'bg-red-400/20'} ${isTreated && 'bg-emerald-400/20'}`}></div>
        <div className={`absolute bottom-0 left-0 right-0 h-2 border-t border-slate-100`}></div>
        <div className={`absolute left-0 top-2 bottom-2 w-2 border-r border-slate-100`}></div>
        <div className={`absolute right-0 top-2 bottom-2 w-2 border-l border-slate-100`}></div>
        
        {/* Interaction markers */}
        {isCaries && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400"></div>}
        {isTreated && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400"></div>}
      </div>
      {pos === 'upper' ? (
        <div className="w-[1px] h-2 bg-slate-100"></div>
      ) : (
        <div className="w-[1px] h-2 bg-slate-100 order-first"></div>
      )}
    </div>
  );
}
