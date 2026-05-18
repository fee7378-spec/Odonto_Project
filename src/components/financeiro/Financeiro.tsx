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
import { Transaction } from '../../types';
import { dataService } from '../../services/dataService';

export default function Financeiro() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = dataService.subscribeTransactions((list) => {
      setTransactions(list);
    });
    return () => unsubscribe();
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Group transactions by day for the chart (last 7 days or similar)
  const getChartData = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return days.map(day => {
      // In a real app we would filter by actual date, here we just show empty or mock-like if empty
      return { name: day, income: 0, expense: 0 };
    });
  };

  const chartData = getChartData();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-1">Controle de entradas, saídas e fluxo de caixa.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => alert('Abrir modal de Nova Transação')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-sky-100"
          >
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          title="Saldo Atual" 
          value={formatCurrency(balance)} 
          change="Saldo total em conta" 
          icon={DollarSign}
          type="neutral"
        />
        <FinanceCard 
          title="Receitas (Total)" 
          value={formatCurrency(totalIncome)} 
          change="Entradas registradas" 
          icon={ArrowUpRight}
          type="income"
        />
        <FinanceCard 
          title="Despesas (Total)" 
          value={formatCurrency(totalExpense)} 
          change="Saídas registradas" 
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
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="income" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="medical-card p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Receita por Categoria</h3>
          <div className="py-12 text-center text-slate-400 text-sm font-medium italic">
            Sem dados de categoria disponíveis
          </div>
        </div>
      </div>

      <div className="medical-card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Últimas Transações</h3>
          <button className="text-sm font-bold text-sky-600 hover:text-sky-700">Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    Nenhuma transação encontrada no banco de dados.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <TransactionRow 
                    key={t.id}
                    desc={t.description} 
                    category={t.category} 
                    type={t.type} 
                    amount={formatCurrency(t.amount)} 
                    status={t.status} 
                  />
                ))
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
        isExpense ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'
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

function TransactionRow({ desc, category, type, amount, status }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-medium text-slate-800 text-sm">{desc}</td>
      <td className="px-6 py-4 text-slate-500 text-sm">{category}</td>
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
      <td className={`px-6 py-4 text-sm font-bold text-right ${type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
        {amount}
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
