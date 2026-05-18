import React from 'react';
import { ChevronRight, LayoutDashboard, Calendar, Users, CircleDollarSign, Stethoscope, Settings, LogOut, Plus, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: CircleDollarSign },
    { id: 'dentistas', label: 'Equipe', icon: Stethoscope },
    { id: 'acesso', label: 'Perfis de Acesso', icon: Shield },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-[220px] h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 transition-all">
      <div className="p-6 pb-8 flex items-center text-[22px] font-extrabold text-primary font-display">
        Dente<span className="text-text-muted font-normal ml-0.5">Cloud</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "sidebar-item text-sm",
              activeTab === item.id && "active bg-primary-light dark:bg-primary/10 border-l-4 border-primary"
            )}
          >
            <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-primary" : "text-text-very-muted")} />
            <span className={cn(activeTab === item.id ? "text-primary font-bold" : "text-text-muted")}>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer text-text-muted">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sair do sistema</span>
        </div>
      </div>
    </div>
  );
}
