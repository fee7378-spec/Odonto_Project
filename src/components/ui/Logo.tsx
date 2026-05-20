import React from 'react';

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/logo.png" alt="Logo Icon" className="h-full w-auto shrink-0 object-contain" />
      
      {/* Typographic Fallon Odonto Care */}
      <div className="flex flex-col items-start leading-none shrink-0">
        <span 
          className="text-[2.44em] font-semibold text-slate-900" 
          style={{ fontFamily: 'Montserrat, Century Gothic, sans-serif', letterSpacing: '-0.02em', lineHeight: '1.1' }}
        >
          Fallon
        </span>
        <span 
          className="text-[1.12em] font-medium tracking-[0.25em] text-slate-800 mt-0.5" 
          style={{ fontFamily: 'Montserrat, Century Gothic, sans-serif' }}
        >
          Odonto Care
        </span>
      </div>
    </div>
  );
}
