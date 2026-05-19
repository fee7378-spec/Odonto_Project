import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
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

export default function Dashboard({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Bom dia, Dr. Roberto</h1>
          <p className="text-slate-500 mt-1">Aqui está o resumo da sua clínica hoje.</p>
        </div>
        <div className="text-sm text-slate-400 font-medium">
          {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()).replace(/^\w/, c => c.toUpperCase())}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Pacientes" 
          value="1.284" 
          change="+12%" 
          icon={Users}
          color="bg-gold-500"
        />
        <StatCard 
          title="Consultas de Hoje" 
          value="18" 
          change="+3" 
          icon={CalendarCheck}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Faturamento Mensal" 
          value="R$ 45.200" 
          change="+8.4%" 
          icon={TrendingUp}
          color="bg-indigo-500"
        />
        <StatCard 
          title="Pendências" 
          value="5" 
          change="Atenção" 
          icon={AlertCircle}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 medical-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Performance Financeira</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none">
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BEA44B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#BEA44B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#BEA44B" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Mini-List */}
        <div className="medical-card p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Próximos Atendimentos</h3>
          <div className="space-y-6">
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
            onClick={() => setActiveTab && setActiveTab('agenda')}
            className="w-full mt-8 py-2.5 text-gold-600 text-sm font-semibold flex items-center justify-center gap-1 hover:bg-gold-50 rounded-xl transition-colors"
          >
            Ver agenda completa
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="medical-card p-6 group hover:border-gold-200 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} p-2.5 rounded-xl text-white shadow-lg shadow-gold-100`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}

function AppointmentItem({ time, name, type }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="bg-slate-50 px-2 py-1 rounded text-[11px] font-bold text-slate-600 group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
        {time}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900 leading-none">{name}</p>
        <p className="text-xs text-slate-400 mt-1">{type}</p>
      </div>
      <Clock className="w-4 h-4 text-slate-300 group-hover:text-gold-400 transition-colors" />
    </div>
  );
}
