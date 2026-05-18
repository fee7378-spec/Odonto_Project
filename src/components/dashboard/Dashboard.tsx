import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Abr', value: 2780 },
  { name: 'Mai', value: 1890 },
  { name: 'Jun', value: 2390 },
];

export default function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { userData } = useAuth();
  
  const getFirstName = (name: string) => {
    if (!name) return '';
    return name.split(' ')[0];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">
            {getGreeting()}, {userData?.name || 'Doutor(a)'}
          </h1>
          <p className="text-text-muted mt-1">Aqui está o resumo da sua clínica hoje.</p>
        </div>
        <div className="text-sm text-text-very-muted font-medium">
          Segunda-feira, 20 de Maio de 2024
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pacientes Totais" 
          value="1.248" 
          change="12% este mês" 
          icon={Users}
          color="primary"
        />
        <StatCard 
          title="Consultas Hoje" 
          value="18" 
          change="Capacidade: 85%" 
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard 
          title="Faturamento Mensal" 
          value="R$ 45.200" 
          change="+8.4% vs meta" 
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard 
          title="Ticket Médio" 
          value="R$ 840,00" 
          change="Estável" 
          icon={AlertCircle}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 medical-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-text-main text-lg dark:text-white">Performance da Clínica</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted"><span className="w-2 h-2 rounded-full bg-primary"></span> Receita</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted"><span className="w-2 h-2 rounded-full bg-border"></span> Despesa</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #6366F1)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-primary, #6366F1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: 'var(--color-text-muted)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: 'var(--color-text-muted)'}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '24px', 
                    border: '1px solid var(--color-border)', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)', 
                    backgroundColor: 'var(--color-surface)', 
                    color: 'var(--color-text-main)'
                  }}
                  itemStyle={{color: 'var(--color-primary)', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary, #6366F1)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="medical-card p-6">
          <h3 className="font-bold text-text-main text-lg mb-6 dark:text-white">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-4">
            <QuickActionButton 
              icon="+" 
              label="Novo Paciente" 
              onClick={() => setActiveTab('pacientes')} 
            />
            <QuickActionButton 
              icon="📅" 
              label="Marcar Consulta" 
              onClick={() => setActiveTab('agenda')} 
            />
            <QuickActionButton 
              icon="🦷" 
              label="Odontograma" 
              onClick={() => setActiveTab('pacientes')} 
            />
            <QuickActionButton 
              icon="📄" 
              label="Emitir Orçamento" 
              onClick={() => setActiveTab('financeiro')} 
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Mini-List */}
        <div className="medical-card p-6 flex flex-col">
          <h3 className="font-bold text-text-main dark:text-white text-lg mb-6">Próximos Atendimentos</h3>
          <div className="space-y-6 flex-1">
            <AppointmentItem 
              time="09:00" 
              name="João Silva" 
              type="Limpeza" 
            />
            <AppointmentItem 
              time="10:30" 
              name="Ana Oliveira" 
              type="Implante" 
            />
            <AppointmentItem 
              time="14:00" 
              name="Beatriz Santos" 
              type="Consulta" 
            />
            <AppointmentItem 
              time="15:30" 
              name="Pedro Costa" 
              type="Restauração" 
            />
          </div>
          <button 
            onClick={() => setActiveTab('agenda')}
            className="w-full mt-8 py-2.5 text-primary text-sm font-bold flex items-center justify-center gap-1 hover:bg-primary/5 rounded-xl transition-all"
          >
            Ver agenda completa
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Financial Summary mini chart or card */}
        <div className="medical-card p-6 lg:col-span-2">
          <h3 className="font-bold text-text-main dark:text-white text-lg mb-6">Alertas e Notificações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold shadow-lg shadow-red-100 dark:shadow-none">!</div>
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Pagamento Pendente</p>
                <p className="text-xs text-red-600/70 dark:text-red-300/50">Mariana Costa - R$ 1.200,00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-100 dark:shadow-none">★</div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Aniversariante do Dia</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-300/50">João Pedro Silva</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-sky-50 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/30">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-100 dark:shadow-none">i</div>
              <div>
                <p className="text-sm font-bold text-sky-700 dark:text-sky-400">Estoque Baixo</p>
                <p className="text-xs text-sky-600/70 dark:text-sky-300/50">Luvas de procedimento (G)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100 dark:shadow-none">✓</div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Meta Batida</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-300/50">Ticket médio acima do planejado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }: { icon: string | React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 border border-border rounded-2xl bg-surface hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-sm font-bold text-text-main dark:text-slate-300 group shadow-sm hover:shadow-md hover:border-primary/30"
    >
      <span className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </button>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  const getColors = () => {
    switch (color) {
      case 'primary': return 'bg-primary/10 text-primary';
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600';
      case 'indigo': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600';
      default: return 'bg-slate-50 dark:bg-slate-900/50 text-text-muted';
    }
  };

  return (
    <div className="medical-card p-6 group transition-all hover:translate-y-[-4px] hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", getColors())}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-lg",
          change.startsWith('+') ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-50 dark:bg-slate-900/50 text-text-muted"
        )}>
          {change}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-text-very-muted font-bold uppercase tracking-widest mb-1">{title}</div>
        <div className="text-[26px] font-extrabold text-text-main dark:text-white font-display">{value}</div>
      </div>
    </div>
  );
}

function AppointmentItem({ time, name, type }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded text-[11px] font-bold text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
        {time}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-text-main dark:text-white leading-none transition-colors">{name}</p>
        <p className="text-xs text-text-muted mt-1">{type}</p>
      </div>
      <Clock className="w-4 h-4 text-text-very-muted group-hover:text-primary transition-colors" />
    </div>
  );
}
