import React, { useState, useEffect } from 'react';
import { UserPlus, Star, Shield, Clock, MoreHorizontal, X, Upload } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { subscribeToCollection, createDoc, updateDoc, deleteDoc, dentistsCollection } from '../../services/firebaseService';
import { Dentist } from '../../types';

export default function Staff() {
  const { addToast } = useToast();
  const [staffList, setStaffList] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    commission: 30,
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
    color: 'bg-gold-500'
  });

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Dentist>(dentistsCollection, (data) => {
      setStaffList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaffId) {
        await updateDoc(dentistsCollection, editingStaffId, formData);
        addToast('Profissional atualizado!', 'success');
      } else {
        await createDoc(dentistsCollection, formData);
        addToast('Profissional cadastrado!', 'success');
      }
      setIsAdding(false);
      setEditingStaffId(null);
      setFormData({
        name: '',
        specialty: '',
        commission: 30,
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
        color: 'bg-gold-500'
      });
    } catch (error) {
      addToast('Erro ao salvar.', 'error');
    }
  };

  const handleEdit = (dentist: Dentist) => {
    setEditingStaffId(dentist.id);
    setFormData({
      name: dentist.name,
      specialty: dentist.specialty,
      commission: dentist.commission,
      photoUrl: dentist.photoUrl,
      color: dentist.color || 'bg-gold-500'
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este profissional?')) {
      try {
        await deleteDoc(dentistsCollection, id);
        addToast('Profissional excluído.', 'success');
      } catch (error) {
        addToast('Erro ao excluir.', 'error');
      }
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Corpo Clínico e Equipe</h1>
          <p className="text-slate-500 mt-1">Gerencie os profissionais e permissões de acesso.</p>
        </div>

      </div>

      {isAdding && (
        <div className="medical-card p-8 animate-in slide-in-from-top-4 duration-500 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingStaffId ? 'Editar Profissional' : 'Novo Profissional'}</h2>
            <button onClick={() => { setIsAdding(false); setEditingStaffId(null); }} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Especialidade</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  value={formData.specialty}
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Comissão (%)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  value={formData.commission}
                  onChange={e => setFormData({ ...formData, commission: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Cor na Agenda</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                >
                  <option value="bg-gold-500">Dourado</option>
                  <option value="bg-emerald-500">Verde</option>
                  <option value="bg-purple-500">Roxo</option>
                  <option value="bg-amber-500">Laranja</option>
                  <option value="bg-rose-500">Rosa</option>
                  <option value="bg-indigo-500">Indigo</option>
                </select>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-gold-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-gold-100 hover:bg-gold-700 transition-colors mt-4"
            >
              {editingStaffId ? 'Salvar Alterações' : 'Cadastrar Profissional'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!loading && staffList.map((dentist) => (
          <div key={dentist.id} className="medical-card group cursor-pointer hover:border-gold-200 transition-all relative">
            <div className={`h-24 ${dentist.color || 'bg-gradient-to-r from-gold-500 to-gold-600'} relative`}>
              <div className="absolute -bottom-10 left-6">
                <img 
                  src={dentist.photoUrl} 
                  alt={dentist.name} 
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
              </div>
            </div>
            <div className="pt-12 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{dentist.name}</h3>
                  <p className="text-sm font-medium text-gold-600">{dentist.specialty}</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleEdit(dentist)}
                    className="p-1 px-2 text-xs font-bold text-gold-600 hover:bg-gold-50 rounded"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(dentist.id)}
                    className="p-1 px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comissão</p>
                  <p className="text-lg font-bold text-slate-700">{dentist.commission}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-emerald-600">Ativo</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Perfil: Dentista</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Carga Horária: 40h/semana</span>
                </div>
              </div>

              <button 
                onClick={() => addToast(`Exibindo a escala semanal de ${dentist.name}`, 'info')}
                className="w-full mt-6 py-2.5 bg-slate-50 text-slate-600 hover:bg-gold-50 hover:text-gold-600 rounded-xl font-bold text-sm transition-all"
              >
                Ver Escala de Horários
              </button>
            </div>
          </div>
        ))}

        {!isAdding && (
          <div 
            onClick={() => setIsAdding(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 text-slate-400 hover:bg-slate-50 hover:border-gold-200 hover:text-gold-600 cursor-pointer transition-all min-h-[350px]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:scale-110 transition-transform">
              <UserPlus className="w-8 h-8 opacity-40" />
            </div>
            <p className="font-bold">Adicionar Colaborador</p>
          </div>
        )}
      </div>
    </div>
  );
}

