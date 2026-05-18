import React, { useState, useEffect } from 'react';
import { Dentist } from '../../types';
import { UserPlus, Star, Shield, Clock, MoreHorizontal } from 'lucide-react';
import { dataService } from '../../services/dataService';

export default function Staff() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDentist, setNewDentist] = useState<Omit<Dentist, 'id'>>({ 
    name: '', 
    specialty: '', 
    commission: 50, 
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop' 
  });

  useEffect(() => {
    const unsubscribe = dataService.subscribeDentists((list) => {
      setDentists(list);
    });
    return () => unsubscribe();
  }, []);

  const handleAddDentist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addDentist(newDentist);
      setShowAddForm(false);
      setNewDentist({ name: '', specialty: '', commission: 50, photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop' });
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar profissional');
    }
  };

  if (showAddForm) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Contratar Profissional</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Cadastre um novo dentista ou colaborador na clínica.</p>
        </div>

        <div className="medical-card p-8 max-w-2xl">
          <form onSubmit={handleAddDentist} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Nome do Profissional</label>
                <input 
                  required
                  value={newDentist.name}
                  onChange={e => setNewDentist({...newDentist, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Especialidade</label>
                <input 
                  required
                  value={newDentist.specialty}
                  onChange={e => setNewDentist({...newDentist, specialty: e.target.value})}
                  placeholder="Ex: Ortodontia, Endodontia"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Comissão (%)</label>
                <input 
                  required
                  type="number"
                  value={newDentist.commission}
                  onChange={e => setNewDentist({...newDentist, commission: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
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
                Efetivar Contratação
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Corpo Clínico e Equipe</h1>
          <p className="text-text-muted mt-1">Gerencie os profissionais e permissões de acesso.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-primary/20 font-display uppercase tracking-wider text-sm"
        >
          <UserPlus className="w-5 h-5" />
          <span>Contratar Profissional</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dentists.map((dentist) => (
          <div key={dentist.id} className="medical-card group cursor-pointer hover:border-primary transition-all">
            <div className="h-24 bg-gradient-to-r from-primary to-indigo-600 relative">
              <div className="absolute -bottom-10 left-6">
                <img 
                  src={dentist.photoUrl} 
                  alt={dentist.name} 
                  className="w-20 h-20 rounded-2xl border-4 border-surface shadow-lg object-cover"
                />
              </div>
            </div>
            <div className="pt-12 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">{dentist.name}</h3>
                  <p className="text-sm font-medium text-primary dark:text-primary">{dentist.specialty}</p>
                </div>
                <button className="p-2 text-text-very-muted hover:text-text-muted">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-transparent dark:border-border/50">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Comissão</p>
                  <p className="text-lg font-bold text-text-main dark:text-slate-200">{dentist.commission}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-transparent dark:border-border/50">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avaliação</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-text-main dark:text-slate-200">4.9</p>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Shield className="w-4 h-4" />
                  <span>Perfil: Dentista</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <Clock className="w-4 h-4" />
                  <span>Carga Horária: 40h/semana</span>
                </div>
              </div>

              <button 
                onClick={() => alert(`Escala de ${dentist.name}: Segunda a Sexta, 08h às 18h`)}
                className="w-full mt-6 py-2.5 bg-slate-50 dark:bg-slate-900/80 text-text-muted hover:bg-primary-light dark:hover:bg-primary/10 hover:text-primary rounded-xl font-bold text-sm transition-all"
              >
                Ver Escala de Horários
              </button>
            </div>
          </div>
        ))}

        {/* Add Staff Skeleton */}
        <div 
          onClick={() => setShowAddForm(true)}
          className="border-2 border-dashed border-border dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 text-text-very-muted hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-primary hover:text-primary cursor-pointer transition-all min-h-[350px] group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-2 border-border group-hover:scale-110 transition-transform">
            <UserPlus className="w-8 h-8 opacity-40" />
          </div>
          <p className="font-bold">Adicionar Colaborador</p>
        </div>
      </div>
    </div>
  );
}
