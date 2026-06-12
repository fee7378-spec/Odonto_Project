import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, User, ChevronLeft, ChevronRight, Plus, MapPin, Phone, Search, Info, CheckCircle2, XCircle, AlertCircle, RotateCcw, FilterX, X } from 'lucide-react';
import { format, addDays, subDays, isSameDay, isSameWeek, isSameMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../ui/Toast';

const WhatsappIcon = ({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
import Select from '../ui/Select';
import CurrencyInput from '../ui/CurrencyInput';
import { globalPatientsList } from '../patients/Patients';
import { subscribeToCollection, createDoc, updateDoc, deleteDoc, appointmentsCollection, dentistsCollection, proceduresCollection } from '../../services/firebaseService';
import { Appointment, Dentist, Procedure } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

export default function Agenda({ forceNewAppointment, preselectedPatient, onAppointmentHandled }: { forceNewAppointment?: boolean, preselectedPatient?: any, onAppointmentHandled?: () => void }) {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('agenda', 'edit');
  
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());
  const [isBooking, setIsBooking] = useState(false);
  
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientItem, setSelectedPatientItem] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Dentist[]>([]);
  const [dbProcedures, setDbProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [patients, setPatients] = useState<any[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [selectedDentistId, setSelectedDentistId] = useState('');
  const [dentistFilters, setDentistFilters] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState('ongoing');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Custom states added for Financeiro/Payment tracking
  const [payments, setPayments] = useState<{ method: 'PIX'|'Crédito'|'Débito'|'Outros'|''; customMethod: string; amount: number | '' }[]>([
    { method: '', customMethod: '', amount: '' }
  ]);
  const [procedureValue, setProcedureValue] = useState<number | ''>('');

  const [selectedProcedures, setSelectedProcedures] = useState<any[]>([]);

  useEffect(() => {
    if (forceNewAppointment) {
      setIsBooking(true);
      if (preselectedPatient) {
        setSelectedPatientItem(preselectedPatient);
        setPatientSearch(preselectedPatient.name);
      }
      if (onAppointmentHandled) onAppointmentHandled();
    }
  }, [forceNewAppointment, preselectedPatient, onAppointmentHandled]);

  useEffect(() => {
    setActiveStartDate(date);
  }, [date]);

  const treatmentCategories = useMemo(() => {
    const cats: Record<string, Procedure[]> = {};

    dbProcedures.forEach(p => {
      if (!cats[p.category]) cats[p.category] = [];
      cats[p.category].push(p);
    });
    
    return cats;
  }, [dbProcedures]);
  
  const { addToast } = useToast();

  useEffect(() => {
    const unsubAppts = subscribeToCollection<Appointment>(appointmentsCollection, (data) => {
      setAppointmentsList(data);
      setLoading(false);
    });
    const unsubStaff = subscribeToCollection<Dentist>(dentistsCollection, (data) => {
      setStaffList(data);
    });
    const unsubPatients = subscribeToCollection<any>(globalPatientsList.length > 0 ? 'patients' : 'patients', (data) => {
      setPatients(data);
    });
    const unsubProcs = subscribeToCollection<Procedure>(proceduresCollection, (data) => {
      setDbProcedures(data);
    });
    return () => {
      unsubAppts();
      unsubStaff();
      unsubPatients();
      unsubProcs();
    };
  }, []);

  useEffect(() => {
    if (editingAppointment) {
      // Set patient from the list
      const patient = patients.find(p => p.id === editingAppointment.patientId) || 
                      globalPatientsList.find(p => p.id === editingAppointment.patientId);
      
      if (patient) setSelectedPatientItem(patient);
      
      if (editingAppointment.procedures && editingAppointment.procedures.length > 0) {
        setSelectedProcedures(editingAppointment.procedures);
      } else if (editingAppointment.treatmentType) {
        const [cat, ...procParts] = editingAppointment.treatmentType.split(': ');
        setSelectedProcedures([{
          id: String(Date.now()),
          category: cat || '',
          name: procParts.join(': ') || '',
          baseValue: editingAppointment.procedureValue || 0,
          appliedValue: editingAppointment.procedureValue || 0
        }]);
      } else {
        setSelectedProcedures([]);
      }
      
      // Parse category and procedure from treatmentType
      const [cat, ...procParts] = editingAppointment.treatmentType.split(': ');
      setSelectedCategory(cat || '');
      setSelectedProcedure(procParts.join(': ') || '');
      
      setAppointmentDate(format(new Date(editingAppointment.date), "yyyy-MM-dd'T'HH:mm"));
      setAppointmentStatus(editingAppointment.status);
      setSelectedDentistId(editingAppointment.dentistId);
      if (editingAppointment.payments && editingAppointment.payments.length > 0) {
        setPayments(editingAppointment.payments);
      } else {
        setPayments([{ 
          method: editingAppointment.paymentMethod || '', 
          customMethod: editingAppointment.customPaymentMethod || '', 
          amount: editingAppointment.procedureValue || '' 
        }]);
      }
      setProcedureValue(editingAppointment.procedureValue !== undefined ? editingAppointment.procedureValue : '');
    } else {
      setAppointmentDate('');
      setAppointmentStatus('ongoing');
      setSelectedDentistId('');
      setPayments([{ method: '', customMethod: '', amount: '' }]);
      setProcedureValue('');
      setSelectedProcedures([]);
    }
  }, [editingAppointment, patients]);

  const normalizeString = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredPatients = (patients.length > 0 ? patients : globalPatientsList).filter(p => {
    const normalizedSearch = normalizeString(patientSearch || '');
    const normalizedName = normalizeString(p.name || '');
    return normalizedName.includes(normalizedSearch) || 
      (p.code && p.code.toLowerCase().includes(normalizedSearch));
  });

  const appointments = appointmentsList.filter(apt => {
    const aptDate = new Date(apt.date);
    
    // Date filter
    let dateMatch = false;
    if (view === 'day') {
      dateMatch = isSameDay(aptDate, date);
    } else if (view === 'week') {
      dateMatch = isSameWeek(aptDate, date, { weekStartsOn: 0 });
    } else if (view === 'month') {
      dateMatch = isSameMonth(aptDate, date);
    }

    if (!dateMatch) return false;

    // Dentist filter
    if (dentistFilters.length > 0) {
      if (!dentistFilters.includes(apt.dentistId)) return false;
    }

    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished': return 'border-emerald-500 bg-emerald-50 text-emerald-600';
      case 'ongoing': return 'border-gold-500 bg-gold-50 text-gold-700';
      case 'cancelled': return 'border-rose-500 bg-rose-50 text-rose-600';
      default: return 'border-gold-400 bg-gold-50 text-gold-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'finished': return 'Consulta realizada.';
      case 'ongoing': return 'Aguardando.';
      case 'cancelled': return 'Consulta cancelada.';
      default: return 'Aguardando.';
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Agenda Médica</h1>
          <p className="text-slate-500 mt-1">Gerencie os horários e atendimentos da clínica.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              const now = new Date();
              setDate(now);
              setActiveStartDate(now);
              addToast('Voltando para hoje', 'info');
            }}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:bg-slate-50 hover:border-slate-300 text-sm shadow-sm"
            title="Voltar para hoje"
          >
            <RotateCcw className="w-4 h-4 text-gold-600" />
            <span>Atualizar</span>
          </button>

          {dentistFilters.length > 0 && (
            <button 
              onClick={() => {
                setDentistFilters([]);
                addToast('Filtros limpos', 'info');
              }}
              className="bg-white border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:bg-rose-50 hover:border-rose-200 text-sm shadow-sm"
            >
              <FilterX className="w-4 h-4" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      { (isBooking || editingAppointment) ? (
        <div className="medical-card p-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{editingAppointment ? 'Consulta' : 'Nova Consulta'}</h2>
              {editingAppointment && selectedPatientItem && (
                <button
                  type="button"
                  onClick={() => {
                    const phone = selectedPatientItem.phone?.replace(/\D/g, '') || '';
                    if (!phone) {
                      addToast('Paciente sem número cadastrado.', 'error');
                      return;
                    }
                    const dateObj = new Date(appointmentDate || editingAppointment.date);
                    const formattedDate = dateObj.toLocaleDateString('pt-BR');
                    const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    
                    const dentist = staffList.find(d => d.id === selectedDentistId);
                    const dentistName = dentist?.name || 'Doutor(a)';

                    const procsNames = selectedProcedures.length > 0 ? selectedProcedures.map(p => p.name).join(', ') : (selectedProcedure || 'Consulta');
                    const text = `Olá, ${selectedPatientItem.name}! Tudo bem?\nGostaríamos de confirmar a sua consulta:\n\n*Procedimento:* ${procsNames}\n*Doutor(a):* ${dentistName}\n*Data:* ${formattedDate}\n*Horário:* ${formattedTime}\n\nQualquer dúvida, estamos à disposição!`;

                    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                  title="Enviar mensagem via WhatsApp"
                >
                  <WhatsappIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-[200px]">
                <Select 
                  label="Status"
                  value={appointmentStatus}
                  onChange={(e) => setAppointmentStatus(e.target.value)}
                >
                  <option value="ongoing">Aguardando.</option>
                  <option value="finished">Consulta realizada.</option>
                  <option value="cancelled">Consulta cancelada.</option>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Buscar Paciente</label>
              
              {!selectedPatientItem ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Nome ou código do paciente..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all hover:bg-white hover:border-slate-300 shadow-sm"
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                    />
                  </div>

                  {showDropdown && patientSearch.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((p) => (
                          <div 
                            key={p.id}
                            className="flex items-center gap-3 p-3 hover:bg-gold-50 cursor-pointer border-b border-slate-50 last:border-0"
                            onClick={() => {
                              setSelectedPatientItem(p);
                              setShowDropdown(false);
                            }}
                          >
                            {p.photoUrl ? (
                              <img src={p.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] uppercase font-bold text-slate-400">#{p.code}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500 font-medium">Nenhum paciente encontrado.</div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between bg-gold-50 border border-gold-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    {selectedPatientItem.photoUrl ? (
                      <img src={selectedPatientItem.photoUrl} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 ring-2 ring-white shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedPatientItem.name}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500">#{selectedPatientItem.code} • {selectedPatientItem.cpf}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedPatientItem(null);
                      setPatientSearch('');
                    }}
                    className="text-xs font-bold text-gold-600 hover:text-gold-700 bg-white px-3 py-1.5 rounded-lg border border-gold-200"
                  >
                    Trocar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="Doutor Responsável"
                value={selectedDentistId}
                onChange={(e) => setSelectedDentistId(e.target.value)}
              >
                <option value="">Selecione o profissional</option>
                {staffList.map(dentist => (
                  <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                ))}
              </Select>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Data e Hora</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white hover:border-slate-300 shadow-sm" 
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="Tipo de Atendimento"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedProcedure(''); 
                }}
              >
                <option value="">Selecione a categoria</option>
                {Object.keys(treatmentCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>

              {selectedCategory && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Select 
                    label="Procedimento"
                    value={selectedProcedure}
                    onChange={(e) => {
                      const procedureName = e.target.value;
                      setSelectedProcedure(''); // reset selection
                      const proc = treatmentCategories[selectedCategory]?.find(p => p.name === procedureName);
                      if (proc) {
                        setSelectedProcedures(prev => [...prev, {
                          id: String(Date.now()),
                          category: selectedCategory,
                          name: proc.name,
                          baseValue: proc.value,
                          appliedValue: proc.value
                        }]);
                      }
                    }}
                  >
                    <option value="">Selecione o procedimento</option>
                    {treatmentCategories[selectedCategory]?.map((proc) => (
                      <option key={proc.id} value={proc.name}>{proc.name}</option>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            {selectedProcedures.length > 0 && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                {selectedProcedures.map((proc, idx) => {
                  const val = typeof proc.appliedValue === 'number' ? proc.appliedValue : 0;
                  const discount = proc.baseValue > 0 ? ((proc.baseValue - val) / proc.baseValue) * 100 : 0;
                  const isAbove = val > proc.baseValue;
                  const isBelow = val < proc.baseValue;

                  return (
                    <div key={proc.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{proc.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{proc.category} • Base: R$ {Number(proc.baseValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        
                        {isBelow && <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1.5">Desconto de {discount.toFixed(1)}% ({((proc.baseValue - val)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</p>}
                        {isAbove && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1.5">Acima da base (+ {(val - proc.baseValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</p>}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedProcedures(prev => prev.filter(p => p.id !== proc.id))}
                          className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="w-32 sm:w-40 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">R$</span>
                          <CurrencyInput
                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                            value={proc.appliedValue === '' ? '' : Number(proc.appliedValue)}
                            onChangeValue={newVal => {
                              setSelectedProcedures(prev => prev.map(p => p.id === proc.id ? { ...p, appliedValue: newVal === '' ? 0 : Number(newVal) } : p));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {payments.map((payment, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                          <div className="flex-1 w-full">
                            <Select 
                              label={`Pagamento ${idx + 1}`}
                              value={payment.method}
                              onChange={(e) => {
                                const newMethod = e.target.value as any;
                                if (newMethod !== '' && payments.some((p, i) => i !== idx && p.method === newMethod)) {
                                  addToast('Esta forma de pagamento já foi inserida.', 'error');
                                  return;
                                }
                                const newPayments = [...payments];
                                newPayments[idx].method = newMethod;
                                setPayments(newPayments);
                              }}
                            >
                              <option value="">Selecione a forma</option>
                              <option value="PIX">PIX</option>
                              <option value="Crédito">Crédito</option>
                              <option value="Débito">Débito</option>
                              <option value="Outros">Outros</option>
                            </Select>
                            
                            {payment.method === 'Outros' && (
                              <div className="mt-3 animate-in fade-in zoom-in-95 duration-200">
                                <input 
                                  type="text" 
                                  placeholder="Especifique a forma..."
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                                  value={payment.customMethod}
                                  onChange={e => {
                                    const newPayments = [...payments];
                                    newPayments[idx].customMethod = e.target.value;
                                    setPayments(newPayments);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full md:w-32 relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Valor (R$)</label>
                            <span className="absolute left-3 top-[34px] font-bold text-slate-400 text-sm">R$</span>
                            <CurrencyInput
                              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                              value={payment.amount === '' ? '' : Number(payment.amount)}
                              onChangeValue={newVal => {
                                const newPayments = [...payments];
                                newPayments[idx].amount = newVal === '' ? '' : Number(newVal);
                                setPayments(newPayments);
                              }}
                            />
                          </div>
                          
                          {payments.length > 1 && (
                            <button 
                              onClick={() => setPayments(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors flex-shrink-0 mb-[2px]"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {payments.length < 2 && (
                        <button 
                          onClick={() => setPayments(prev => [...prev, { method: '', customMethod: '', amount: '' }])}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Adicionar Forma de Pagamento
                        </button>
                      )}
                    </div>
                    
                    <div className="text-right border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Valor Total</p>
                      <p className="text-2xl font-bold font-display text-slate-900">
                        R$ {selectedProcedures.reduce((acc, p) => acc + (p.appliedValue || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {(() => {
                        const totalBase = selectedProcedures.reduce((acc, p) => acc + p.baseValue, 0);
                        const totalApplied = selectedProcedures.reduce((acc, p) => acc + (p.appliedValue || 0), 0);
                        if (totalApplied < totalBase && totalBase > 0) {
                          return <p className="text-[10px] uppercase font-bold text-amber-600 mt-1">Desconto Total: {(((totalBase - totalApplied) / totalBase) * 100).toFixed(1)}%</p>
                        } else if (totalApplied > totalBase) {
                          return <p className="text-[10px] uppercase font-bold text-emerald-600 mt-1">Acima (+{(totalApplied - totalBase).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</p>
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                onClick={async () => {
                  if (!selectedPatientItem) {
                    addToast('Selecione um paciente.', 'error');
                    return;
                  }
                  
                  if (selectedProcedures.length === 0) {
                    addToast('Adicione pelo menos um procedimento.', 'error');
                    return;
                  }

                  if (!selectedDentistId) {
                    addToast('Selecione o doutor responsável.', 'error');
                    return;
                  }

                  if (!appointmentDate) {
                    addToast('Selecione Data e Hora.', 'error');
                    return;
                  }

                  const selectedDentist = staffList.find(d => d.id === selectedDentistId);

                  const totalApplied = selectedProcedures.reduce((acc, p) => acc + (p.appliedValue || 0), 0);
                  const totalPayments = payments.reduce((acc, p) => acc + (p.amount !== '' ? Number(p.amount) : 0), 0);

                  if (Math.abs(totalPayments - totalApplied) > 0.01) {
                    addToast(`O valor dos pagamentos (R$ ${totalPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) deve ser igual ao valor total da consulta (R$ ${totalApplied.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`, 'error');
                    return;
                  }

                  const selectedMethods = payments.map(p => p.method).filter(m => m !== '');
                  const uniqueMethods = new Set(selectedMethods);
                  if (selectedMethods.length !== uniqueMethods.size) {
                    addToast('Não é permitido inserir formas de pagamento repetidas.', 'error');
                    return;
                  }

                  const proceduresStr = selectedProcedures.map(p => p.name).join(', ');

                  const appointmentData: any = {
                    patientId: selectedPatientItem.id,
                    patientName: selectedPatientItem.name,
                    dentistId: selectedDentistId,
                    dentistName: selectedDentist?.name || 'Doutor(a)',
                    date: new Date(appointmentDate).toISOString(),
                    duration: 60,
                    status: appointmentStatus,
                    treatmentType: proceduresStr, // Summary for backward compatibility
                    procedureName: proceduresStr, // Summary
                    procedureValue: totalApplied, // Total value
                    procedures: selectedProcedures, // The actual array
                    payments: payments.filter(p => p.method !== ''),
                    paymentMethod: payments[0]?.method || '', // Backwards compatibility
                    customPaymentMethod: payments[0]?.method === 'Outros' ? payments[0].customMethod : '' // Backwards compatibility
                  };

                  try {
                    if (editingAppointment) {
                      await updateDoc(appointmentsCollection, editingAppointment.id, appointmentData);
                      addToast('Consulta atualizada!', 'success');
                    } else {
                      await createDoc(appointmentsCollection, appointmentData);
                      addToast('Consulta agendada!', 'success');
                    }
                    setIsBooking(false);
                    setEditingAppointment(null);
                    setSelectedPatientItem(null);
                    setPatientSearch('');
                    setSelectedCategory('');
                    setSelectedProcedure('');
                    setSelectedDentistId('');
                    setPayments([{ method: '', customMethod: '', amount: '' }]);
                    setProcedureValue('');
                  } catch (error) {
                    addToast('Erro ao salvar consulta.', 'error');
                  }
                }} 
                className="flex-1 bg-gold-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-gold-100 hover:bg-gold-700 transition-colors"
              >
                {editingAppointment ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
              </button>
              <button 
                onClick={() => {
                  setIsBooking(false);
                  setEditingAppointment(null);
                  setSelectedPatientItem(null);
                  setPatientSearch('');
                  setSelectedCategory('');
                  setSelectedProcedure('');
                  setSelectedDentistId('');
                  setPayments([{ method: '', customMethod: '', amount: '' }]);
                  setProcedureValue('');
                }} 
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              {editingAppointment && (
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  Excluir
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Calendar Picker Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="medical-card p-4">
            <Calendar 
              onChange={(d: any) => setDate(d)} 
              value={date}
              activeStartDate={activeStartDate}
              onActiveStartDateChange={({ activeStartDate }: any) => setActiveStartDate(activeStartDate)}
              locale="pt-BR"
              className="border-none w-full font-sans custom-calendar"
              tileClassName={({ date, view }: any) => {
                if (view === 'month') {
                  const hasAppointment = appointmentsList.some(apt => 
                    isSameDay(new Date(apt.date), date)
                  );
                  if (hasAppointment) {
                    return 'has-appointment';
                  }
                }
                return null;
              }}
            />
          </div>
          
          <div className="medical-card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Filtrar Doutor(a)</h3>
            <div className="space-y-3">
              {staffList.length > 0 ? staffList.map(dentist => (
                <DentistFilter 
                  key={dentist.id} 
                  name={dentist.name} 
                  color={dentist.color || 'bg-gold-500'} 
                  checked={dentistFilters.includes(dentist.id)}
                  onChange={() => {
                    setDentistFilters(prev => 
                      prev.includes(dentist.id) 
                        ? prev.filter(id => id !== dentist.id) 
                        : [...prev, dentist.id]
                    );
                  }}
                />
              )) : (
                <p className="text-xs text-slate-400">Nenhum doutor cadastrado.</p>
              )}
            </div>
          </div>
        </div>

        {/* Day View */}
        <div className="xl:col-span-3 space-y-6">
          <div className="medical-card p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    if (view === 'day') setDate(prev => subDays(prev, 1));
                    if (view === 'week') setDate(prev => subWeeks(prev, 1));
                    if (view === 'month') setDate(prev => subMonths(prev, 1));
                  }}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 group transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:text-gold-600" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 capitalize">
                  {view === 'day' && format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  {view === 'week' && `Semana de ${format(startOfWeek(date), "d 'de' MMMM", { locale: ptBR })} a ${format(endOfWeek(date), "d 'de' MMMM", { locale: ptBR })}`}
                  {view === 'month' && format(date, "MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <button 
                  onClick={() => {
                    if (view === 'day') setDate(prev => addDays(prev, 1));
                    if (view === 'week') setDate(prev => addWeeks(prev, 1));
                    if (view === 'month') setDate(prev => addMonths(prev, 1));
                  }}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 group transition-colors"
                >
                  <ChevronRight className="w-5 h-5 group-hover:text-gold-600" />
                </button>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setView('day')} 
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${view === 'day' ? 'bg-white text-gold-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setView('week')} 
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${view === 'week' ? 'bg-white text-gold-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setView('month')} 
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${view === 'month' ? 'bg-white text-gold-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Mês
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {appointments.length > 0 ? appointments.map((apt: any) => (
                <div key={apt.id} className="flex gap-6 group">
                  <div className="w-16 pt-2 text-right flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-400 group-hover:text-gold-600 transition-colors uppercase tabular-nums">
                      {format(new Date(apt.date), 'HH:mm')}
                    </span>
                    {view !== 'day' && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {format(new Date(apt.date), 'dd/MM')}
                      </span>
                    )}
                  </div>
                  <div 
                    onClick={() => {
                      if (canEdit) {
                        setEditingAppointment(apt);
                      } else {
                        addToast('Apenas visualização permitida.', 'info');
                      }
                    }}
                    className={`flex-1 border-l-4 rounded-r-2xl p-4 transition-all hover:translate-x-1 cursor-pointer shadow-sm hover:shadow-md ${getStatusColor(apt.status)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{apt.patientName || 'Paciente'}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">• {apt.treatmentType}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs font-medium opacity-70">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{format(new Date(apt.date), 'HH:mm')} - {apt.duration}min</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium opacity-70">
                              <User className="w-3.5 h-3.5" />
                              <span>{apt.dentistName || 'Dr. Roberto Santos'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="p-2 rounded-xl bg-white/60 shadow-sm border border-current/20">
                          {apt.status === 'finished' && <CheckCircle2 className="w-7 h-7 text-emerald-600" />}
                          {apt.status === 'cancelled' && <XCircle className="w-7 h-7 text-rose-600" />}
                          {apt.status === 'ongoing' && <Clock className="w-7 h-7 text-gold-600" />}
                          {apt.status === 'scheduled' && <AlertCircle className="w-7 h-7 text-gold-600" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="font-medium">Nenhuma consulta agendada para este dia.</p>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>

      )}
      <style>{`
        .custom-calendar {
          background: transparent !important;
          font-family: inherit !important;
        }
        .react-calendar__navigation button {
          font-weight: bold !important;
          color: var(--slate-900) !important;
        }
        .react-calendar__tile {
          color: var(--slate-900) !important;
        }
        .react-calendar__tile:disabled {
          color: var(--slate-400) !important;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: var(--slate-400) !important; 
        }
        .react-calendar__tile--now {
          background: var(--gold-50) !important;
          color: var(--gold-700) !important;
          border-radius: 8px;
        }
        .has-appointment {
          background: var(--gold-100) !important;
          color: var(--gold-800) !important;
          border-radius: 8px;
          font-weight: bold;
        }
        .react-calendar__tile--active {
          background: var(--gold-500) !important;
          color: var(--color-white-override) !important;
          border-radius: 8px;
          filter: drop-shadow(0 4px 6px rgba(190, 164, 75, 0.2));
        }
        .react-calendar__tile:hover {
          background: var(--slate-100) !important;
          border-radius: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          text-decoration: none !important;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--slate-500);
        }
      `}</style>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-rose-100 p-2.5 rounded-full text-rose-500 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Excluir Consulta</h3>
                <p className="text-sm text-slate-500 mt-1">Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  if (editingAppointment) {
                    try {
                      await deleteDoc(appointmentsCollection, editingAppointment.id);
                      addToast('Consulta excluída!', 'success');
                      setShowDeleteModal(false);
                      setIsBooking(false);
                      setEditingAppointment(null);
                      setSelectedPatientItem(null);
                      setPatientSearch('');
                      setSelectedCategory('');
                      setSelectedProcedure('');
                      setSelectedDentistId('');
                      setPayments([{ method: '', customMethod: '', amount: '' }]);
                      setProcedureValue('');
                    } catch (error) {
                      addToast('Erro ao excluir consulta.', 'error');
                    }
                  }
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DentistFilter({ name, color, checked, onChange }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
          className="peer hidden" 
        />
        <div className="w-5 h-5 rounded border border-slate-300 peer-checked:bg-gold-600 peer-checked:border-gold-600 transition-all"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{name}</span>
    </label>
  );
}
