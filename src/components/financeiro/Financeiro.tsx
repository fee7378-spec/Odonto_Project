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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: 0, type: 'income' as 'income' | 'expense', category: 'Procedimento', date: new Date().toISOString(), status: 'paid' as 'paid' | 'pending' });

  useEffect(() => {
    const unsubscribe = dataService.subscribeTransactions((list) => {
      setTransactions(list);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addTransaction(newTransaction);
      setShowAddForm(false);
      setNewTransaction({ description: '', amount: 0, type: 'income', category: 'Procedimento', date: new Date().toISOString(), status: 'paid' });
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar transação');
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (showAddForm) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Nova Transação</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Registre uma nova entrada ou saída de caixa.</p>
        </div>

        <div className="medical-card p-8 max-w-2xl">
          <form onSubmit={handleAddTransaction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Descrição</label>
                <input 
                  required
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Ex: Limpeza Dental - João Silva"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Valor (R$)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Tipo</label>
                <select 
                  value={newTransaction.type}
                  onChange={e => setNewTransaction({...newTransaction, type: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                >
                  <option value="income">Entrada (Receita)</option>
                  <option value="expense">Saída (Despesa)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Categoria</label>
                <input 
                  required
                  value={newTransaction.category}
                  onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                  placeholder="Ex: Ortodontia, Aluguel, Provisão"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={newTransaction.status}
                  onChange={e => setNewTransaction({...newTransaction, status: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                >
                  <option value="paid">Confirmado / Pago</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>
            <div className="pt-6 border-t border-border flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-display uppercase tracking-widest"
              >
                Salvar Transação
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Financeiro</h1>
          <p className="text-text-muted mt-1">Controle de entradas, saídas e fluxo de caixa.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface border border-border px-4 py-2.5 rounded-xl text-sm font-bold text-text-main flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-primary hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 font-display uppercase tracking-wider"
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
            <h3 className="font-bold text-text-main dark:text-white text-lg">Fluxo de Caixa Semanal</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                <Tooltip 
                  cursor={{fill: 'var(--color-background)', opacity: 0.1}}
                  contentStyle={{
                    borderRadius: '12px', 
                    border: '1px solid var(--color-border)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)'
                  }}
                />
                <Bar dataKey="income" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="var(--color-text-very-muted)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="medical-card p-6">
          <h3 className="font-bold text-text-main dark:text-white text-lg mb-6">Receita por Categoria</h3>
          <div className="py-12 text-center text-text-muted text-sm font-medium italic">
            Sem dados de categoria disponíveis
          </div>
        </div>
      </div>

      <div className="medical-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-text-main dark:text-white">Últimas Transações</h3>
          <button className="text-sm font-bold text-primary hover:opacity-80">Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
          <thead className="bg-slate-100/50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Descrição</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest text-center">Tipo</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest text-right">Valor</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted font-medium italic">
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
        isIncome ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 
        isExpense ? 'bg-red-50 dark:bg-red-950/30 text-red-600' : 'bg-primary/10 text-primary'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{title}</p>
        <h4 className="text-xl font-bold text-text-main dark:text-white mt-1">{value}</h4>
        <p className={`text-xs font-bold mt-1 ${isIncome ? 'text-emerald-500' : isExpense ? 'text-red-500' : 'text-text-muted'}`}>
          {change}
        </p>
      </div>
    </div>
  );
}

function TransactionRow({ desc, category, type, amount, status }: any) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <td className="px-6 py-4 font-medium text-text-main dark:text-slate-200 text-sm">{desc}</td>
      <td className="px-6 py-4 text-text-muted text-sm">{category}</td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          {type === 'income' ? (
            <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          ) : (
            <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center">
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
            status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
          }`}>
            {status === 'paid' ? 'Pago' : 'Pendente'}
          </span>
        </div>
      </td>
    </tr>
  );
}
