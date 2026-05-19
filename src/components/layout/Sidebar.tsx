import React from 'react';
import { useToast } from '../ui/Toast';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CircleDollarSign, 
  Stethoscope, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
  onScheduleAppointment?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, onScheduleAppointment }: SidebarProps) {
  const { addToast } = useToast();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: CircleDollarSign },
    { id: 'dentistas', label: 'Equipe', icon: Stethoscope },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gold-600 rounded-lg flex items-center justify-center">
          <Stethoscope className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold font-display tracking-tight text-gold-950">Fallon Odonto Care</span>
      </div>

      <div className="px-4 mb-6">
        <button 
          onClick={() => {
            if (onScheduleAppointment) {
              onScheduleAppointment();
            } else {
              setActiveTab('agenda');
            }
          }}
          className="w-full bg-gold-600 hover:bg-gold-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-gold-100"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Consulta</span>
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "sidebar-item",
              activeTab === item.id && "active"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div 
          onClick={() => {
            addToast('Saindo do sistema...', 'info');
            if (onLogout) onLogout();
          }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-slate-500"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sair</span>
        </div>
      </div>
    </div>
  );
}
