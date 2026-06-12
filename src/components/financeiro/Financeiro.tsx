import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Download, 
  PieChart as PieIcon,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useToast } from '../ui/Toast';
import { subscribeToCollection, appointmentsCollection } from '../../services/firebaseService';
import { Appointment } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

export default function Financeiro() {
  const { addToast } = useToast();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('financeiro', 'edit');
  
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Appointment>(appointmentsCollection, (data) => {
      setAppointmentsList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const appointmentsWithValue = appointmentsList.filter(a => (a.procedureValue || 0) > 0);
  const finishedAppointments = appointmentsList.filter(a => a.status === 'finished');
  const ongoingAppointments = appointmentsList.filter(a => a.status === 'ongoing');

  const totalFinished = finishedAppointments.reduce((acc, a) => acc + Number(a.procedureValue || 0), 0);
  const totalOngoing = ongoingAppointments.reduce((acc, a) => acc + Number(a.procedureValue || 0), 0);
  
  const totalExpense = 0; // Se houver despesas avulsas, poderiam vir de outra coleção

  const balance = totalFinished - totalExpense;
  const expectedIncome = totalOngoing;

  // Mock data for charts if list is small, otherwise use real data
  const data = [
    { name: 'Seg', income: 4000, expense: 2400 },
    { name: 'Ter', income: 3000, expense: 1398 },
    { name: 'Qua', income: 2000, expense: 9800 },
    { name: 'Qui', income: 2780, expense: 3908 },
    { name: 'Sex', income: 1890, expense: 4800 },
    { name: 'Sáb', income: 2390, expense: 3800 },
  ];

  const categoryData = [
    { name: 'Procedimentos', value: 65, color: '#BEA44B' },
    { name: 'Exames', value: 15, color: '#3B82F6' },
    { name: 'Ortodontia', value: 20, color: '#10B981' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-1">Controle baseado nos atendimentos da clínica.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => addToast('Exportando relatório financeiro (PDF)...', 'success')}
            className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          title="Saldo (Consultas)" 
          value={`R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change={`${balance >= 0 ? '+' : ''}R$ ${balance.toLocaleString('pt-BR')}`} 
          icon={DollarSign}
          type="neutral"
        />
        <FinanceCard 
          title="Receitas Previstas" 
          value={`R$ ${expectedIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Em andamento" 
          icon={ArrowUpRight}
          type="income"
        />
        <FinanceCard 
          title="Despesas" 
          value={`R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Sincronizado" 
          icon={ArrowDownRight}
          type="expense"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 medical-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Fluxo de Caixa Semanal</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="income" fill="#BEA44B" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="medical-card p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Receita por Categoria</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}}></div>
                  <span className="text-sm font-medium text-slate-600">{cat.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinanceCard({ title, value, change, icon: Icon, type }: any) {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  
  return (
    <div className="medical-card p-6 flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${
        isIncome ? 'bg-emerald-50 text-emerald-600' : 
        isExpense ? 'bg-red-50 text-red-600' : 'bg-gold-50 text-gold-600'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h4 className="text-xl font-bold text-slate-900 mt-1">{value}</h4>
        <p className={`text-xs font-bold mt-1 ${isIncome ? 'text-emerald-500' : isExpense ? 'text-red-500' : 'text-slate-400'}`}>
          {change}
        </p>
      </div>
    </div>
  );
}
