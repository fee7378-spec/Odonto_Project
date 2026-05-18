import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, User, ChevronLeft, ChevronRight, Plus, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Appointment } from '../../types';
import { dataService } from '../../services/dataService';

export default function Agenda() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const unsubscribe = dataService.subscribeAppointments((list) => {
      setAppointments(list);
    });
    return () => unsubscribe();
  }, []);

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

  const renderContent = () => {
    if (view === 'dia') {
      return (
        <table className="w-full text-left">
          <thead className="border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-[12px] text-text-very-muted font-bold uppercase tracking-wider">Horário</th>
              <th className="px-4 py-3 text-[12px] text-text-very-muted font-bold uppercase tracking-wider">Paciente</th>
              <th className="px-4 py-3 text-[12px] text-text-very-muted font-bold uppercase tracking-wider">Procedimento</th>
              <th className="px-4 py-3 text-[12px] text-text-very-muted font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-400 font-medium italic">
                  Nenhum agendamento para este dia.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-4 text-sm font-medium text-text-muted">
                    {format(new Date(apt.date), 'HH:mm')}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-text-dark">
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
        <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === date.toDateString();
            const dayAppts = appointments.filter(a => new Date(a.date).toDateString() === day.toDateString());
            
            return (
              <div 
                key={idx} 
                onClick={() => setDate(day)}
                className={cn(
                  "bg-white min-h-[400px] p-2 transition-colors cursor-pointer",
                  isSelected ? 'bg-sky-50/50' : 'hover:bg-slate-50'
                )}
              >
                <div className="text-center mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                  <p className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full mx-auto text-sm font-bold mt-1",
                    isToday ? "bg-sky-600 text-white" : "text-slate-700"
                  )}>
                    {day.getDate()}
                  </p>
                </div>
                <div className="space-y-2">
                  {dayAppts.map((apt, aidx) => (
                    <div key={aidx} className="p-1 px-2 rounded-lg bg-sky-50 border border-sky-100 text-[10px] font-bold text-sky-700 truncate">
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
          <h1 className="text-3xl font-bold font-display text-slate-900">Agenda Médica</h1>
          <p className="text-slate-500 mt-1">Gerencie os horários e atendimentos da clínica.</p>
        </div>
        <button 
          onClick={() => alert('Abrir modal de novo agendamento')}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-sky-100 text-sm"
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
            <h3 className="font-bold text-slate-900 mb-4">Dentistas</h3>
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
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 group transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:text-sky-600" />
                </button>
                <h2 className="text-xl font-bold text-slate-900 capitalize">
                  {view === 'dia' ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : 
                   `Semana de ${format(weekDays[0], "d 'de' MMM")} a ${format(weekDays[6], "d 'de' MMM")}`}
                </h2>
                <button 
                  onClick={handleNextDay}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 group transition-colors"
                >
                  <ChevronRight className="w-5 h-5 group-hover:text-sky-600" />
                </button>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setView('dia')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    view === 'dia' ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setView('semana')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    view === 'semana' ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setView('mes')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    view === 'mes' ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
          color: #0F172A !important;
        }
        .react-calendar__tile--now {
          background: #F0F9FF !important;
          color: #0EA5E9 !important;
          border-radius: 8px;
        }
        .react-calendar__tile--active {
          background: #0EA5E9 !important;
          color: white !important;
          border-radius: 8px;
          filter: drop-shadow(0 4px 6px rgba(14, 165, 233, 0.2));
        }
        .react-calendar__tile:hover {
          border-radius: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          text-decoration: none !important;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94A3B8;
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
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{name}</span>
    </label>
  );
}
