import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, User, ChevronLeft, ChevronRight, Plus, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Appointment, Patient, Dentist } from '../../types';
import { dataService } from '../../services/dataService';

export default function Agenda() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [newAppt, setNewAppt] = useState<Omit<Appointment, 'id'>>({ 
    patientId: '', 
    dentistId: '', 
    date: new Date().toISOString(), 
    status: 'scheduled', 
    treatmentType: 'Consulta Geral' 
  });

  useEffect(() => {
    const unsubscribeAppts = dataService.subscribeAppointments(setAppointments);
    const unsubscribePatients = dataService.subscribePatients(setPatients);
    const unsubscribeDentists = dataService.subscribeDentists(setDentists);
    return () => {
      unsubscribeAppts();
      unsubscribePatients();
      unsubscribeDentists();
    };
  }, []);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addAppointment(newAppt);
      setShowAddForm(false);
      setNewAppt({ patientId: '', dentistId: '', date: new Date().toISOString(), status: 'scheduled', treatmentType: 'Consulta Geral' });
    } catch (error) {
      console.error(error);
      alert('Erro ao agendar consulta');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'finished': return 'Finalizada';
      case 'ongoing': return 'Em Atendimento';
      case 'scheduled': return 'Agendada';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === date.toDateString();
  });

  const handlePrevDay = () => {
    const newDate = new Date(date);
    if (view === 'dia') {
      newDate.setDate(date.getDate() - 1);
    } else if (view === 'semana') {
      newDate.setDate(date.getDate() - 7);
    } else {
      newDate.setMonth(date.getMonth() - 1);
    }
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    if (view === 'dia') {
      newDate.setDate(date.getDate() + 1);
    } else if (view === 'semana') {
      newDate.setDate(date.getDate() + 7);
    } else {
      newDate.setMonth(date.getMonth() + 1);
    }
    setDate(newDate);
  };

  const getWeekDays = (baseDate: Date) => {
    const days = [];
    const first = baseDate.getDate() - baseDate.getDay();
    for (let i = 0; i < 7; i++) {
      const day = new Date(baseDate);
      day.setDate(first + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(date);

  if (showAddForm) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Agendar Consulta</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Reserve um horário na agenda da clínica.</p>
        </div>

        <div className="medical-card p-8 max-w-2xl">
          <form onSubmit={handleAddAppointment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Paciente</label>
                <select 
                  required
                  value={newAppt.patientId}
                  onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Dentista</label>
                <select 
                  required
                  value={newAppt.dentistId}
                  onChange={e => setNewAppt({...newAppt, dentistId: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                >
                  <option value="">Selecione um dentista</option>
                  {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Data e Hora</label>
                <input 
                  required
                  type="datetime-local"
                  value={newAppt.date.slice(0, 16)}
                  onChange={e => setNewAppt({...newAppt, date: new Date(e.target.value).toISOString()})}
                  className="w-full bg-white dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Procedimento</label>
                <input 
                  required
                  value={newAppt.treatmentType}
                  onChange={e => setNewAppt({...newAppt, treatmentType: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
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
                Confirmar Agendamento
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (view === 'dia') {
      return (
        <table className="w-full text-left">
          <thead className="border-b border-border bg-slate-50 dark:bg-slate-900/40">
            <tr>
              <th className="px-4 py-3 text-[12px] text-text-muted font-bold uppercase tracking-wider">Horário</th>
              <th className="px-4 py-3 text-[12px] text-text-muted font-bold uppercase tracking-wider">Paciente</th>
              <th className="px-4 py-3 text-[12px] text-text-muted font-bold uppercase tracking-wider">Procedimento</th>
              <th className="px-4 py-3 text-[12px] text-text-muted font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-muted font-medium italic">
                  Nenhum agendamento para este dia.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                  <td className="px-4 py-4 text-sm font-medium text-text-muted">
                    {format(new Date(apt.date), 'HH:mm')}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-text-main dark:text-slate-200">
                    {apt.patientId} {/* In a real app we'd map ID to Name */}
                  </td>
                  <td className="px-4 py-4 text-sm text-text-muted">{apt.treatmentType}</td>
                  <td className="px-4 py-4">
                    <span className={`status-pill status-${apt.status}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (view === 'semana') {
      return (
        <div className="grid grid-cols-7 gap-px bg-border dark:bg-slate-800 border border-border dark:border-slate-800 rounded-xl overflow-hidden">
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === date.toDateString();
            const dayAppts = appointments.filter(a => new Date(a.date).toDateString() === day.toDateString());
            
            return (
              <div 
                key={idx} 
                onClick={() => setDate(day)}
                className={cn(
                  "bg-surface min-h-[400px] p-2 transition-colors cursor-pointer",
                  isSelected ? 'bg-primary-light dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                )}
              >
                <div className="text-center mb-4">
                  <p className="text-[10px] font-bold text-text-muted uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                  <p className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full mx-auto text-sm font-bold mt-1",
                    isToday ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-main dark:text-slate-300"
                  )}>
                    {day.getDate()}
                  </p>
                </div>
                <div className="space-y-2">
                  {dayAppts.map((apt, aidx) => (
                    <div key={aidx} className="p-1 px-2 rounded-lg bg-primary-light border border-primary/20 text-[10px] font-bold text-primary truncate">
                      {format(new Date(apt.date), 'HH:mm')} {apt.patientId}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="py-12 text-center text-slate-400 italic font-medium">
        Modo Mês em desenvolvimento...
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Agenda Médica</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Gerencie os horários e atendimentos da clínica.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-primary/20 text-sm font-display uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" />
          <span>Agendar Consulta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Calendar Picker Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="medical-card p-4">
            <Calendar 
              onChange={(d: any) => setDate(new Date(d))} 
              value={date}
              locale="pt-BR"
              className="border-none w-full font-sans custom-calendar"
            />
          </div>
          
          <div className="medical-card p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Dentistas</h3>
            <div className="space-y-3">
              <DentistFilter name="Dr. Roberto Santos" color="bg-sky-500" checked />
              <DentistFilter name="Dra. Luiza Mendes" color="bg-purple-500" checked />
              <DentistFilter name="Dr. Marcos Lima" color="bg-amber-500" />
            </div>
          </div>
        </div>

        {/* Day/Week View */}
        <div className="xl:col-span-3 space-y-6">
          <div className="medical-card p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrevDay}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 group transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:text-sky-600" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                  {view === 'dia' ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : 
                   `Semana de ${format(weekDays[0], "d 'de' MMM")} a ${format(weekDays[6], "d 'de' MMM")}`}
                </h2>
                <button 
                  onClick={handleNextDay}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 group transition-colors"
                >
                  <ChevronRight className="w-5 h-5 group-hover:text-sky-600" />
                </button>
              </div>
            <div className="flex bg-slate-200 dark:bg-slate-900/50 p-1 rounded-xl">
                <button 
                  onClick={() => setView('dia')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    view === 'dia' ? "bg-surface dark:bg-slate-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"
                  )}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setView('semana')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    view === 'semana' ? "bg-surface dark:bg-slate-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"
                  )}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setView('mes')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    view === 'mes' ? "bg-surface dark:bg-slate-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"
                  )}
                >
                  Mês
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-calendar {
          background: transparent !important;
          font-family: inherit !important;
        }
        .react-calendar__navigation button {
          font-weight: bold !important;
          color: var(--color-text-dark, #0F172A) !important;
        }
        .react-calendar__navigation button:hover {
          background-color: var(--color-background, #F0F9FF) !important;
          border-radius: 8px;
        }
        .react-calendar__month-view__days__day {
          color: var(--color-text-main, #334155) !important;
          font-weight: 500;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: var(--color-text-very-muted, #94A3B8) !important;
        }
        .react-calendar__tile--now {
          background: var(--color-primary-light, #F0F9FF) !important;
          color: var(--color-primary, #0EA5E9) !important;
          border-radius: 8px;
        }
        .react-calendar__tile--active {
          background: var(--color-primary, #0EA5E9) !important;
          color: white !important;
          border-radius: 8px;
          filter: drop-shadow(0 4px 6px rgba(14, 165, 233, 0.2));
        }
        .react-calendar__tile:hover {
          background-color: var(--color-background, #F0F9FF) !important;
          border-radius: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          text-decoration: none !important;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--color-text-muted, #94A3B8);
        }
      `}</style>
    </div>
  );
}

function DentistFilter({ name, color, checked }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input type="checkbox" defaultChecked={checked} className="peer hidden" />
        <div className="w-5 h-5 rounded border border-slate-300 peer-checked:bg-sky-600 peer-checked:border-sky-600 transition-all"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{name}</span>
    </label>
  );
}
