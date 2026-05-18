import React from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30 ml-[220px]">
      <div className="flex-1 max-w-[300px]">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Buscar pacientes, exames..." 
            className="w-full bg-slate-100 border-none rounded-lg py-2 px-4 text-sm text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-dark">Clínica Sorriso</p>
            <p className="text-[12px] text-text-very-muted">Administrador</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            CS
          </div>
        </div>
      </div>
    </header>
  );
}
