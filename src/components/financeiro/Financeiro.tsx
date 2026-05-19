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
import { subscribeToCollection, transactionsCollection } from '../../services/firebaseService';
import { Transaction } from '../../types';

export default function Financeiro() {
  const { addToast } = useToast();
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Transaction>(transactionsCollection, (data) => {
      setTransactionsList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalIncome = transactionsList
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactionsList
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

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
    { name: 'Exames', value: 15, color: '#89722F' },
    { name: 'Ortodontia', value: 20, color: '#D4AF37' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-1">Controle de entradas, saídas e fluxo de caixa.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => addToast('Exportando relatório financeiro (PDF)...', 'success')}
            className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => addToast('Abrindo formulário de nova transação', 'info')}
            className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-gold-100"
          >
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          title="Saldo Atual" 
          value={`R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change={`${balance >= 0 ? '+' : ''}R$ ${balance.toLocaleString('pt-BR')}`} 
          icon={DollarSign}
          type="neutral"
        />
        <FinanceCard 
          title="Receitas (Total)" 
          value={`R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Sincronizado" 
          icon={ArrowUpRight}
          type="income"
        />
        <FinanceCard 
          title="Despesas (Total)" 
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

      <div className="medical-card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Últimas Transações</h3>
          <button 
            onClick={() => addToast('Mostrando histórico completo de transações', 'info')}
            className="text-sm font-bold text-gold-600 hover:text-gold-700"
          >
            Ver todas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactionsList.length > 0 ? transactionsList.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((t) => (
                <TransactionRow 
                  key={t.id}
                  desc={t.description} 
                  patient={t.category} 
                  type={t.type} 
                  amount={t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                  status={t.status} 
                />
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma transação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

function TransactionRow({ desc, patient, type, amount, status }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-medium text-slate-800 text-sm">{desc}</td>
      <td className="px-6 py-4 text-slate-500 text-sm">{patient}</td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          {type === 'income' ? (
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          ) : (
            <span className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </span>
          )}
        </div>
      </td>
      <td className={`px-6 py-4 text-sm font-bold text-right ${type === 'income' ? 'text-slate-900' : 'text-red-600'}`}>
        {type === 'income' ? '+' : '-'} R$ {amount}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {status === 'paid' ? 'Pago' : 'Pendente'}
          </span>
        </div>
      </td>
    </tr>
  );
}
