import React, { useState } from 'react';

// Simplified Odontogram as a scalable SVG Grid
export default function Odontogram({ readOnly = false, initialState = {}, onChange }: { readOnly?: boolean, initialState?: Record<number, 'caries' | 'treated' | 'missing' | 'normal'>, onChange?: (state: Record<number, 'caries' | 'treated' | 'missing' | 'normal'>) => void }) {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  type ToothState = 'caries' | 'treated' | 'missing' | 'normal';
  const [toothStates, setToothStates] = useState<Record<number, ToothState>>(initialState);
  const [activeTool, setActiveTool] = useState<ToothState>('caries');

  const handleToothClick = (number: number) => {
    if (readOnly) return;
    const newState = { ...toothStates, [number]: activeTool };
    setToothStates(newState);
    if (onChange) onChange(newState);
  };

  return (
    <div className="flex flex-col items-center py-4">
      {!readOnly && (
        <div className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <ToolButton tool="caries" label="Cárie" colorClass="bg-red-400" active={activeTool === 'caries'} onClick={() => setActiveTool('caries')} />
          <ToolButton tool="treated" label="Tratado" colorClass="bg-emerald-400" active={activeTool === 'treated'} onClick={() => setActiveTool('treated')} />
          <ToolButton tool="missing" label="Ausente" colorClass="bg-slate-300" active={activeTool === 'missing'} onClick={() => setActiveTool('missing')} />
          <ToolButton tool="normal" label="Normal" colorClass="bg-white border border-slate-200" active={activeTool === 'normal'} onClick={() => setActiveTool('normal')} />
        </div>
      )}
      
      <div className="flex flex-col items-center gap-12 overflow-x-auto w-full pb-8">
        <div className="flex gap-2">
          {upperTeeth.map(num => (
            <Tooth key={num} number={num} pos="upper" state={(toothStates[num] || 'normal') as any} onClick={() => handleToothClick(num)} />
          ))}
        </div>
        <div className="w-full h-[1px] bg-slate-100 relative max-w-3xl">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Linha Média
          </div>
        </div>
        <div className="flex gap-2">
          {lowerTeeth.map(num => (
            <Tooth key={num} number={num} pos="lower" state={(toothStates[num] || 'normal') as any} onClick={() => handleToothClick(num)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolButton({ tool, label, colorClass, active, onClick }: { tool: string, label: string, colorClass: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white shadow border border-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
    >
      <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
      {label}
    </button>
  );
}

function Tooth({ number, pos, state, onClick }: { key?: number, number: number, pos: 'upper' | 'lower', state: 'caries' | 'treated' | 'missing' | 'normal', onClick: () => void }) {
  const isCaries = state === 'caries';
  const isTreated = state === 'treated';
  const isMissing = state === 'missing';

  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onClick}>
      <div className="text-[10px] font-bold text-slate-400 group-hover:text-gold-600 transition-colors">
        {number}
      </div>
      <div className={`
        relative w-10 h-10 border-2 rounded-lg transition-all duration-200
        ${isMissing ? 'bg-slate-50 border-slate-100 opacity-40' : 'bg-white border-slate-200 group-hover:border-gold-300 group-hover:shadow-lg group-hover:shadow-gold-50'}
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
