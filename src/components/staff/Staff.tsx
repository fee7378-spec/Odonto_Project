import React, { useState, useEffect } from 'react';
import { Dentist } from '../../types';
import { UserPlus, Star, Shield, Clock, MoreHorizontal } from 'lucide-react';
import { dataService } from '../../services/dataService';

export default function Staff() {
  const [dentists, setDentists] = useState<Dentist[]>([]);

  useEffect(() => {
    const unsubscribe = dataService.subscribeDentists((list) => {
      setDentists(list);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Corpo Clínico e Equipe</h1>
          <p className="text-slate-500 mt-1">Gerencie os profissionais e permissões de acesso.</p>
        </div>
        <button 
          onClick={() => alert('Abrir formulário de contratação')}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-sky-100"
        >
          <UserPlus className="w-5 h-5" />
          <span>Contratar Profissional</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dentists.map((dentist) => (
          <div key={dentist.id} className="medical-card group cursor-pointer hover:border-sky-200 transition-all">
            <div className="h-24 bg-gradient-to-r from-sky-500 to-indigo-600 relative">
              <div className="absolute -bottom-10 left-6">
                <img 
                  src={dentist.photoUrl} 
                  alt={dentist.name} 
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
              </div>
            </div>
            <div className="pt-12 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{dentist.name}</h3>
                  <p className="text-sm font-medium text-sky-600">{dentist.specialty}</p>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comissão</p>
                  <p className="text-lg font-bold text-slate-700">{dentist.commission}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avaliação</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-slate-700">4.9</p>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Perfil: Dentista</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Carga Horária: 40h/semana</span>
                </div>
              </div>

              <button 
                onClick={() => alert(`Escala de ${dentist.name}`)}
                className="w-full mt-6 py-2.5 bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl font-bold text-sm transition-all"
              >
                Ver Escala de Horários
              </button>
            </div>
          </div>
        ))}

        {/* Add Staff Skeleton */}
        <div 
          onClick={() => alert('Adicionar novo colaborador')}
          className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 gap-4 text-slate-400 hover:bg-slate-50 hover:border-sky-200 hover:text-sky-600 cursor-pointer transition-all min-h-[350px]"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:scale-110 transition-transform">
            <UserPlus className="w-8 h-8 opacity-40" />
          </div>
          <p className="font-bold">Adicionar Colaborador</p>
        </div>
      </div>
    </div>
  );
}
