import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Filter,
  RotateCcw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import Select from '../ui/Select';
import { subscribeToCollection, appointmentsCollection, transactionsCollection, patientsCollection } from '../../services/firebaseService';
import { Appointment, Transaction, Patient } from '../../types';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Dual calendar state for filtering
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  
  const startRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const unsubAppts = subscribeToCollection<Appointment>(appointmentsCollection, setAppointments);
    const unsubTrans = subscribeToCollection<Transaction>(transactionsCollection, setTransactions);
    const unsubPatients = subscribeToCollection<Patient>(patientsCollection, setPatients);
    
    return () => {
      unsubAppts();
      unsubTrans();
      unsubPatients();
    };
  }, []);

  // Create a helper to check if a datestring falls into the selected range
  const isDateInRange = (dateStr: string) => {
    if (!startDate || !endDate) return true;
    const dateObj = new Date(dateStr);
    return isWithinInterval(dateObj, { start: startOfDay(startDate), end: endOfDay(endDate) });
  };

  const filteredAppointments = appointments.filter(a => isDateInRange(a.date));
  
  // Compute total income directly from finished appointments
  const totalIncome = filteredAppointments.reduce((acc, apt) => {
    if (apt.status === 'finished') {
      const val = apt.procedureValue || 0;
      return acc + Number(val);
    }
    return acc;
  }, 0);

  const chartData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => {
      const dayAppts = filteredAppointments.filter(a => isSameDay(new Date(a.date), day) && a.status === 'finished');
      const totalValueForDay = dayAppts.reduce((acc, apt) => acc + Number(apt.procedureValue || 0), 0);
      const weekNum = Math.ceil(day.getDate() / 7);
      return {
        name: day.toISOString(),
        displayDate: format(day, 'dd/MM'),
        week: `Semana ${weekNum}`,
        value: totalValueForDay,
        dayOfWeek: day.getDay()
      };
    });
  }, [startDate, endDate, filteredAppointments]);

  const renderCustomXAxisTick = ({ x, y, payload }: any) => {
    const dataItem = chartData.find(d => d.name === payload.value);
    if (dataItem && dataItem.dayOfWeek === 1) { // Show on Mondays
      return (
        <text x={x} y={y + 15} fill="#64748B" fontSize={12} textAnchor="middle" fontWeight="bold">
          {dataItem.week}
        </text>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-w-[160px] border border-slate-700 dark:border-slate-100">
          <p className="text-sm font-bold mb-3">{data.week} - {data.displayDate}</p>
          <div className="flex justify-between items-center text-sm gap-6">
            <span className="flex items-center gap-2 text-slate-300 dark:text-slate-500">
              <div className="w-2 h-2 rounded-full bg-gold-400 dark:bg-gold-500"></div>
              Valor
            </span>
            <span className="font-bold text-white dark:text-slate-900">
              {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral do desempenho e atividades da clínica.</p>
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
              // Reset to current month
              setStartDate(startOfMonth(new Date()));
              setEndDate(endOfMonth(new Date()));
            }}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-slate-50 shadow-sm ml-2"
            title="Atualizar / Voltar para este mês"
          >
            <RotateCcw className="w-4 h-4 text-gold-600" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total de Pacientes" 
          value={patients.length} 
          change="" 
          icon={Users}
          color="bg-gold-500"
        />
        <StatCard 
          title={`Consultas ${startDate ? 'no Período' : ''}`} 
          value={filteredAppointments.length} 
          change="" 
          icon={CalendarCheck}
          color="bg-emerald-500"
        />
        <StatCard 
          title={`Faturamento ${startDate ? 'no Período' : ''}`} 
          value={`R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="" 
          icon={TrendingUp}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 medical-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Performance Financeira</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BEA44B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#BEA44B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={renderCustomXAxisTick} tickMargin={10} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="value" stroke="#BEA44B" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Mini-List */}
        <div className="medical-card p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Próximos Atendimentos</h3>
          <div className="space-y-6">
            {appointments
              .filter(a => new Date(a.date) >= new Date() && (a.status === 'scheduled' || a.status === 'ongoing' || a.status === 'confirmed'))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 4)
              .map((apt) => (
                <AppointmentItem 
                  key={apt.id}
                  time={format(new Date(apt.date), 'HH:mm')}
                  date={format(new Date(apt.date), 'dd/MM/yyyy')}
                  name={apt.patientName || 'Paciente'} 
                  type={apt.treatmentType} 
                />
            ))}
            {appointments.length === 0 && (
               <p className="text-sm text-slate-400">Nenhum atendimento próximo.</p>
            )}
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('agenda')}
            className="w-full mt-8 py-2.5 text-gold-600 text-sm font-semibold flex items-center justify-center gap-1 hover:bg-gold-50 rounded-xl transition-colors"
          >
            Ver agenda completa
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
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
        .react-calendar__tile--active,
        .react-calendar__tile--hasActive,
        .react-calendar__tile--range,
        .react-calendar__tile--rangeStart,
        .react-calendar__tile--rangeEnd,
        .react-calendar__tile--rangeBothEnds {
          background: var(--gold-500) !important;
          color: var(--color-white-override) !important;
          border-radius: 8px;
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

function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="medical-card p-6 group hover:border-gold-200 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} p-2.5 rounded-xl text-white shadow-lg shadow-gold-100`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}

function AppointmentItem({ time, date, name, type }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="bg-slate-50 px-2 py-1 rounded text-[11px] font-bold text-slate-600 group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors flex flex-col items-center">
        <span>{time}</span>
        <span className="text-[9px] opacity-70">{date}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900 leading-none">{name}</p>
        <p className="text-xs text-slate-400 mt-1">{type}</p>
      </div>
      <Clock className="w-4 h-4 text-slate-300 group-hover:text-gold-400 transition-colors" />
    </div>
  );
}
