import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, User, Phone, Mail, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { Patient } from '../../types';
import Odontogram from './Odontogram';
import { dataService } from '../../services/dataService';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const unsubscribe = dataService.subscribePatients((list) => {
      setPatients(list);
    });
    return () => unsubscribe();
  }, []);

  const getAiSuggestion = async (patient: any) => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai/suggest-treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientData: patient }),
      });
      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (error) {
      console.error(error);
      setAiSuggestion('Não foi possível gerar sugestões no momento.');
    } finally {
      setLoadingAi(false);
    }
  };

  if (selectedPatient) {
    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              setSelectedPatient(null);
              setAiSuggestion('');
            }}
            className="text-sm font-semibold text-primary hover:opacity-80 flex items-center gap-1"
          >
            ← Voltar para lista
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => alert('Abrir formulário de edição')}
              className="bg-surface border border-border px-4 py-2 rounded-xl text-sm font-bold text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Editar Prontuário
            </button>
            <button 
              onClick={() => alert('Abrir modal de novo agendamento')}
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-colors shadow-lg shadow-primary/20"
            >
              Novo Agendamento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            {/* Patient Info Card */}
            <div className="medical-card p-6">
              <div className="flex flex-col items-center text-center">
                <img 
                  src={selectedPatient.photoUrl} 
                  alt={selectedPatient.name}
                  className="w-24 h-24 rounded-2xl object-cover mb-4 ring-4 ring-primary-light shadow-md"
                />
                <h2 className="text-xl font-bold text-text-main dark:text-white">{selectedPatient.name}</h2>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider">Paciente Ativo</span>
              </div>

              <div className="mt-8 space-y-4">
                <InfoItem icon={Phone} label="Telefone" value={selectedPatient.phone} />
                <InfoItem icon={Mail} label="Email" value={selectedPatient.email} />
                <InfoItem icon={User} label="CPF" value={selectedPatient.cpf} />
                <InfoItem icon={CalendarIcon} label="Última Visita" value={selectedPatient.lastVisit || 'N/A'} />
              </div>
            </div>

            {/* Health Info */}
            <div className="medical-card p-6">
              <h3 className="font-bold text-text-main dark:text-white mb-4">Informações de Saúde</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-muted">Alergias</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedPatient.alergies.length > 0 ? (
                      selectedPatient.alergies.map((a: string) => (
                        <span key={a} className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-text-muted">Nenhuma alergia relatada</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-muted">Medicamentos</label>
                  <p className="text-sm text-text-main dark:text-slate-400">{selectedPatient.medications.join(', ') || 'Sem uso regular'}</p>
                </div>
              </div>
            </div>

            {/* AI Advisor */}
            <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-sky-200">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-sky-200" />
                <h3 className="font-bold">Assistente DenteCloud AI</h3>
              </div>
              {aiSuggestion ? (
                <div className="text-sm leading-relaxed opacity-90 animate-in fade-in slide-in-from-top-2 duration-300">
                  {aiSuggestion}
                </div>
              ) : (
                <p className="text-sm opacity-80 mb-6">Receba sugestões de tratamento personalizadas com base no histórico do paciente.</p>
              )}
              <button 
                onClick={() => getAiSuggestion(selectedPatient)}
                disabled={loadingAi}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                {loadingAi ? 'Analisando...' : (aiSuggestion ? 'Atualizar Sugestão' : 'Gerar Sugestões')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Odontogram Section */}
            <div className="medical-card p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-text-main dark:text-white text-lg">Odontograma Interativo</h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase text-text-muted">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-red"></span> Cárie</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-green"></span> Tratado</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Ausente</div>
                </div>
              </div>
              <Odontogram />
            </div>

            {/* Evolução Clínica */}
            <div className="medical-card p-6">
              <h3 className="font-bold text-text-main dark:text-white mb-6">Evolução Clínica</h3>
              <div className="space-y-6">
                {selectedPatient.history.map((item: string, idx: number) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== selectedPatient.history.length - 1 && (
                      <div className="absolute left-2 top-8 bottom-0 w-[1px] bg-border"></div>
                    )}
                    <div className="w-4 h-4 rounded-full bg-primary-light border-2 border-primary mt-1 z-10"></div>
                    <div>
                      <p className="text-sm font-bold text-text-main dark:text-slate-200">{item.split(' - ')[1]}</p>
                      <p className="text-sm text-text-muted mt-0.5">{item.split(' - ')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '', lastVisit: new Date().toISOString() });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addPatient(newPatient);
      setShowAddForm(false);
      setNewPatient({ name: '', phone: '', email: '', lastVisit: new Date().toISOString() });
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar paciente');
    }
  };

  if (showAddForm) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Filter className="w-5 h-5 rotate-90 text-text-muted" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Novo Paciente</h1>
            <p className="text-text-muted mt-1">Preencha os dados básicos para cadastro.</p>
          </div>
        </div>

        <div className="medical-card p-8 max-w-2xl">
          <form onSubmit={handleAddPatient} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  required
                  value={newPatient.name}
                  onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Telefone</label>
                <input 
                  required
                  value={newPatient.phone}
                  onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">E-mail</label>
                <input 
                  required
                  type="email"
                  value={newPatient.email}
                  onChange={e => setNewPatient({...newPatient, email: e.target.value})}
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
                Cadastrar
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
          <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Pacientes</h1>
          <p className="text-text-muted mt-1">Gerencie a base de dados de pacientes da sua clínica.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-primary/20 font-display uppercase tracking-wider text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Novo</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-very-muted" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou telefone..." 
            className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white"
          />
        </div>
        <button className="bg-surface border border-border px-4 py-3 rounded-xl text-sm font-bold text-text-muted flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Patients Table */}
      <div className="medical-card">
        <table className="w-full text-left">
          <thead className="bg-slate-100/50 dark:bg-slate-900/40 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Paciente</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">CPF</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Contato</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Última Visita</th>
              <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-very-muted font-medium italic">
                  Nenhum paciente cadastrado no banco de dados.
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedPatient(patient)}
                >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={patient.photoUrl} 
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all" 
                      alt="" 
                    />
                    <div>
                      <p className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{patient.name}</p>
                      <p className="text-[11px] text-text-muted font-medium">Cadastrado em 12/03/2024</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-muted font-medium">{patient.cpf}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-text-muted font-medium">{patient.phone}</p>
                  <p className="text-xs text-text-very-muted">{patient.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-text-muted font-medium">{patient.lastVisit}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Ativo</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-text-very-muted hover:text-text-main transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-text-very-muted">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-text-very-muted leading-none">{label}</p>
        <p className="text-sm font-medium text-text-main mt-1">{value}</p>
      </div>
    </div>
  );
}
