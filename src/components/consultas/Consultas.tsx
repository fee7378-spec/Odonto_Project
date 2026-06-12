import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Download, CalendarCheck, Search, Filter, X, RotateCcw } from 'lucide-react';
import { subscribeToCollection, appointmentsCollection } from '../../services/firebaseService';
import { Appointment } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusTranslation = (status: string) => {
  switch (status) {
    case 'finished': return 'Consulta realizada.';
    case 'ongoing': return 'Aguardando.';
    case 'confirmed': return 'Confirmado';
    case 'scheduled': return 'Agendado';
    case 'cancelled': return 'Consulta cancelada.';
    case 'no_show': return 'Faltou';
    case 'evaluation': return 'Avaliação';
    default: return status;
  }
};

export default function Consultas() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('consultas', 'view');
  
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [visibleCount, setVisibleCount] = useState(20);

  // Dual calendar state for filtering
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (startRef.current && !startRef.current.contains(event.target as Node)) {
        setShowStartCalendar(false);
      }
      if (endRef.current && !endRef.current.contains(event.target as Node)) {
        setShowEndCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Appointment>(appointmentsCollection, (data) => {
      setAppointmentsList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!canView) {
    return <div className="p-8"><p className="text-slate-500">Você não tem permissão para visualizar as consultas.</p></div>;
  }

  const isDateInRange = (dateStr: string) => {
    if (!startDate || !endDate) return true;
    const dateObj = new Date(dateStr);
    return isWithinInterval(dateObj, { start: startOfDay(startDate), end: endOfDay(endDate) });
  };

  const filteredAppointments = appointmentsList.filter(a => {
    const s = searchTerm.toLowerCase();
    const searchMatch = (a.patientName?.toLowerCase().includes(s)) || (a.treatmentType?.toLowerCase().includes(s));
    return searchMatch && isDateInRange(a.date);
  });

  const sortedFiltered = [...filteredAppointments].sort((a, b) => b.date.localeCompare(a.date));
  const visibleAppointments = sortedFiltered.slice(0, visibleCount);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Histórico de Consultas</h1>
          <p className="text-slate-500 mt-1">Veja todos os atendimentos, valores e procedimentos já realizados ou pendentes.</p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative" ref={startRef}>
            <button 
              onClick={() => {
                setShowStartCalendar(!showStartCalendar);
                setShowEndCalendar(false);
              }}
              className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 shadow-sm whitespace-nowrap min-w-[140px]"
            >
              <Filter className="w-4 h-4 text-slate-400" />
              <span>{startDate ? format(startDate, 'dd/MM/yyyy') : 'Início'}</span>
              <CalendarCheck className="w-4 h-4 text-slate-400" />
            </button>
            {showStartCalendar && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-xl shadow-xl border border-slate-100">
                <Calendar 
                  onChange={(date: any) => {
                    setStartDate(date);
                    setShowStartCalendar(false);
                  }}
                  value={startDate}
                  locale="pt-BR"
                  className="border-none font-sans custom-calendar"
                />
              </div>
            )}
          </div>
          
          <span className="text-slate-300 flex items-center">|</span>

          <div className="relative" ref={endRef}>
            <button 
              onClick={() => {
                setShowEndCalendar(!showEndCalendar);
                setShowStartCalendar(false);
              }}
              className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 shadow-sm whitespace-nowrap min-w-[140px]"
            >
              <span>{endDate ? format(endDate, 'dd/MM/yyyy') : 'Fim'}</span>
              <CalendarCheck className="w-4 h-4 text-slate-400" />
            </button>
            {showEndCalendar && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-xl shadow-xl border border-slate-100">
                <Calendar 
                  onChange={(date: any) => {
                    setEndDate(date);
                    setShowEndCalendar(false);
                  }}
                  value={endDate}
                  locale="pt-BR"
                  className="border-none font-sans custom-calendar"
                />
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              // Forced re-render / fetch logic could be here if we were manually fetching,
              // but since it's real-time just UI feedback is fine.
              setStartDate(startOfMonth(new Date()));
              setEndDate(endOfMonth(new Date()));
            }}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-slate-50 shadow-sm ml-2"
            title="Atualizar / Voltar para este mês"
          >
            <RotateCcw className="w-4 h-4 text-gold-600" />
            Atualizar
          </button>

          <button 
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-slate-50 shadow-sm ml-2"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="medical-card">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900">Todas as Consultas</h3>
          <div className="w-full md:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente ou tipo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 text-center text-slate-400">Carregando...</div>
          ) : (
            <div className="w-full">
              <table className="w-full text-left relative">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data / Hora</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Procedimento</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Pagamento</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visibleAppointments.length > 0 ? visibleAppointments.map((t) => (
                    <AppointmentRow 
                      key={t.id}
                      appointment={t}
                      onClick={() => setSelectedAppointment(t)}
                    />
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Nenhuma consulta encontrada no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {sortedFiltered.length > visibleCount && (
                <div className="p-4 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 20)}
                    className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Carregar mais
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold font-display text-slate-900">Detalhes da Consulta</h2>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paciente</p>
                  <p className="font-bold text-slate-900">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Doutor(a)</p>
                  <p className="font-bold text-slate-900">{selectedAppointment.dentistName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data / Hora</p>
                  <p className="font-bold text-slate-900">
                    {format(new Date(selectedAppointment.date), 'dd/MM/yyyy')} às {format(new Date(selectedAppointment.date), 'HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`inline-block text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    selectedAppointment.status === 'finished' ? 'bg-emerald-50 text-emerald-600' : 
                    selectedAppointment.status === 'ongoing' ? 'bg-amber-50 text-amber-600' : 
                    selectedAppointment.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : 
                    selectedAppointment.status === 'scheduled' ? 'bg-gold-50 text-gold-600' : 
                    selectedAppointment.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 
                    selectedAppointment.status === 'no_show' ? 'bg-red-50 text-red-600' : 
                    selectedAppointment.status === 'evaluation' ? 'bg-purple-50 text-purple-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {getStatusTranslation(selectedAppointment.status)}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Procedimento</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedAppointment.treatmentType}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor</p>
                  <p className="font-bold text-slate-900 text-lg">
                    R$ {Number(selectedAppointment.procedureValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pagamento</p>
                  <p className="font-bold text-slate-700">
                    {selectedAppointment.paymentMethod === 'Outros' ? selectedAppointment.customPaymentMethod : selectedAppointment.paymentMethod || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-900 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentRow({ appointment, onClick }: { key?: string | number, appointment: Appointment, onClick: () => void }) {
  const formattedDate = appointment.date ? format(new Date(appointment.date), 'dd/MM/yyyy') : 'N/A';
  const method = appointment.paymentMethod === 'Outros' ? appointment.customPaymentMethod : appointment.paymentMethod;
  const amount = Number(appointment.procedureValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const statusTranslation = getStatusTranslation(appointment.status);

  return (
    <tr 
      onClick={onClick}
      className="hover:bg-slate-50 transition-colors cursor-pointer group"
    >
      <td className="px-6 py-4 font-medium text-slate-600 text-sm group-hover:text-gold-600 transition-colors">
        {formattedDate} <span className="text-slate-400 ml-1">{format(new Date(appointment.date), 'HH:mm')}</span>
      </td>
      <td className="px-6 py-4 text-slate-800 text-sm font-bold group-hover:text-gold-700 transition-colors">{appointment.patientName}</td>

      <td className="px-6 py-4 font-medium text-slate-500 text-sm">{appointment.treatmentType}</td>
      <td className="px-6 py-4 text-center">
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {method || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">
        R$ {amount}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            appointment.status === 'finished' ? 'bg-emerald-50 text-emerald-600' : 
            appointment.status === 'ongoing' ? 'bg-amber-50 text-amber-600' : 
            appointment.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : 
            appointment.status === 'scheduled' ? 'bg-gold-50 text-gold-600' : 
            appointment.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 
            appointment.status === 'no_show' ? 'bg-red-50 text-red-600' : 
            appointment.status === 'evaluation' ? 'bg-purple-50 text-purple-600' :
            'bg-slate-100 text-slate-500'
          }`}>
            {statusTranslation}
          </span>
        </div>
      </td>
    </tr>
  );
}
