import React, { useState, useEffect } from 'react';
import { subscribeToCollection, createDoc, updateDoc, deleteDoc, proceduresCollection } from '../../services/firebaseService';
import { Procedure } from '../../types';
import { useToast } from '../ui/Toast';
import { Plus, Edit2, Trash2, Check, X, RefreshCw } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';
import CurrencyInput from '../ui/CurrencyInput';

export default function Miscellaneous() {
  const { addToast } = useToast();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    value: 0
  });

  useEffect(() => {
    const unsub = subscribeToCollection<Procedure>(proceduresCollection, (data) => {
      setProcedures(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', category: '', value: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || formData.value < 0) { // Changed <= 0 to < 0 to allow 0
      addToast('Preencha nome, categoria e valor válido.', 'error');
      return;
    }
    
    try {
      if (editingId) {
        await updateDoc(proceduresCollection, editingId, formData);
        addToast('Procedimento atualizado.', 'success');
      } else {
        await createDoc(proceduresCollection, formData);
        addToast('Procedimento cadastrado.', 'success');
      }
      resetForm();
    } catch (error) {
      addToast('Erro ao salvar.', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    const fallbackCategories = {
      'Ortodontia': ['Manutenção de aparelho', 'Instalação de aparelho', 'Remoção', 'Moldagem'],
      'Clínica Geral': ['Limpeza', 'Restauração', 'Avaliação', 'Extração'],
      'Endodontia': ['Canal', 'Retratamento', 'Curativo'],
      'Implantodontia': ['Instalação de Implante', 'Prótese sobre Implante', 'Avaliação de Implante']
    };
    
    setLoading(true);
    let count = 0;
    try {
      for (const [cat, procs] of Object.entries(fallbackCategories)) {
        for (const proc of procs) {
          await createDoc(proceduresCollection, {
            name: proc,
            category: cat,
            value: 0
          });
          count++;
        }
      }
      addToast(`${count} procedimentos padrão adicionados.`, 'success');
    } catch (err) {
      addToast('Erro ao adicionar tabelas padrão.', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(proceduresCollection, id);
      addToast('Procedimento excluído.', 'success');
    } catch (error) {
      addToast('Erro ao excluir.', 'error');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Miscelâneos</h1>
          <p className="text-slate-500 mt-1">Configuração de tipos de atendimento e seus procedimentos.</p>
        </div>
        <div className="flex gap-3">
          {procedures.length === 0 && (
            <button 
              onClick={handleSeedDefaults}
              disabled={loading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Carregar Padrões
            </button>
          )}
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-gold-100"
          >
            <Plus className="w-4 h-4" />
            Novo Procedimento
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="medical-card p-6 animate-in zoom-in-95 duration-200">
          <h3 className="font-bold text-slate-900 mb-4">{editingId ? 'Editar' : 'Novo'} Procedimento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Tipo de Atendimento</label>
              <input 
                type="text" 
                list="categorias-list"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                placeholder="Ex: Clínica Geral" 
              />
              <datalist id="categorias-list">
                {Array.from(new Set(procedures.map(p => p.category))).map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Procedimento</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Ex: Limpeza Dental" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Valor Padrão (R$)</label>
              <CurrencyInput className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                value={formData.value} onChangeValue={(val) => setFormData({...formData, value: typeof val === 'number' ? val : 0})} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 font-bold text-white bg-gold-600 hover:bg-gold-700 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Array.from(new Set(procedures.map(p => p.category))).map(category => (
          <div key={category} className="medical-card overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500"></span>
                {category}
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                {procedures.filter(p => p.category === category).length} procedimentos
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="hidden sm:table-header-group border-b border-slate-50">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white">Procedimento</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white text-right w-48">Valor Padrão</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white text-right w-32">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {procedures.filter(p => p.category === category).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">{p.name}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-right text-sm">
                      R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setFormData({ name: p.name, category: p.category, value: p.value });
                            setEditingId(p.id);
                            setIsAdding(false);
                          }}
                          className="p-2 text-slate-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {procedures.length === 0 && !loading && (
          <div className="medical-card p-12 text-center">
            <p className="text-slate-400 font-medium">Nenhum tipo de atendimento cadastrado.</p>
            <p className="text-sm text-slate-400 mt-1">Carregue os padrões ou adicione um novo procedimento.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        title="Excluir Procedimento"
        message="Tem certeza que deseja excluir? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        type="danger"
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) handleDelete(itemToDelete);
        }}
      />
    </div>
  );
}
