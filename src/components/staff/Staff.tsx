import React, { useState, useEffect } from 'react';
import { UserPlus, Star, Shield, Clock, MoreHorizontal, X, Upload } from 'lucide-react';
import { useToast } from '../ui/Toast';
import Select from '../ui/Select';
import { subscribeToCollection, createDoc, updateDoc, deleteDoc, dentistsCollection } from '../../services/firebaseService';
import { Dentist } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function Staff() {
  const { addToast } = useToast();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('dentistas', 'edit');
  
  const [staffList, setStaffList] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    photoUrl: '',
    color: 'bg-gold-600'
  });

  const professionalColors = [
    { name: 'Dourado Principal', value: 'bg-gold-600' },
    { name: 'Azul Marinho', value: 'bg-slate-700' },
    { name: 'Verde Oceano', value: 'bg-teal-600' },
    { name: 'Azul Real', value: 'bg-blue-600' },
    { name: 'Verde Esmeralda', value: 'bg-emerald-600' },
    { name: 'Índigo Profundo', value: 'bg-indigo-600' },
    { name: 'Rosa Profissional', value: 'bg-rose-500' },
    { name: 'Laranja Sofisticado', value: 'bg-amber-600' },
    { name: 'Ciano Moderno', value: 'bg-cyan-700' },
    { name: 'Violeta Suave', value: 'bg-violet-600' }
  ];

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
      const dataToSave = {
        ...formData,
        active: true
      };

      if (editingStaffId) {
        await updateDoc(dentistsCollection, editingStaffId, dataToSave);
        addToast('Profissional atualizado!', 'success');
      } else {
        await createDoc(dentistsCollection, dataToSave);
        addToast('Profissional cadastrado!', 'success');
      }
      setIsAdding(false);
      setEditingStaffId(null);
      setFormData({
        name: '',
        specialty: '',
        photoUrl: '',
        color: 'bg-gold-600'
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
      photoUrl: dentist.photoUrl || '',
      color: dentist.color || 'bg-gold-600'
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(dentistsCollection, id);
      addToast('Profissional excluído.', 'success');
    } catch (error) {
      addToast('Erro ao excluir.', 'error');
    }
  };

  return (
    <>
      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-slate-900">Corpo Clínico e Equipe</h1>
            <p className="text-slate-500 mt-1">Gerencie os profissionais e permissões de acesso.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading && staffList.map((dentist) => (
            <div key={dentist.id} className="medical-card group cursor-pointer hover:border-gold-200 transition-all relative">
              <div className={`h-24 ${dentist.color || 'bg-gold-600'} relative`}>
                <div className="absolute -bottom-10 left-6">
                  {dentist.photoUrl ? (
                    <img 
                      src={dentist.photoUrl} 
                      alt={dentist.name} 
                      className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center text-slate-300">
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-12 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{dentist.name}</h3>
                    <p className="text-sm font-medium text-gold-600">{dentist.specialty}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>Especialidade: {dentist.specialty}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleEdit(dentist)}
                  className="w-full mt-6 py-2.5 bg-slate-50 text-slate-600 hover:bg-gold-50 hover:text-gold-600 rounded-xl font-bold text-sm transition-all"
                >
                  Visualizar Colaborador
                </button>
              </div>
            </div>
          ))}

          {!isAdding && canEdit && (
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

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="medical-card bg-white p-8 animate-in zoom-in-95 duration-300 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold font-display text-slate-900">{editingStaffId ? 'Editar Profissional' : 'Novo Profissional'}</h2>
              <button 
                onClick={() => { setIsAdding(false); setEditingStaffId(null); }} 
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Dra. Maria Silva"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Especialidade</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Ortodontia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all"
                    value={formData.specialty}
                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">URL da Foto (Opcional)</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/50 transition-all"
                    value={formData.photoUrl}
                    onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                  />
                </div>
                <Select 
                  label="Cor na Agenda"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                >
                  {professionalColors.map(color => (
                    <option key={color.value} value={color.value}>{color.name}</option>
                  ))}
                </Select>
              </div>

              <div className="pt-4 flex gap-3">
                {editingStaffId && canEdit && (
                  <button 
                    type="button"
                    onClick={() => { setItemToDelete(editingStaffId); setIsAdding(false); setEditingStaffId(null); }}
                    className="flex-none px-4 py-3.5 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors"
                    title="Excluir Colaborador"
                  >
                    Excluir
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingStaffId(null); }}
                  className="flex-1 py-3.5 bg-slate-50 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-gold-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-gold-100 hover:bg-gold-700 transition-all transform active:scale-[0.98]"
                >
                  {editingStaffId ? 'Salvar Alterações' : 'Cadastrar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        title="Excluir Profissional"
        message="Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        type="danger"
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) handleDelete(itemToDelete);
        }}
      />
    </>
  );
}

