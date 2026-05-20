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
  Plus,
  Shield,
  UserCog,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../hooks/usePermissions';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
  onScheduleAppointment?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, onScheduleAppointment }: SidebarProps) {
  const { addToast } = useToast();
  const { hasPermission } = usePermissions();
  
  const mainMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: CircleDollarSign },
    { id: 'dentistas', label: 'Equipe', icon: Stethoscope },
  ].filter(item => hasPermission(item.id, 'view'));

  const adminMenu = [
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ].filter(item => hasPermission(item.id, 'view'));

  const allItems = [...mainMenu, ...adminMenu];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 mb-2 gap-2">
        <img src="https://generation-sessions.s3.amazonaws.com/15f6974db37bcefa9eb0434bf77f0a6d/img-7ed6c9fc-a7aa-425f-bc14-067dfdce9b2b.png" alt="Icon" className="h-10 object-contain" />
        <img src="https://generation-sessions.s3.amazonaws.com/15f6974db37bcefa9eb0434bf77f0a6d/img-d0df3fbf-3a1b-419b-a0d0-fb44e5900508.png" alt="Fallon Odonto Care" className="h-6 object-contain" />
      </div>

      {hasPermission('agenda', 'edit') && (
        <div className="px-4 mb-4">
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
      )}

      <div className="flex-1 px-2 space-y-4 overflow-y-auto">
        <div>
          <p className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Clínica</p>
          <nav className="space-y-1">
            {allItems.map((item) => (
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
        </div>
      </div>

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
