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
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Bom dia, Dr. Roberto</h1>
          <p className="text-slate-500 mt-1">Aqui está o resumo da sua clínica hoje.</p>
        </div>
        <div className="text-sm text-slate-400 font-medium">
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
          color="bg-primary"
        />
        <StatCard 
          title="Consultas Hoje" 
          value="18" 
          change="Capacidade: 85%" 
          icon={CalendarCheck}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Faturamento Mensal" 
          value="R$ 45.200" 
          change="+8.4% vs meta" 
          icon={TrendingUp}
          color="bg-indigo-500"
        />
        <StatCard 
          title="Ticket Médio" 
          value="R$ 840,00" 
          change="Estável" 
          icon={AlertCircle}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 medical-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Performance da Clínica</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-primary"></span> Receita</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Despesa</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94A3B8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94A3B8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="medical-card p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Ações Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
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
          <h3 className="font-bold text-slate-900 text-lg mb-6">Próximos Atendimentos</h3>
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
            className="w-full mt-8 py-2.5 text-sky-600 text-sm font-semibold flex items-center justify-center gap-1 hover:bg-sky-50 rounded-xl transition-colors"
          >
            Ver agenda completa
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Financial Summary mini chart or card */}
        <div className="medical-card p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Alertas e Notificações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold shadow-lg shadow-red-100">!</div>
              <div>
                <p className="text-sm font-bold text-red-700">Pagamento Pendente</p>
                <p className="text-xs text-red-600/70">Mariana Costa - R$ 1.200,00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-100">★</div>
              <div>
                <p className="text-sm font-bold text-amber-700">Aniversariante do Dia</p>
                <p className="text-xs text-amber-600/70">João Pedro Silva</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-100">i</div>
              <div>
                <p className="text-sm font-bold text-sky-700">Estoque Baixo</p>
                <p className="text-xs text-sky-600/70">Luvas de procedimento (G)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100">✓</div>
              <div>
                <p className="text-sm font-bold text-emerald-700">Meta Batida</p>
                <p className="text-xs text-emerald-600/70">Ticket médio acima do planejado</p>
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
      className="w-full p-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center gap-3 text-sm font-medium text-slate-700 group"
    >
      <span className="text-primary font-bold group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="medical-card p-5 group transition-all">
      <div className="text-[12px] text-text-very-muted font-semibold uppercase tracking-wider mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-[24px] font-bold text-text-dark">{value}</div>
        <div className={cn(
          "text-[12px] font-medium flex items-center gap-1",
          change.startsWith('+') ? "text-emerald-500" : "text-text-muted"
        )}>
          {change.startsWith('+') ? '↑' : ''} {change}
        </div>
      </div>
    </div>
  );
}

function AppointmentItem({ time, name, type }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="bg-slate-50 px-2 py-1 rounded text-[11px] font-bold text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
        {time}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900 leading-none">{name}</p>
        <p className="text-xs text-slate-400 mt-1">{type}</p>
      </div>
      <Clock className="w-4 h-4 text-slate-300 group-hover:text-sky-400 transition-colors" />
    </div>
  );
}
