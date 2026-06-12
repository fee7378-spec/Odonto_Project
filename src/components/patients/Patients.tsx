import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, User, Phone, Mail, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { Patient, mockPatients } from '../../types';
import Odontogram from './Odontogram';
import { useToast } from '../ui/Toast';
import { subscribeToCollection, createDoc, updateDoc, patientsCollection, appointmentsCollection } from '../../services/firebaseService';
import { Appointment } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePermissions } from '../../hooks/usePermissions';

export let globalPatientsList: Patient[] = [];

const formatPhone = (val: string) => {
  let v = val.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/g, '$1 $2');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  return v.substring(0, 13);
};

const formatCPF = (val: string) => {
  let v = val.replace(/\D/g, '');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  return v.substring(0, 14);
};

export default function Patients({ onNewAppointment }: { onNewAppointment?: (patient: any) => void }) {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('pacientes', 'edit');
  
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  useEffect(() => {
    const unsubscribe = subscribeToCollection<Patient>(patientsCollection, (data) => {
      setPatientsList(data);
      globalPatientsList = data;
      setLoading(false);
      
      // Update selected patient if one is active using functional update to avoid loop
      setSelectedPatient((current: any) => {
        if (!current) return null;
        const updated = data.find(p => p.id === current.id);
        return updated || current;
      });
    });
    return () => unsubscribe();
  }, []);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: '', phone: '', email: '', cpf: '', alergies: '', medications: '', 
    photoUrl: '', historyInput: '', historyDateInput: new Date().toISOString().split('T')[0], historyList: [] as { date: string, text: string }[],
    odontogramState: {} as Record<number, 'caries' | 'treated' | 'missing' | 'normal'>
  });
  
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    if (selectedPatient) {
      const unsubscribe = subscribeToCollection<Appointment>(appointmentsCollection, (data) => {
        const filtered = data
          .filter(apt => apt.patientId === selectedPatient.id && apt.status === 'finished')
          .sort((a, b) => b.date.localeCompare(a.date));
        setPatientAppointments(filtered);
      });
      return () => unsubscribe();
    } else {
      setPatientAppointments([]);
    }
  }, [selectedPatient?.id]);

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

  const handleSaveNewPatient = async () => {
    if (!newPatient.name) {
      addToast('O nome do paciente é obrigatório.', 'error');
      return;
    }
    if (!newPatient.email || !newPatient.email.includes('@')) {
      addToast('Por favor, informe um email válido (deve conter @).', 'error');
      return;
    }

    const patientData: any = {
      name: newPatient.name,
      cpf: newPatient.cpf || '000.000.000-00',
      phone: newPatient.phone || '00 00000-0000',
      email: newPatient.email,
      photoUrl: newPatient.photoUrl || '',
      status: 'active',
      alergies: typeof newPatient.alergies === 'string' ? newPatient.alergies.split(',').map(s => s.trim()).filter(Boolean) : newPatient.alergies,
      medications: typeof newPatient.medications === 'string' ? newPatient.medications.split(',').map(s => s.trim()).filter(Boolean) : newPatient.medications,
      odontogramState: newPatient.odontogramState,
      history: newPatient.historyList.length > 0 ? newPatient.historyList.map(h => `${h.date} - ${h.text}`) : ['Anamnese inicial realizada']
    };

    try {
      if (editingPatientId) {
        await updateDoc(patientsCollection, editingPatientId, patientData);
        addToast('Paciente atualizado com sucesso!', 'success');
      } else {
        // Generate a simple code for new patient
        const tempId = Date.now().toString();
        patientData.code = tempId.slice(-6).padStart(6, '0');
        await createDoc(patientsCollection, patientData);
        addToast('Paciente cadastrado com sucesso!', 'success');
      }
      
      setIsRegistering(false);
      setEditingPatientId(null);
      setNewPatient({ name: '', phone: '', email: '', cpf: '', alergies: '', medications: '', photoUrl: '', historyInput: '', historyDateInput: new Date().toISOString().split('T')[0], historyList: [], odontogramState: {} });
    } catch (error) {
      addToast('Erro ao salvar paciente.', 'error');
    }
  };

  if (isRegistering) {
    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              setIsRegistering(false);
              setEditingPatientId(null);
            }}
            className="text-sm font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1"
          >
            ← Voltar para lista
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setIsRegistering(false);
                setEditingPatientId(null);
              }}
              className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveNewPatient}
              className="bg-gold-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gold-700 transition-colors shadow-lg shadow-gold-100"
            >
              Salvar Paciente
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <div className="medical-card p-6">
              <div className="flex flex-col items-center text-center">
                <div 
                   className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 mb-4 ring-4 ring-gold-50 cursor-pointer hover:bg-gold-50 hover:border-gold-200 hover:text-gold-600 transition-all overflow-hidden"
                  onClick={() => addToast('Abrindo gerenciador de arquivos para foto...', 'info')}
                >
                  <User className="w-8 h-8 opacity-40" />
                  <span className="text-[10px] font-bold uppercase">Foto</span>
                </div>
                <input 
                  type="text" 
                  value={newPatient.name} 
                  onChange={e => setNewPatient({...newPatient, name: e.target.value})} 
                  placeholder="Nome Completo do Paciente" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500/20 mb-2" 
                />
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider">Novo Paciente</span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex flex-shrink-0 items-center justify-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Telefone</p>
                    <input 
                      type="tel" 
                      value={newPatient.phone} 
                      onChange={e => setNewPatient({...newPatient, phone: formatPhone(e.target.value)})} 
                      placeholder="00 00000-0000" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex flex-shrink-0 items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Email</p>
                    <input 
                      type="email" 
                      value={newPatient.email} 
                      onChange={e => setNewPatient({...newPatient, email: e.target.value})} 
                      placeholder="email@exemplo.com" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex flex-shrink-0 items-center justify-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">CPF</p>
                    <input 
                      type="text" 
                      value={newPatient.cpf} 
                      onChange={e => setNewPatient({...newPatient, cpf: formatCPF(e.target.value)})} 
                      placeholder="000.000.000-00" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="medical-card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Informações de Saúde</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Alergias</label>
                  <input 
                    type="text" 
                    value={newPatient.alergies} 
                    onChange={e => setNewPatient({...newPatient, alergies: e.target.value})} 
                    placeholder="Ex: Penicilina, Iodo (separado por vírgula)" 
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Medicamentos Contínuos</label>
                  <input 
                    type="text" 
                    value={newPatient.medications} 
                    onChange={e => setNewPatient({...newPatient, medications: e.target.value})} 
                    placeholder="Ex: Losartana 50mg" 
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="medical-card p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Odontograma Inicial</h3>
                  <p className="text-sm text-slate-500 font-medium">Informe a condição bucal inicial do paciente</p>
                </div>
              </div>
              <Odontogram 
                initialState={newPatient.odontogramState}
                onChange={(state) => setNewPatient({ ...newPatient, odontogramState: state })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              setSelectedPatient(null);
              setAiSuggestion('');
            }}
            className="text-sm font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1"
          >
            ← Voltar para lista
          </button>
          <div className="flex gap-3">
            {canEdit && (
              <button 
                onClick={() => {
                  const hList = selectedPatient.history.map((h: string) => {
                    const parts = h.split(' - ');
                    return { date: parts.length > 1 ? parts[0] : 'Hoje', text: parts.length > 1 ? parts.slice(1).join(' - ') : parts[0] };
                  });
                  
                  setNewPatient({
                    name: selectedPatient.name, 
                    phone: selectedPatient.phone, 
                    email: selectedPatient.email, 
                    cpf: selectedPatient.cpf || '', 
                    alergies: (selectedPatient.alergies || []).join(', '), 
                    medications: (selectedPatient.medications || []).join(', '), 
                    photoUrl: selectedPatient.photoUrl || '', 
                    historyInput: '', 
                    historyDateInput: new Date().toISOString().split('T')[0], 
                    historyList: hList, 
                    odontogramState: selectedPatient.odontogramState || {}
                  });
                  setEditingPatientId(selectedPatient.id);
                  setIsRegistering(true);
                }}
                className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Editar Prontuário
              </button>
            )}
            <button 
              onClick={() => {
                if (onNewAppointment) {
                  onNewAppointment(selectedPatient);
                } else {
                  addToast('Função indisponível', 'error');
                }
              }}
              className="bg-gold-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gold-700 transition-colors shadow-lg shadow-gold-100"
            >
              Novo Agendamento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <div className="medical-card p-6">
              <div className="flex flex-col items-center text-center">
                {selectedPatient.photoUrl ? (
                  <img 
                    src={selectedPatient.photoUrl} 
                    alt={selectedPatient.name}
                    className="w-24 h-24 rounded-2xl object-cover mb-4 ring-4 ring-gold-50 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 ring-4 ring-gold-50 shadow-md mb-4">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-500">#{selectedPatient.code}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Paciente Ativo</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <InfoItem icon={Phone} label="Telefone" value={selectedPatient.phone} />
                <InfoItem icon={Mail} label="Email" value={selectedPatient.email} />
                <InfoItem icon={User} label="CPF" value={selectedPatient.cpf} />
                <InfoItem icon={CalendarIcon} label="Última Visita" value={selectedPatient.lastVisit || 'N/A'} />
              </div>
            </div>

            <div className="medical-card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Informações de Saúde</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Alergias</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(selectedPatient.alergies || []).length > 0 ? (
                      (selectedPatient.alergies || []).map((a: string) => (
                        <span key={a} className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">Nenhuma alergia relatada</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Medicamentos</label>
                  <p className="text-sm text-slate-700">{(selectedPatient.medications || []).join(', ') || 'Sem uso regular'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gold-600 to-gold-700 rounded-2xl p-6 text-white shadow-xl shadow-gold-200">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-gold-200" />
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
            <div className="medical-card p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-900 text-lg">Odontograma Interativo</h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Cárie</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Tratado</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Ausente</div>
                </div>
              </div>
              <Odontogram 
                initialState={selectedPatient.odontogramState || {}}
                readOnly={true}
              />
            </div>

            <div className="medical-card p-6">
              <h3 className="font-bold text-slate-900 mb-6">Evolução Clínica</h3>
              <div className="space-y-6">
                {patientAppointments.length > 0 ? (
                  patientAppointments.map((apt: Appointment, idx: number) => (
                    <div key={apt.id} className="flex gap-4 relative">
                      {idx !== patientAppointments.length - 1 && (
                        <div className="absolute left-2 top-8 bottom-0 w-[1px] bg-slate-100"></div>
                      )}
                      <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-600 mt-1 z-10"></div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                          {format(new Date(apt.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-sm font-bold text-slate-900 mb-1">{apt.treatmentType}</p>
                        <p className="text-xs font-medium text-slate-500">Realizada por {apt.dentistName || 'Dr. Roberto Santos'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400 font-medium">Nenhuma consulta realizada encontrada no histórico.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Pacientes</h1>
          <p className="text-slate-500 mt-1">Gerencie a base de dados de pacientes da sua clínica.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsRegistering(true)}
            className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-gold-100"
          >
            <Plus className="w-5 h-5" />
            <span>Cadastrar Novo</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou telefone..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
        <button 
          onClick={() => addToast('Painel de Filtros Avançados', 'info')}
          className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      <div className="medical-card">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">CPF</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contato</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Última Visita</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patientsList.map((patient: any) => (
              <tr 
                key={patient.id} 
                className="hover:bg-gold-50/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedPatient(patient)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {patient.photoUrl ? (
                      <img 
                        src={patient.photoUrl} 
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-gold-200 transition-all flex-shrink-0" 
                        alt="" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 ring-2 ring-transparent group-hover:ring-gold-200 transition-all flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-gold-600 transition-colors">{patient.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">#{patient.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{patient.cpf}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600 font-medium">{patient.phone}</p>
                  <p className="text-xs text-slate-400">{patient.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{patient.lastVisit}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Ativo</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  addToast(`Opções de: ${patient.name}`, 'info');
                }}>
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">{label}</p>
        <p className="text-sm font-medium text-slate-700 mt-1">{value}</p>
      </div>
    </div>
  );
}
