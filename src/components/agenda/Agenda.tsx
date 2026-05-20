import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, User, ChevronLeft, ChevronRight, Plus, MapPin, Phone, Search, Info, CheckCircle2, XCircle, AlertCircle, RotateCcw, FilterX } from 'lucide-react';
import { format, addDays, subDays, isSameDay, isSameWeek, isSameMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../ui/Toast';
import Select from '../ui/Select';
import { globalPatientsList } from '../patients/Patients';
import { subscribeToCollection, createDoc, updateDoc, deleteDoc, appointmentsCollection, dentistsCollection } from '../../services/firebaseService';
import { Appointment, Dentist } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

export default function Agenda({ forceNewAppointment, onAppointmentHandled }: { forceNewAppointment?: boolean, onAppointmentHandled?: () => void }) {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('agenda', 'edit');
  
  const [date, setDate] = useState(new Date());
  const [isBooking, setIsBooking] = useState(false);
  
  useEffect(() => {
    if (forceNewAppointment) {
      setIsBooking(true);
      if (onAppointmentHandled) onAppointmentHandled();
    }
  }, [forceNewAppointment]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientItem, setSelectedPatientItem] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [patients, setPatients] = useState<any[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [selectedDentistId, setSelectedDentistId] = useState('');
  const [dentistFilters, setDentistFilters] = useState<string[]>([]);

  const treatmentCategories = {
    'Ortodontia': ['Manutenção de aparelho', 'Instalação de aparelho', 'Remoção', 'Moldagem'],
    'Clínica Geral': ['Limpeza', 'Restauração', 'Avaliação', 'Extração'],
    'Endodontia': ['Canal', 'Retratamento', 'Curativo'],
    'Implantodontia': ['Instalação de Implante', 'Prótese sobre Implante', 'Avaliação de Implante']
  };
  
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
    return () => {
      unsubAppts();
      unsubStaff();
      unsubPatients();
    };
  }, []);

  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState('ongoing');

  useEffect(() => {
    if (editingAppointment) {
      // Set patient from the list
      const patient = patients.find(p => p.id === editingAppointment.patientId) || 
                      globalPatientsList.find(p => p.id === editingAppointment.patientId);
      
      if (patient) setSelectedPatientItem(patient);
      
      // Parse category and procedure from treatmentType
      const [cat, ...procParts] = editingAppointment.treatmentType.split(': ');
      setSelectedCategory(cat || '');
      setSelectedProcedure(procParts.join(': ') || '');
      
      setAppointmentDate(format(new Date(editingAppointment.date), "yyyy-MM-dd'T'HH:mm"));
      setAppointmentStatus(editingAppointment.status);
      setSelectedDentistId(editingAppointment.dentistId);
    } else {
      setAppointmentDate('');
      setAppointmentStatus('ongoing');
      setSelectedDentistId('');
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
              setDate(new Date());
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
            <h2 className="text-2xl font-bold">{editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}</h2>
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
                    onChange={(e) => setSelectedProcedure(e.target.value)}
                  >
                    <option value="">Selecione o procedimento</option>
                    {selectedCategory && (treatmentCategories as any)[selectedCategory] && (
                      (treatmentCategories as any)[selectedCategory].map((proc: string) => (
                        <option key={proc} value={proc}>{proc}</option>
                      ))
                    )}
                  </Select>
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
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Data e Hora</label>
              <input 
                type="datetime-local" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all hover:bg-white hover:border-slate-300 shadow-sm" 
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                onClick={async () => {
                  if (!selectedPatientItem) {
                    addToast('Selecione um paciente.', 'error');
                    return;
                  }
                  
                  if (!selectedCategory || !selectedProcedure) {
                    addToast('Selecione o Tipo de Atendimento e o Procedimento.', 'error');
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

                  const appointmentData: any = {
                    patientId: selectedPatientItem.id,
                    patientName: selectedPatientItem.name,
                    dentistId: selectedDentistId,
                    dentistName: selectedDentist?.name || 'Dr. Roberto Santos',
                    date: new Date(appointmentDate).toISOString(),
                    duration: 60,
                    status: appointmentStatus,
                    treatmentType: `${selectedCategory}: ${selectedProcedure}`
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
                }} 
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
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
