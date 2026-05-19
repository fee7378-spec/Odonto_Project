import React from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 ml-64">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-gold-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar pacientes, exames ou históricos..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-gold-600 transition-colors">Fallon Odonto Care</p>
            <p className="text-[11px] text-slate-500 font-medium">Administrador</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center text-gold-600">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
